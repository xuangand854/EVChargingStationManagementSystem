using BusinessLogic.Base;
using Common.DTOs.EVDriverDto;
using Common.DTOs.ProfileEVDriver;
using System;
using System.Threading.Tasks;

namespace BusinessLogic.IServices
{
    public interface IEVDriverService
    {
        Task<IServiceResult> CreateProfile(EVDriverCreateProfileDto dto, Guid accountId);
        Task<IServiceResult> GetById(Guid driverId);
        Task<IServiceResult> UpdateProfile(EVDriverUpdateSelfDto dto);
        Task<IServiceResult> UpdateStatus(EVDriverUpdateStatusDto dto);
        Task<IServiceResult> Delete(Guid driverId);
    }
}
