using BusinessLogic.Base;
using Common.DTOs.EVDriverDto;
using Common.DTOs.ProfileEVDriver;
using System;
using System.Threading.Tasks;

namespace BusinessLogic.IServices
{
    public interface IEVDriverService
    {
        //  EVDriver tạo profile cho bản thân mình khi tạo account 
        Task<IServiceResult> CreateProfile(EVDriverCreateProfileDto dto, Guid accountId);
        // Dùng để xem profile của chính bản thân mình 
        Task<IServiceResult> GetById(Guid driverId);
        // Dành cho EVDriver tự update thông tin của cá nhân
        Task<IServiceResult> UpdateProfile(EVDriverUpdateSelfDto dto);
        // Dành cho admin có thể thay đổi trạng thái của EVDriver 
        Task<IServiceResult> UpdateStatus(EVDriverUpdateStatusDto dto);
        //  Dành cho admin có thể xóa thông tin EVDriver (Soft delete) 
        Task<IServiceResult> Delete(Guid driverId);
    }
}
