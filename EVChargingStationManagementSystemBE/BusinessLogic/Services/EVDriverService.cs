using BusinessLogic.Base;
using BusinessLogic.IServices;
using Common;
using Common.DTOs.ProfileEVDriverDto;
using Infrastructure.IUnitOfWork;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogic.Services
{
    public class EVDriverService(
        IUnitOfWork unitOfWork
    ) : IEVDriverService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;

        //  Lấy danh sách tất cả EVDriver
        public async Task<IServiceResult> GetAll()
        {
            try
            {
                var drivers = await _unitOfWork.EVDriverRepository.GetAllAsync(
                    predicate: d => !d.IsDeleted,
                    include: q => q
                        .Include(d => d.UserAccount)
                        .Include(d => d.Ranking)
                        .Include(d => d.UserVehicles)
                        .ThenInclude(uv => uv.VehicleModel),
                    orderBy: q => q.OrderByDescending(d => d.CreatedAt),
                    asNoTracking: true
                );

                if (drivers == null || drivers.Count == 0)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy EVDriver nào");

                var response = drivers.Adapt<List<EVDriverViewDto>>();
                return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, response);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        //  Lấy chi tiết EVDriver theo Id
        public async Task<IServiceResult> GetById(Guid driverId)
        {
            try
            {
                var driver = await _unitOfWork.EVDriverRepository.GetByIdAsync(
                    predicate: d => d.Id == driverId && !d.IsDeleted,
                    include: q => q
                        .Include(d => d.UserAccount)
                        .Include(d => d.Ranking)
                        .Include(d => d.UserVehicles)
                        .ThenInclude(uv => uv.VehicleModel),
                    asNoTracking: true
                );

                if (driver == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy EVDriver");

                var response = driver.Adapt<EVDriverViewDto>();
                return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, response);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        //  EVDriver tự cập nhật hồ sơ
        public async Task<IServiceResult> UpdateProfile(EVDriverUpdateSelfDto dto)
        {
            try
            {
                var driver = await _unitOfWork.EVDriverRepository.GetByIdAsync(
                    predicate: d => d.Id == dto.DriverId && !d.IsDeleted,
                    include: q => q.Include(d => d.UserAccount),
                    asNoTracking: false
                );

                if (driver == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy EVDriver");

                dto.Adapt(driver);
                driver.UpdatedAt = DateTime.UtcNow;

                if (driver.UserAccount != null)
                {
                    dto.Adapt(driver.UserAccount);
                    driver.UserAccount.UpdatedAt = DateTime.UtcNow;
                }

                var result = await _unitOfWork.SaveChangesAsync();
                if (result <= 0)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, Const.FAIL_UPDATE_MSG);

                var response = driver.Adapt<EVDriverViewDto>();
                return new ServiceResult(Const.SUCCESS_UPDATE_CODE, Const.SUCCESS_UPDATE_MSG, response);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        //  Admin cập nhật trạng thái EVDriver
        public async Task<IServiceResult> UpdateStatus(EVDriverUpdateStatusDto dto)
        {
            try
            {
                var driver = await _unitOfWork.EVDriverRepository.GetByIdAsync(
                    predicate: d => d.Id == dto.DriverId && !d.IsDeleted,
                    asNoTracking: false
                );

                if (driver == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy EVDriver");

                driver.Status = dto.Status;
                driver.UpdatedAt = DateTime.UtcNow;

                var result = await _unitOfWork.SaveChangesAsync();
                if (result <= 0)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, Const.FAIL_UPDATE_MSG);

                var response = driver.Adapt<EVDriverViewDto>();
                return new ServiceResult(Const.SUCCESS_UPDATE_CODE, Const.SUCCESS_UPDATE_MSG, response);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        //  Xóa mềm EVDriver
        public async Task<IServiceResult> Delete(Guid driverId)
        {
            try
            {
                var driver = await _unitOfWork.EVDriverRepository.GetByIdAsync(
                    predicate: d => d.Id == driverId && !d.IsDeleted,
                    asNoTracking: false
                );

                if (driver == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy EVDriver");

                driver.IsDeleted = true;
                driver.Status = "Inactive";
                driver.UpdatedAt = DateTime.UtcNow;

                var result = await _unitOfWork.SaveChangesAsync();
                if (result <= 0)
                    return new ServiceResult(Const.FAIL_DELETE_CODE, Const.FAIL_DELETE_MSG);

                return new ServiceResult(Const.SUCCESS_DELETE_CODE, Const.SUCCESS_DELETE_MSG);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
        // EVDriver tự xem hồ sơ của mình
        public async Task<IServiceResult> GetMyProfile(Guid currentUserId)
        {
            try
            {
                //  Ở đây dùng AccountId vì entity không có UserAccountId
                var driver = await _unitOfWork.EVDriverRepository.GetByIdAsync(
                    predicate: d => d.AccountId == currentUserId && !d.IsDeleted,
                    include: q => q
                        .Include(d => d.UserAccount)
                        .Include(d => d.Ranking)
                        .Include(d => d.UserVehicles)
                            .ThenInclude(uv => uv.VehicleModel),
                    asNoTracking: true
                );

                if (driver == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE,
                        "Không tìm thấy hồ sơ tài xế tương ứng với tài khoản hiện tại.");

                var response = driver.Adapt<EVDriverViewDto>();
                return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, response);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
    }
    }
