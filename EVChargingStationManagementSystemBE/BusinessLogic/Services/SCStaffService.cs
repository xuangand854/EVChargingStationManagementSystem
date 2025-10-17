using BusinessLogic.Base;
using BusinessLogic.IServices;
using Common;
using Common.DTOs.ProfileStaffDto;
using Common.DTOs.VehicleModelDto;
using Infrastructure.IUnitOfWork;
using Infrastructure.Models;
using Mapster;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogic.Services
{
    public class SCStaffService(
        IUnitOfWork unitOfWork,
        UserManager<UserAccount> userManager
    ) : ISCStaffService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly UserManager<UserAccount> _userManager = userManager;

        //  Lấy danh sách tất cả Staff
        public async Task<IServiceResult> GetAll()
        {
            try
            {
                var staffs = await _unitOfWork.SCStaffRepository.GetAllAsync(
                    predicate: s => !s.IsDeleted,
                    include: q => q.Include(x => x.UserAccountNavigation),
                    orderBy: q => q.OrderByDescending(s => s.CreatedAt),
                    asNoTracking: true
                );

                if (staffs == null || staffs.Count == 0)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy nhân viên nào");

                var response = staffs.Adapt<List<StaffViewDto>>();
                return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, response);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        //  Lấy chi tiết nhân viên theo Id
        public async Task<IServiceResult> GetById(Guid id)
        {
            try
            {
                var staff = await _unitOfWork.SCStaffRepository.GetByIdAsync(
                    predicate: s => s.Id == id && !s.IsDeleted,
                    include: q => q.Include(x => x.UserAccountNavigation),
                    asNoTracking: true
                );

                if (staff == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy nhân viên");

                var response = staff.Adapt<StaffViewDto>();
                return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, response);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        //  Tạo tài khoản + hồ sơ nhân viên
        public async Task<IServiceResult> CreateAccountForStaff(StaffAccountCreateDto dto)
        {
            try
            {
                // Tạo UserAccount
                var user = dto.Adapt<UserAccount>();
                user.UserName = dto.Email;
                user.RegistrationDate = DateTime.UtcNow;
                user.Status = "Active";
                user.CreatedAt = DateTime.UtcNow;
                user.UpdatedAt = DateTime.UtcNow;

                var result = await _userManager.CreateAsync(user, dto.Password);
                if (!result.Succeeded)
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Không thể tạo tài khoản", result.Errors);

                // Gán role Staff
                var roleResult = await _userManager.AddToRoleAsync(user, "Staff");
                if (!roleResult.Succeeded)
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Không thể gán quyền cho nhân viên", roleResult.Errors);

                // Tạo hồ sơ Staff
                var staff = dto.Adapt<SCStaffProfile>();
                staff.Id = Guid.NewGuid();
                staff.AccountId = user.Id;
                staff.Status = "Active";
                staff.CreatedAt = DateTime.UtcNow;
                staff.UpdatedAt = DateTime.UtcNow;
                staff.IsDeleted = false;

                await _unitOfWork.SCStaffRepository.CreateAsync(staff);
                await _unitOfWork.SaveChangesAsync();
                var response = staff.Adapt<StaffViewDto>();
                return new ServiceResult(Const.SUCCESS_CREATE_CODE, "Tạo tài khoản và hồ sơ nhân viên thành công",response);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        //  Admin cập nhật hồ sơ nhân viên
        public async Task<IServiceResult> UpdateProfileByAdmin(StaffUpdateAdminDto dto)
        {
            try
            {
                var staff = await _unitOfWork.SCStaffRepository.GetByIdAsync(
                    predicate: s => s.Id == dto.StaffId && !s.IsDeleted,
                    include: q => q.Include(x => x.UserAccountNavigation),
                    asNoTracking: false
                );

                if (staff == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy nhân viên");

                // Map vào SCStaff
                dto.Adapt(staff);
                staff.UpdatedAt = DateTime.UtcNow;

                // Map vào UserAccount
                if (staff.UserAccountNavigation != null)
                {
                    dto.Adapt(staff.UserAccountNavigation);
                    staff.UserAccountNavigation.UpdatedAt = DateTime.UtcNow;
                }

                var result = await _unitOfWork.SaveChangesAsync();
                if (result <= 0)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, Const.FAIL_UPDATE_MSG);

                var response = staff.Adapt<StaffViewDto>();
                return new ServiceResult(Const.SUCCESS_UPDATE_CODE, Const.SUCCESS_UPDATE_MSG, response);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        //   Nhân viên tự cập nhật hồ sơ
        public async Task<IServiceResult> UpdateProfileByStaff(StaffUpdateDto dto)
        {
            try
            {
                var staff = await _unitOfWork.SCStaffRepository.GetByIdAsync(
                    predicate: s => s.Id == dto.StaffId && !s.IsDeleted,
                    include: q => q.Include(x => x.UserAccountNavigation),
                    asNoTracking: false
                );

                if (staff == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy nhân viên");

                dto.Adapt(staff);
                staff.UpdatedAt = DateTime.UtcNow;

                if (staff.UserAccountNavigation != null)
                {
                    dto.Adapt(staff.UserAccountNavigation);
                    staff.UserAccountNavigation.UpdatedAt = DateTime.UtcNow;
                }

                var result = await _unitOfWork.SaveChangesAsync();
                if (result <= 0)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, Const.FAIL_UPDATE_MSG);

                var response = staff.Adapt<StaffViewDto>();
                return new ServiceResult(Const.SUCCESS_UPDATE_CODE, Const.SUCCESS_UPDATE_MSG, response);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        //   Cập nhật trạng thái nhân viên
        public async Task<IServiceResult> UpdateStaffStatus(StaffUpdateStatusDto dto)
        {
            try
            {
                var staff = await _unitOfWork.SCStaffRepository.GetByIdAsync(
                    predicate: s => s.Id == dto.StaffId && !s.IsDeleted,
                    asNoTracking: false
                );

                if (staff == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy nhân viên");

                staff.Status = dto.Status;
                staff.UpdatedAt = DateTime.UtcNow;

                var result = await _unitOfWork.SaveChangesAsync();
                if (result <= 0)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, Const.FAIL_UPDATE_MSG);

                var response = staff.Adapt<StaffViewDto>();
                return new ServiceResult(Const.SUCCESS_UPDATE_CODE, Const.SUCCESS_UPDATE_MSG, response);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        //   Xóa mềm nhân viên
        public async Task<IServiceResult> Delete(Guid staffId)
        {
            try
            {
                var staff = await _unitOfWork.SCStaffRepository.GetByIdAsync(
                    predicate: s => s.Id == staffId && !s.IsDeleted,
                    asNoTracking: false
                );

                if (staff == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy nhân viên");

                staff.IsDeleted = true;
                staff.Status = "Inactive";
                staff.UpdatedAt = DateTime.UtcNow;

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
    }
}
