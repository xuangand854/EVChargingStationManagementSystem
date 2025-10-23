using BusinessLogic.Base;
using BusinessLogic.IServices;
using Common;
using Common.DTOs.ChargingSessionDto;
using Common.Enum.ChargingSession;
using Common.Enum.Connector;
using Common.Helpler;
using Infrastructure.IUnitOfWork;
using Infrastructure.Models;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogic.Services
{
    public class ChargingSessionService(IUnitOfWork unitOfWork) : IChargingSessionService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;

        public async Task<IServiceResult> GetList(Guid userId)
        {
            try
            {
                var chargingSession = await _unitOfWork.ChargingSessionRepository.GetAllAsync(
                    predicate: c => !c.IsDeleted && c.UserId == userId,
                    orderBy: q => q.OrderByDescending(v => v.CreatedAt)
                    );
                if (chargingSession == null || chargingSession.Count == 0)
                    return new ServiceResult(
                        Const.WARNING_NO_DATA_CODE,
                        "Không tìm thấy phiên sạc nào");

                else
                {
                    var response = chargingSession.Adapt<List<ChargingSessionViewListDto>>();
                    return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, response);
                }
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<IServiceResult> GetById(Guid SessionId, Guid userId)
        {
            try
            {
                var chargingSession = await _unitOfWork.ChargingSessionRepository.GetByIdAsync(
                    predicate: v => !v.IsDeleted && v.Id == SessionId && v.UserId == userId
                    );
                if (chargingSession == null)
                    return new ServiceResult(
                        Const.WARNING_NO_DATA_CODE,
                        "Không tìm thấy phiên sạc nào"
                    );

                else
                {
                    var response = chargingSession.Adapt<ChargingSessionViewDetailDto>();
                    return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, response);
                }
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<IServiceResult> Start(ChargingSessionStartDto dto)
        {
            try
            {
                var chargingSession = dto.Adapt<ChargingSession>();
                chargingSession.Id = Guid.NewGuid();
                chargingSession.CreatedAt = DateTime.Now;
                chargingSession.UpdatedAt = DateTime.Now;
                chargingSession.StartTime = DateTime.Now;
                chargingSession.Status = ChargingSessionStatus.Charging.ToString();

                if (dto.Phone.HasValue())
                {
                    var user = await _unitOfWork.UserAccountRepository.GetByIdAsync(
                        predicate: u => !u.IsDeleted && u.PhoneNumber == dto.Phone,
                        include: c => c.Include(u => u.EVDriverProfile)
                        );
                    if (user == null)
                        return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy tài khoản người dùng");
                    chargingSession.UserId = user.Id;
                    chargingSession.DriverId = user.EVDriverProfile.Id;
                    if (dto.VehicleModelId == Guid.Empty)
                        return new ServiceResult(Const.FAIL_CREATE_CODE, "Vui lòng chọn xe trong profile của bạn");
                }

                var connector = await _unitOfWork.ConnectorRepository.GetByIdAsync(
                    predicate: p => !p.IsDeleted && p.Id == dto.ConnectorId,
                    include: c => c.Include(p => p.ChargingPost),
                    asNoTracking: false
                    );

                if (connector == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy cổng sạc được chọn");

                var chargingPost = await _unitOfWork.ChargingPostRepository.GetByIdAsync(
                    predicate: p => !p.IsDeleted && p.Id == connector.ChargingPost.Id,
                    include: c => c.Include(p => p.ChargingStationNavigation),
                    asNoTracking: false
                );
                if (chargingPost == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy trụ sạc được chọn");

                // Check status connector
                //if (!connector.Status.Equals("ConnectedToVehicle"))
                if (!connector.Status.Equals("InUse"))
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Cổng sạc này không khả dụng hiện tại hoặc chưa được cắm vào xe");


                chargingSession.ChargingPostId = connector.ChargingPostId;
                connector.Status = ConnectorStatus.Charging.ToString();
                connector.IsLocked = true;
                chargingPost.UpdatedAt = DateTime.Now;

                chargingPost.ChargingStationNavigation.UpdatedAt = DateTime.Now;

                await _unitOfWork.ChargingSessionRepository.CreateAsync(chargingSession);
                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                {
                    var response = chargingSession.Adapt<ChargingSessionViewDetailDto>();
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

        public async Task<IServiceResult> Stop(ChargingSessionStopDto dto, Guid sessionId)
        {
            try
            {
                var session = await _unitOfWork.ChargingSessionRepository.GetByIdAsync(
                    predicate: s => !s.IsDeleted && s.Id == sessionId,
                    asNoTracking: false
                );
                if (session == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy phiên sạc nào");

                if (!session.Status.Equals(ChargingSessionStatus.Charging.ToString()))
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Phiên sạc này đã được dừng lại rồi");

                var connector = await _unitOfWork.ConnectorRepository.GetByIdAsync(
                    predicate: p => !p.IsDeleted && p.Id == session.ConnectorId,
                    asNoTracking: false
                    );

                if (connector == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy cổng sạc được chọn");

                dto.Adapt(session);

                var t_e = await _unitOfWork.SystemConfigurationRepository.GetByIdAsync(
                    c => !c.IsDeleted && c.Name == "PRICE_PER_kWH"
                );
                
                
                decimal pricePerKWh = 1000; //vnd
                if (t_e != null && _unitOfWork.SystemConfigurationRepository.Validate(t_e))
                    pricePerKWh = t_e.MinValue ?? 1000;

                session.Cost = (decimal)dto.EnergyDeliveredKWh * pricePerKWh;
                session.Status = ChargingSessionStatus.Completed.ToString();
                session.UpdatedAt = DateTime.Now;
                session.EndTime = DateTime.Now;

                connector.Status = ConnectorStatus.InUse.ToString();
                connector.UpdatedAt = DateTime.Now;

                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                {
                    var response = session.Adapt<ChargingSessionViewDetailDto>();
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
    }
}
