using BusinessLogic.Base;
using BusinessLogic.IServices;
using Common;
using Common.DTOs.ProfileStaffDto;
using Infrastructure.IUnitOfWork;
using Infrastructure.Models;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogic.Services
{
    public class SCStaffService(IUnitOfWork unitOfWork) : ISCStaffService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;

        // Get staff by Id
        public async Task<IServiceResult> GetById(Guid id)
        {
            var staff = await _unitOfWork.SCStaffRepository.GetByIdAsync(
                predicate: s => s.Id == id,
                include: q => q.Include(x => x.UserAccountNavigation),
                asNoTracking: true
            );

            if (staff == null)
                return new ServiceResult(Const.FAIL_READ_CODE, "Không tìm thấy nhân viên");

            var dto = staff.Adapt<StaffViewDto>();
            return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, dto);
        }

        //  Create staff profile (Admin)
        public async Task<IServiceResult> CreateStaffProfile(StaffCreateProfileDto dto, Guid accountId)
        {
            try
            {
                // Check trùng profile theo accountId
                var exist = await _unitOfWork.SCStaffRepository.GetByIdAsync(
                    predicate: s => s.AccountId == accountId,
                    asNoTracking: true
                );
                if (exist != null)
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Tài khoản đã có profile");

                var staff = dto.Adapt<SCStaff>();
                staff.Id = Guid.NewGuid();
                staff.AccountId = accountId;
                staff.Status = dto.Status ?? "Active";
                staff.CreatedAt = DateTime.UtcNow;
                staff.UpdatedAt = DateTime.UtcNow;
                staff.IsDeleted = false;

                await _unitOfWork.SCStaffRepository.CreateAsync(staff);
                var result = await _unitOfWork.SaveChangesAsync();

                if (result > 0)
                {
                    var response = staff.Adapt<StaffViewDto>();
                    return new ServiceResult(Const.SUCCESS_CREATE_CODE, Const.SUCCESS_CREATE_MSG, response);
                }
                return new ServiceResult(Const.FAIL_CREATE_CODE, Const.FAIL_CREATE_MSG);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        //  Update profile by Admin
        public async Task<IServiceResult> UpdateProfileByAdmin(StaffUpdateAdminDto dto)
        {
            try
            {
                // 1. Lấy Staff theo Id + UserAccount
                var staff = await _unitOfWork.SCStaffRepository.GetByIdAsync(
                    predicate: s => s.Id == dto.StaffId,
                    include: q => q.Include(x => x.UserAccountNavigation),
                    asNoTracking: false // bắt buộc để EF tracking
                );

                if (staff == null)
                    return new ServiceResult(Const.FAIL_READ_CODE, "Không tìm thấy nhân viên trong hệ thống");

                // 2. Admin có quyền cập nhật toàn bộ thông tin Staff
                staff.WorkingLocation = dto.WorkingLocation ?? staff.WorkingLocation;
                staff.Status = dto.Status ?? staff.Status;
                staff.UpdatedAt = DateTime.UtcNow;

                // 3. Cập nhật thông tin trong bảng UserAccount liên quan
                if (staff.UserAccountNavigation != null)
                {
                    staff.UserAccountNavigation.Name = dto.Name ?? staff.UserAccountNavigation.Name;
                    staff.UserAccountNavigation.Email = dto.Email ?? staff.UserAccountNavigation.Email;
                    staff.UserAccountNavigation.PhoneNumber = dto.PhoneNumber ?? staff.UserAccountNavigation.PhoneNumber;
                    staff.UserAccountNavigation.Address = dto.Address ?? staff.UserAccountNavigation.Address;
                    staff.UserAccountNavigation.ProfilePictureUrl = dto.ProfilePictureUrl ?? staff.UserAccountNavigation.ProfilePictureUrl;
                    staff.UserAccountNavigation.UpdatedAt = DateTime.UtcNow;
                }

                // 4. Lưu thay đổi
                var result = await _unitOfWork.SaveChangesAsync();
                if (result <= 0)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, Const.FAIL_UPDATE_MSG);

                // 5. Map sang ViewDto thủ công để chắc chắn đầy đủ dữ liệu
                var response = new StaffViewDto
                {
                    Id = staff.Id,
                    AccountId = staff.AccountId,
                    WorkingLocation = staff.WorkingLocation,
                    Status = staff.Status,
                    CreatedAt = staff.CreatedAt,
                    UpdatedAt = staff.UpdatedAt,

                    Name = staff.UserAccountNavigation?.Name,
                    Email = staff.UserAccountNavigation?.Email,
                    PhoneNumber = staff.UserAccountNavigation?.PhoneNumber,
                    Address = staff.UserAccountNavigation?.Address,
                    ProfilePictureUrl = staff.UserAccountNavigation?.ProfilePictureUrl
                };

                return new ServiceResult(Const.SUCCESS_UPDATE_CODE, Const.SUCCESS_UPDATE_MSG, response);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }


        //  Update profile by Staff (chỉ được sửa số điện thoại, địa chỉ, avatar)
        public async Task<IServiceResult> UpdateProfileByStaff(StaffUpdateDto dto)
        {
            try
            {
                var staff = await _unitOfWork.SCStaffRepository.GetByIdAsync(
                    predicate: s => s.Id == dto.StaffId,
                    include: q => q.Include(x => x.UserAccountNavigation),
                    asNoTracking: false
                );

                if (staff == null)
                    return new ServiceResult(Const.FAIL_READ_CODE, "Không tìm thấy thông tin nhân viên");

                // Cập nhật các thông tin mà Staff được phép chỉnh
                if (staff.UserAccountNavigation != null)
                {
                    staff.UserAccountNavigation.PhoneNumber = dto.PhoneNumber ?? staff.UserAccountNavigation.PhoneNumber;
                    staff.UserAccountNavigation.Address = dto.Address ?? staff.UserAccountNavigation.Address;
                    staff.UserAccountNavigation.ProfilePictureUrl = dto.ProfilePictureUrl ?? staff.UserAccountNavigation.ProfilePictureUrl;
                    staff.UserAccountNavigation.UpdatedAt = DateTime.UtcNow;
                }

                staff.UpdatedAt = DateTime.UtcNow;

                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                {
                    // Map thủ công để lấy đủ thông tin
                    var response = new StaffViewDto
                    {
                        Id = staff.Id,
                        AccountId = staff.AccountId,
                        WorkingLocation = staff.WorkingLocation,
                        Status = staff.Status,
                        CreatedAt = staff.CreatedAt,
                        UpdatedAt = staff.UpdatedAt,

                        Name = staff.UserAccountNavigation?.Name,
                        Email = staff.UserAccountNavigation?.Email,
                        PhoneNumber = staff.UserAccountNavigation?.PhoneNumber,
                        Address = staff.UserAccountNavigation?.Address,
                        ProfilePictureUrl = staff.UserAccountNavigation?.ProfilePictureUrl
                    };

                    return new ServiceResult(Const.SUCCESS_UPDATE_CODE, Const.SUCCESS_UPDATE_MSG, response);
                }

                return new ServiceResult(Const.FAIL_UPDATE_CODE, Const.FAIL_UPDATE_MSG);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }


        //  Update staff status (Admin)
        public async Task<IServiceResult> UpdateStaffStatus(StaffUpdateStatusDto dto)
        {
            try
            {
                var staff = await _unitOfWork.SCStaffRepository.GetByIdAsync(
                    predicate: s => s.Id == dto.StaffId,
                    asNoTracking: false
                );
                if (staff == null)
                    return new ServiceResult(Const.FAIL_READ_CODE, "Không tìm thấy nhân viên");

                staff.Status = dto.Status;
                staff.UpdatedAt = DateTime.UtcNow;

                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                {
                    var response = staff.Adapt<StaffViewDto>();
                    return new ServiceResult(Const.SUCCESS_UPDATE_CODE, Const.SUCCESS_UPDATE_MSG, response);
                }
                return new ServiceResult(Const.FAIL_UPDATE_CODE, Const.FAIL_UPDATE_MSG);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        //  Delete staff (soft delete)
        public async Task<IServiceResult> Delete(Guid staffId)
        {
            try
            {
                var staff = await _unitOfWork.SCStaffRepository.GetByIdAsync(
                    predicate: s => s.Id == staffId,
                    asNoTracking: false
                );
                if (staff == null)
                    return new ServiceResult(Const.FAIL_READ_CODE, "Không tìm thấy nhân viên");

                staff.IsDeleted = true;
                staff.Status = "Inactive";
                staff.UpdatedAt = DateTime.UtcNow;

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
