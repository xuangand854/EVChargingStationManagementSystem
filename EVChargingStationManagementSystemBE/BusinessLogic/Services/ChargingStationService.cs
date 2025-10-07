using BusinessLogic.Base;
using BusinessLogic.IServices;
using Common;
using Common.DTOs.ChargingStationDto;
using Common.DTOs.VehicleModelDto;
using Common.Enum.ChargingStation;
using Common.Enum.VehicleModel;
using Infrastructure.IUnitOfWork;
using Infrastructure.Models;
using Mapster;

namespace BusinessLogic.Services
{
    public class ChargingStationService(IUnitOfWork unitOfWork) : IChargingStationService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;

        public async Task<IServiceResult> GetList()
        {

            try
            {
                var chargingStation = await _unitOfWork.ChargingStationRepository.GetAllAsync(
                    predicate: v => !v.IsDeleted,
                    orderBy: q => q.OrderByDescending(v => v.CreatedAt)
                    );
                if (chargingStation == null || chargingStation.Count == 0)
                    return new ServiceResult(
                        Const.WARNING_NO_DATA_CODE,
                        "Không tìm thấy trạm sạc nào");

                else
                {
                    var response = chargingStation.Adapt<List<ChargingStationViewGeneralDto>>();
                    return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, response);
                }
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<IServiceResult> GetById(Guid StationId)
        {

            try
            {
                var chargingStation = await _unitOfWork.ChargingStationRepository.GetByIdAsync(
                    predicate: v => !v.IsDeleted && v.Id == StationId
                    );
                if (chargingStation == null)
                    return new ServiceResult(
                        Const.WARNING_NO_DATA_CODE,
                        "Không tìm thấy trạm sạc nào"
                    );

                else
                {
                    var response = chargingStation.Adapt<ChargingStationViewGeneralDto>();
                    return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, response);
                }
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<IServiceResult> Create(ChargingStationCreateDto dto)
        {
            try
            {
                var chargingStation = dto.Adapt<ChargingStation>();
                chargingStation.Id = Guid.NewGuid();
                chargingStation.Status = "Inactive";
                chargingStation.CreatedAt = DateTime.Now;
                chargingStation.UpdatedAt = DateTime.Now;

                await _unitOfWork.ChargingStationRepository.CreateAsync(chargingStation);
                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                {
                    var response = chargingStation.Adapt<ChargingStationViewGeneralDto>();
                    return new ServiceResult(Const.SUCCESS_CREATE_CODE, Const.SUCCESS_CREATE_MSG, response);
                }
                else
                    return new ServiceResult(Const.FAIL_CREATE_CODE, Const.FAIL_CREATE_MSG);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<IServiceResult> Update(ChargingStationUpdateDto dto, Guid stationId)
        {
            try
            {
                var charingStation = await _unitOfWork.ChargingStationRepository.GetByIdAsync(
                    predicate: c => c.Id == stationId,
                    asNoTracking: false
                    );
                if (charingStation == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Trạm sạc không tồn tại");

                charingStation = dto.Adapt(charingStation);
                charingStation.UpdatedAt = DateTime.UtcNow;

                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                {
                    var response = charingStation.Adapt<ChargingStationViewGeneralDto>();
                    return new ServiceResult(Const.SUCCESS_UPDATE_CODE, Const.SUCCESS_UPDATE_MSG, response);
                }
                else
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, Const.FAIL_UPDATE_MSG);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<IServiceResult> UpdateStatus(ChargingStationStatus status, Guid stationId)
        {
            try
            {
                var chargingStation = await _unitOfWork.ChargingStationRepository.GetByIdAsync(
                    predicate: c => c.Id == stationId,
                    asNoTracking: false
                    );
                if (chargingStation == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Trạm sạc không tồn tại");

                chargingStation.Status = status.ToString();
                chargingStation.UpdatedAt = DateTime.UtcNow;

                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                {
                    var response = chargingStation.Adapt<ChargingStationViewGeneralDto>();
                    return new ServiceResult(Const.SUCCESS_UPDATE_CODE, Const.SUCCESS_UPDATE_MSG, response);
                }
                else
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, Const.FAIL_UPDATE_MSG);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<IServiceResult> Delete(Guid stationId)
        {
            try
            {
                var chargingStation = await _unitOfWork.ChargingStationRepository.GetByIdAsync(
                    predicate: c => c.Id == stationId,
                    asNoTracking: false
                    );
                if (chargingStation == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Trạm sạc không tồn tại");

                chargingStation.IsDeleted = true;
                chargingStation.UpdatedAt = DateTime.UtcNow;

                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                    return new ServiceResult(Const.SUCCESS_DELETE_CODE, Const.SUCCESS_DELETE_MSG);
                else
                    return new ServiceResult(Const.FAIL_DELETE_CODE, Const.FAIL_DELETE_MSG);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
    }
}
