using BusinessLogic.Base;
using BusinessLogic.IServices;
using Common;
using Common.DTOs.EVDriverDto;
using Common.DTOs.ProfileEVDriver;
using Infrastructure.IUnitOfWork;
using Infrastructure.Models;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogic.Services
{
    public class EVDriverService(IUnitOfWork unitOfWork) : IEVDriverService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;

        /// EVDriver tự tạo profile (mỗi account chỉ có 1 profile EVDriver)
        public async Task<IServiceResult> CreateProfile(EVDriverCreateProfileDto dto, Guid accountId)
        {
            try
            {
                // 1. Kiểm tra account đã có profile EVDriver chưa
                var existingDriver = await _unitOfWork.EVDriverRepository.GetByIdAsync(
                    predicate: d => d.AccountId == accountId,
                    asNoTracking: true
                );

                if (existingDriver != null)
                {
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Tài khoản này đã có profile EVDriver");
                }

                // 2. Map dto -> entity
                var driver = dto.Adapt<EVDriver>();
                driver.Id = Guid.NewGuid();
                driver.AccountId = accountId;
                driver.Status = dto.Status ?? "Active";
                driver.UpdatedAt = DateTime.UtcNow;
                driver.IsDeleted = false;

                await _unitOfWork.EVDriverRepository.CreateAsync(driver);
                var result = await _unitOfWork.SaveChangesAsync();

                if (result > 0)
                {
                    var response = driver.Adapt<EVDriverViewDto>();
                    return new ServiceResult(Const.SUCCESS_CREATE_CODE, Const.SUCCESS_CREATE_MSG, response);
                }

                return new ServiceResult(Const.FAIL_CREATE_CODE, Const.FAIL_CREATE_MSG);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
        /// Lấy profile EVDriver theo Id
        public async Task<IServiceResult> GetById(Guid driverId)
        {
            var driver = await _unitOfWork.EVDriverRepository.GetByIdAsync(
                predicate: d => d.Id == driverId,
                include: d => d.Include(x => x.UserAccountNavigation)
                               .Include(x => x.RankingNavigation)
                               .Include(x => x.UserVehicles).ThenInclude(uv => uv.VehicleModelNavigation),
                asNoTracking: true
            );

            if (driver == null)
                return new ServiceResult(Const.FAIL_READ_CODE, "Không tìm thấy EVDriver");
            
            var dto = driver.Adapt<EVDriverViewDto>();
            return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, dto);
        }

        /// EVDriver tự update profile (không update Score, Ranking)
        public async Task<IServiceResult> UpdateProfile(EVDriverUpdateSelfDto dto)
        {
            try
            {
                // Lấy id của EVDriver ra để checck xem EVDriver có tồn tại bên trong DB ch 
                var driver = await _unitOfWork.EVDriverRepository.GetByIdAsync(
                    predicate: d => d.Id == dto.DriverId,
                    include: d => d.Include(x => x.UserAccountNavigation),
                    asNoTracking: false
                );

                if (driver == null)
                    return new ServiceResult(Const.FAIL_READ_CODE, "Không tìm thấy EVDriver");

                // Cập nhật thông tin của lái xe 
                if (driver.UserAccountNavigation != null)
                    driver.UserAccountNavigation.Name = dto.Name ?? driver.UserAccountNavigation.Name;
                {
                    driver.UserAccountNavigation.Address = dto.Address ?? driver.UserAccountNavigation.Address;
                    driver.UserAccountNavigation.PhoneNumber = dto.PhoneNumber ?? driver.UserAccountNavigation.PhoneNumber;
                    driver.UserAccountNavigation.ProfilePictureUrl = dto.ProfilePictureUrl ?? driver.UserAccountNavigation.ProfilePictureUrl;
                    driver.UserAccountNavigation.UpdatedAt = DateTime.UtcNow;
                }
                // ghi lại thời gian cậ nhật thông tin 
                driver.UpdatedAt = DateTime.UtcNow;

                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                {
                    var response = driver.Adapt<EVDriverViewDto>();
                    return new ServiceResult(Const.SUCCESS_UPDATE_CODE, Const.SUCCESS_UPDATE_MSG, response);
                }

                return new ServiceResult(Const.FAIL_UPDATE_CODE, Const.FAIL_UPDATE_MSG);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        /// Admin chỉ được update Status
        public async Task<IServiceResult> UpdateStatus(EVDriverUpdateStatusDto dto)
        {
            try
            {
                var driver = await _unitOfWork.EVDriverRepository.GetByIdAsync(
                    predicate: d => d.Id == dto.DriverId,
                    asNoTracking: false
                );

                if (driver == null)
                    return new ServiceResult(Const.FAIL_READ_CODE, "Không tìm thấy EVDriver");

                driver.Status = dto.Status.ToString();
                driver.UpdatedAt = DateTime.UtcNow;

                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                {
                    var response = driver.Adapt<EVDriverViewDto>();
                    return new ServiceResult(Const.SUCCESS_UPDATE_CODE, Const.SUCCESS_UPDATE_MSG, response);
                }

                return new ServiceResult(Const.FAIL_UPDATE_CODE, Const.FAIL_UPDATE_MSG);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

      // Xóa mềm 
        public async Task<IServiceResult> Delete(Guid driverId)
        {
            try
            {
                var driver = await _unitOfWork.EVDriverRepository.GetByIdAsync(
                    predicate: d => d.Id == driverId,
                    asNoTracking: false
                );

                if (driver == null)
                    return new ServiceResult(Const.FAIL_READ_CODE, "Không tìm thấy EVDriver");

                driver.IsDeleted = true;
                driver.Status = "Inactive";
                driver.UpdatedAt = DateTime.UtcNow;

                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                    return new ServiceResult(Const.SUCCESS_DELETE_CODE, Const.SUCCESS_DELETE_MSG);

                return new ServiceResult(Const.FAIL_DELETE_CODE, Const.FAIL_DELETE_MSG);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
    }
}
