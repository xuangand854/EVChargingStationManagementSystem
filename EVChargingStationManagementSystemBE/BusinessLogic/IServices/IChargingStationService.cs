using BusinessLogic.Base;
using Common.DTOs.ChargingStationDto;
using Common.Enum.ChargingStation;

namespace BusinessLogic.IServices
{
    public interface IChargingStationService
    {
        Task<IServiceResult> GetList();
        Task<IServiceResult> GetById(Guid stationId);
        Task<IServiceResult> Create(ChargingStationCreateDto dto);
        Task<IServiceResult> Update(ChargingStationUpdateDto dto, Guid stationId);
        Task<IServiceResult> UpdateStatus(ChargingStationStatus status, Guid stationId);
        Task<IServiceResult> Delete(Guid stationId);
    }
}
