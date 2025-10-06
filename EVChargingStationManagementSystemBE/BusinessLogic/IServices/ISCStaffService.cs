using BusinessLogic.Base;
using Common.DTOs.AccountDto;
using Common.DTOs.ProfileStaffDto;

namespace BusinessLogic.IServices
{
    public interface ISCStaffService
    {
        // Lấy thông tin staff theo Id
        Task<IServiceResult> GetById(Guid id);

        // Admin tạo profile staff mới
        Task<IServiceResult> CreateStaffProfile(StaffCreateProfileDto dto, Guid accountId);

        // Admin update profile staff
        Task<IServiceResult> UpdateProfileByAdmin(StaffUpdateAdminDto dto);

        // Staff tự update profile của mình
        Task<IServiceResult> UpdateProfileByStaff(StaffUpdateDto dto);

        // Admin thay đổi trạng thái staff
        Task<IServiceResult> UpdateStaffStatus(StaffUpdateStatusDto dto);

        // Admin xóa staff (soft delete)
        Task<IServiceResult> Delete(Guid staffId);
        // Admin tạo account cho staff 
        //Task<IServiceResult> CreateAccountForStaff(StaffAccountCreateDto dto);

    }
}
