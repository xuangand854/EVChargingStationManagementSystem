using BusinessLogic.Base;
using Common.DTOs.ProfileEVDriverDto;
using System;
using System.Threading.Tasks;

namespace BusinessLogic.IServices
{
    public interface IEVDriverService
    {
        // Admin xem danh sách tất cả EVDriver
        Task<IServiceResult> GetAll();

        // EVDriver hoặc Admin xem chi tiết EVDriver theo Id
        Task<IServiceResult> GetById(Guid driverId);

        // EVDriver xem hồ sơ của chính mình (lấy từ token)
        Task<IServiceResult> GetMyProfile(Guid currentUserId);

        // EVDriver tự cập nhật thông tin cá nhân
        Task<IServiceResult> UpdateProfile(EVDriverUpdateSelfDto dto);

        // Admin cập nhật trạng thái EVDriver (Active / Inactive)
        Task<IServiceResult> UpdateStatus(EVDriverUpdateStatusDto dto);

        // Admin xóa mềm EVDriver
        Task<IServiceResult> Delete(Guid driverId);
    }
}
