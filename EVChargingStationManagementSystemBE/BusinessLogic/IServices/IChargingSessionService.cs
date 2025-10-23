using BusinessLogic.Base;
using Common.DTOs.ChargingSessionDto;

namespace BusinessLogic.IServices
{
    public interface IChargingSessionService
    {
        Task<IServiceResult> GetList(Guid userId);
        Task<IServiceResult> GetById(Guid SessionId, Guid userId);
        Task<IServiceResult> Start(ChargingSessionStartDto dto);
        Task<IServiceResult> Stop(ChargingSessionStopDto dto, Guid sessionId);
    }
}
