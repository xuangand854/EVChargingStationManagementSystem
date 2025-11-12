using BusinessLogic.Base;
using BusinessLogic.IServices;
using Common;
using Common.DTOs.VoucherDto;
using Infrastructure.IUnitOfWork;
using Infrastructure.Models;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogic.Services
{
    public class VoucherService(IUnitOfWork unitOfWork) : IVoucherService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;

        // Lấy danh sách voucher còn hiệu lực
        public async Task<IServiceResult> GetAvailableVouchers()
        {
            try
            {
                var vouchers = await _unitOfWork.VoucherRepository.GetQueryable()
                    .AsNoTracking()
                    .Where(v => v.IsActive
                                && v.ValidFrom <= DateTime.Now
                                && v.ValidTo >= DateTime.Now)
                    .OrderByDescending(v => v.ValidFrom)
                    .ProjectToType<VoucherDto>()
                    .ToListAsync();

                if (vouchers == null || vouchers.Count == 0)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy voucher nào còn hiệu lực");

                return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, vouchers);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        // Tạo voucher mới
        public async Task<IServiceResult> CreateVoucher(VoucherCreateDto dto)
        {
            try
            {
                var voucher = dto.Adapt<Voucher>();
                voucher.Id = Guid.NewGuid();
                voucher.IsActive = true;

                await _unitOfWork.VoucherRepository.CreateAsync(voucher);
                var result = await _unitOfWork.SaveChangesAsync();

                if (result > 0)
                {
                    var response = voucher.Adapt<VoucherDto>();
                    return new ServiceResult(Const.SUCCESS_CREATE_CODE, Const.SUCCESS_CREATE_MSG, response);
                }
                return new ServiceResult(Const.FAIL_CREATE_CODE, Const.FAIL_CREATE_MSG);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        // Cập nhật voucher
        public async Task<IServiceResult> UpdateVoucher(VoucherUpdateDto dto, Guid voucherId)
        {
            try
            {
                var voucher = await _unitOfWork.VoucherRepository.GetByIdAsync(
                    predicate: v => v.Id == voucherId,
                    asNoTracking: false
                );

                if (voucher == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Voucher không tồn tại");

                voucher = dto.Adapt(voucher);
                voucher.Id = voucherId;

                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                {
                    var response = voucher.Adapt<VoucherDto>();
                    return new ServiceResult(Const.SUCCESS_UPDATE_CODE, Const.SUCCESS_UPDATE_MSG, response);
                }
                return new ServiceResult(Const.FAIL_UPDATE_CODE, Const.FAIL_UPDATE_MSG);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        // Redeem voucher
        public async Task<IServiceResult> RedeemVoucher(Guid evDriverId, Guid voucherId)
        {
            try
            {
                var driver = await _unitOfWork.EVDriverRepository.GetByIdAsync(
                    predicate: d => d.Id == evDriverId,
                    asNoTracking: false
                );
                var voucher = await _unitOfWork.VoucherRepository.GetByIdAsync(
                    predicate: v => v.Id == voucherId,
                    asNoTracking: true
                );

                if (driver == null || voucher == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy user hoặc voucher");

                if (driver.Point < voucher.RequiredPoints)
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Điểm thưởng không đủ để đổi voucher này");

                driver.Point -= voucher.RequiredPoints;
                driver.UpdatedAt = DateTime.Now;

                // Tạo UserVoucher
                var userVoucher = new UserVoucher
                {
                    Id = Guid.NewGuid(),
                    EVDriverId = evDriverId,
                    VoucherId = voucherId,
                    AssignedDate = DateTime.Now,
                    RedeemDate = DateTime.Now,
                    ExpiryDate = voucher.ValidTo,
                    Status = "Redeemed"
                };

                await _unitOfWork.UserVoucherRepository.CreateAsync(userVoucher);
                var result = await _unitOfWork.SaveChangesAsync();

                if (result > 0)
                {
                    var response = userVoucher.Adapt<UserVoucherDto>();
                    return new ServiceResult(Const.SUCCESS_CREATE_CODE, "Đổi voucher thành công", response);
                }
                return new ServiceResult(Const.FAIL_CREATE_CODE, Const.FAIL_CREATE_MSG);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        // Sử dụng voucher
        public async Task<IServiceResult> UseVoucher(Guid userVoucherId, Guid stationId)
        {
            try
            {
                var userVoucher = await _unitOfWork.UserVoucherRepository.GetByIdAsync(
                    predicate: uv => uv.Id == userVoucherId,
                    asNoTracking: false
                );

                if (userVoucher == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Voucher không tồn tại");

                if (userVoucher.Status != "Redeemed")
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Voucher chưa được redeem hoặc đã hết hạn");

                userVoucher.UsedDate = DateTime.Now;
                userVoucher.StationId = stationId;
                userVoucher.Status = "Used";

                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                {
                    var response = userVoucher.Adapt<UserVoucherDto>();
                    return new ServiceResult(Const.SUCCESS_UPDATE_CODE, "Sử dụng voucher thành công", response);
                }
                return new ServiceResult(Const.FAIL_UPDATE_CODE, Const.FAIL_UPDATE_MSG);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        // Background job: Expire voucher
        public async Task<IServiceResult> ExpireVoucher(Guid userVoucherId)
        {
            try
            {
                var userVoucher = await _unitOfWork.UserVoucherRepository.GetByIdAsync(
                    predicate: uv => uv.Id == userVoucherId,
                    asNoTracking: false
                );

                if (userVoucher == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Voucher không tồn tại");

                if (userVoucher.ExpiryDate < DateTime.Now && userVoucher.Status != "Used")
                {
                    userVoucher.Status = "Expired";
                }

                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                    return new ServiceResult(Const.SUCCESS_UPDATE_CODE, "Voucher đã hết hạn");
                else
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, Const.FAIL_UPDATE_MSG);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
            public async Task<IServiceResult> DeleteVoucher(Guid voucherId)
        {
            try
            {
                var voucher = await _unitOfWork.VoucherRepository.GetByIdAsync(
                    predicate: v => v.Id == voucherId,
                    asNoTracking: false
                );

                if (voucher == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Voucher không tồn tại");

                // Soft delete
                voucher.IsActive = false;

                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                    return new ServiceResult(Const.SUCCESS_DELETE_CODE, "Xoá voucher thành công");
                else
                    return new ServiceResult(Const.FAIL_DELETE_CODE, Const.FAIL_DELETE_MSG);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

    }
}

