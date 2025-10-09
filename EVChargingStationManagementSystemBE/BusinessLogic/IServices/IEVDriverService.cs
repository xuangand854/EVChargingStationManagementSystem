using BusinessLogic.Base;
using Common.DTOs.ProfileEVDriverDto;
using System;
using System.Threading.Tasks;

namespace BusinessLogic.IServices
{
    public interface IEVDriverService
    {
    

        // EVDriver xem profile của chính mình
        Task<IServiceResult> GetById(Guid driverId);

        // EVDriver tự cập nhật thông tin cá nhân
        Task<IServiceResult> UpdateProfile(EVDriverUpdateSelfDto dto);

        // Admin cập nhật trạng thái EVDriver (Active / Inactive)
        Task<IServiceResult> UpdateStatus(EVDriverUpdateStatusDto dto);

        // Admin xóa mềm EVDriver
        Task<IServiceResult> Delete(Guid driverId);

        // Admin xem danh sách tất cả EVDriver
        Task<IServiceResult> GetAll();
    }
}
