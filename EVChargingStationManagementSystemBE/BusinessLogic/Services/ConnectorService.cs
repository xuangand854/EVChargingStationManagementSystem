using BusinessLogic.Base;
using BusinessLogic.IServices;
using Common;
using Common.DTOs.ConnectorDto;
using Common.Enum.ChargingPost;
using Common.Enum.Connector;
using Infrastructure.IUnitOfWork;
using Infrastructure.Models;
using Mapster;

namespace BusinessLogic.Services
{
    public class ConnectorService(IUnitOfWork unitOfWork) : IConnectorService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;

        public async Task<IServiceResult> GetList(Guid chargingPostId)
        {

            try
            {
                var connector = await _unitOfWork.ConnectorRepository.GetAllAsync(
                    predicate: v => !v.IsDeleted && v.ChargingPostId == chargingPostId,
                    orderBy: q => q.OrderByDescending(v => v.CreatedAt)
                    );
                if (connector == null || connector.Count == 0)
                    return new ServiceResult(
                        Const.WARNING_NO_DATA_CODE,
                        "Không tìm thấy cổng kết nối nào");

                else
                {
                    var response = connector.Adapt<List<ConnectorViewListDto>>();
                    return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, response);
                }
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<IServiceResult> GetById(Guid ConnectorId)
        {

            try
            {
                var connector = await _unitOfWork.ConnectorRepository.GetByIdAsync(
                    v => !v.IsDeleted && v.Id == ConnectorId
                    );
                if (connector == null)
                    return new ServiceResult(
                        Const.WARNING_NO_DATA_CODE,
                        "Không tìm thấy cổng kết nối nào"
                    );

                else
                {
                    var response = connector.Adapt<ConnectorViewListDto>();
                    return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, response);
                }
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<IServiceResult> Create(ConnectorCreateDto dto)
        {
            try
            {
                var connector = dto.Adapt<Connector>();
                connector.Id = Guid.NewGuid();
                connector.Status = "OutOfService";
                connector.CreatedAt = DateTime.Now;
                connector.UpdatedAt = DateTime.Now;

                var chargingPost = await _unitOfWork.ChargingPostRepository.GetByIdAsync(
                    predicate: cp => !cp.IsDeleted && cp.Id == dto.ChargingPostId,
                    asNoTracking: false
                    );
                if (chargingPost == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Trụ sạc không tồn tại");

                var chargingStation = await _unitOfWork.ChargingStationRepository.GetByIdAsync(
                    predicate: cp => !cp.IsDeleted && cp.Id == chargingPost.StationId,
                    asNoTracking: false
                    );

                if (chargingStation == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Trạm sạc không tồn tại");

                chargingPost.TotalConnectors += 1;

                if (chargingPost.VehicleTypeSupported.Equals("Car"))
                    chargingStation.TotalCarChargingConnectors += 1;
                else
                    chargingStation.TotalBikeConnectors += 1;

                chargingPost.UpdatedAt = DateTime.Now;
                chargingStation.UpdatedAt = DateTime.Now;
                await _unitOfWork.ConnectorRepository.CreateAsync(connector);
                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                {
                    var response = connector.Adapt<ConnectorViewListDto>();
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

        public async Task<IServiceResult> Update(ConnectorUpdateDto dto, Guid connectorId)
        {
            try
            {
                var connector = await _unitOfWork.ConnectorRepository.GetByIdAsync(
                    predicate: c => c.Id == connectorId,
                    asNoTracking: false
                    );
                if (connector == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Cổng kết nối không tồn tại");

                var chargingPost = await _unitOfWork.ChargingPostRepository.GetByIdAsync(
                    cp => !cp.IsDeleted && cp.Id == dto.ChargingPostId
                    );
                if (chargingPost == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Trụ sạc không tồn tại");

                if (!chargingPost.Status.Equals("Maintained"))
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Trụ sạc phải có trạng thái là bảo trì mới được phép cập nhật cổng kết nối");

                connector = dto.Adapt(connector);
                connector.UpdatedAt = DateTime.UtcNow;

                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                {
                    var response = connector.Adapt<ConnectorViewListDto>();
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

        public async Task<IServiceResult> UpdateStatus(ConnectorStatus status, Guid connectorId)
        {
            try
            {
                var connector = await _unitOfWork.ConnectorRepository.GetByIdAsync(
                    predicate: c => c.Id == connectorId,
                    asNoTracking: false
                    );
                if (connector == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Cổng kết nối không tồn tại");

                var chargingPost = await _unitOfWork.ChargingPostRepository.GetByIdAsync(
                    predicate: cp => !cp.IsDeleted && cp.Id == connector.ChargingPostId,
                    asNoTracking: false
                    );
                if (chargingPost == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Trụ sạc không tồn tại");

                if (!chargingPost.Status.Equals("Available") && status.ToString().Equals("Available"))
                    chargingPost.AvailableConnectors += 1;
                else if (chargingPost.Status.Equals("Available") && !status.ToString().Equals("Available"))
                    chargingPost.AvailableConnectors -= 1;

                connector.Status = status.ToString();
                connector.UpdatedAt = DateTime.UtcNow;

                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                {
                    var response = connector.Adapt<ConnectorViewListDto>();
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

        public async Task<IServiceResult> UpdateConnectorCount(bool toggle, Guid connectorId)
        {
            try
            {
                var connector = await _unitOfWork.ConnectorRepository.GetByIdAsync(
                    predicate: c => c.Id == connectorId,
                    asNoTracking: false
                    );
                if (connector == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Cổng kết nối không tồn tại");

                var chargingPost = await _unitOfWork.ChargingPostRepository.GetByIdAsync(
                    predicate: c => c.Id == connector.ChargingPostId,
                    asNoTracking: false
                    );

                if (chargingPost == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Trụ sạc không tồn tại");

                var chargingStation = await _unitOfWork.ChargingStationRepository.GetByIdAsync(
                    predicate: c => c.Id == chargingPost.StationId,
                    asNoTracking: false
                    );
                if (chargingStation == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy trạm sạc đã chọn");

                if (connector.Status.Equals(ConnectorStatus.Charging.ToString()))
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Cổng sạc này hiện tại đang được sạc, không thể thay đổi trạng thái");

                if (connector.IsLocked)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Cổng sạc này hiện tại không rút ra được, bạn phải thanh toán để mở khóa");

                if (!connector.Status.Equals(ConnectorStatus.Available.ToString()) 
                    && !connector.Status.Equals(ConnectorStatus.InUse.ToString()) 
                    && !connector.Status.Equals(ConnectorStatus.Reserved.ToString()))
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Cổng sạc này hiện tại đang được bảo trì hoặc bị hỏng hoặc không khả dụng hiện tại, vui lòng dùng cổng khác");

                if (connector.Status.Equals(ConnectorStatus.InUse.ToString()) && !toggle)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Cổng kết nối này đã được rút ra, không thể rút ra thêm nữa");

                if (connector.Status.Equals(ConnectorStatus.Available.ToString()) && toggle)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Cổng kết nối này đã được cắm vào, không thể cắm vào thêm nữa");

                // True: súng được cắm vào trụ, false: súng được rút ra khỏi trụ
                if (toggle)
                {
                    connector.Status = ConnectorStatus.Available.ToString();
                    chargingPost.AvailableConnectors += 1;
                    if (chargingPost.VehicleTypeSupported.Equals("Car"))
                        chargingStation.AvailableCarConnectors += 1;
                    else
                        chargingStation.AvailableBikeConnectors += 1;
                }
                else
                {
                    connector.Status = ConnectorStatus.InUse.ToString();
                    chargingPost.AvailableConnectors -= 1;
                    if (chargingPost.VehicleTypeSupported.Equals("Car"))
                        chargingStation.AvailableCarConnectors -= 1;
                    else
                        chargingStation.AvailableBikeConnectors -= 1;
                }                

                if (chargingPost.AvailableConnectors == 0)
                    chargingPost.Status = ChargingPostStatus.Busy.ToString();
                else chargingPost.Status = ChargingPostStatus.Available.ToString();
                chargingPost.UpdatedAt = DateTime.Now;
                connector.UpdatedAt = DateTime.Now;

                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                {
                    var response = connector.Adapt<ConnectorViewListDto>();
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

        public async Task<IServiceResult> Delete(Guid connectorId)
        {
            try
            {
                var connector = await _unitOfWork.ConnectorRepository.GetByIdAsync(
                    predicate: c => c.Id == connectorId,
                    asNoTracking: false
                    );
                if (connector == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Cổng kết nối không tồn tại");

                var chargingPost = await _unitOfWork.ChargingPostRepository.GetByIdAsync(
                    predicate: cp => !cp.IsDeleted && cp.Id == connector.ChargingPostId,
                    asNoTracking: false
                    );
                if (chargingPost == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Trụ sạc không tồn tại");

                if (!chargingPost.Status.Equals("Maintained"))
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Trụ sạc phải có trạng thái là bảo trì mới được phép cập nhật cổng kết nối");

                var chargingStation = await _unitOfWork.ChargingStationRepository.GetByIdAsync(
                    predicate: cp => !cp.IsDeleted && cp.Id == chargingPost.StationId,
                    asNoTracking: false
                    );

                if (chargingStation == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Trạm sạc không tồn tại");

                chargingPost.TotalConnectors -= 1;

                if (chargingPost.VehicleTypeSupported.Equals("Car"))
                    chargingStation.TotalCarChargingConnectors -= 1;
                else
                    chargingStation.TotalBikeConnectors -= 1;

                chargingPost.UpdatedAt = DateTime.Now;
                chargingStation.UpdatedAt = DateTime.Now;

                connector.IsDeleted = true;
                connector.UpdatedAt = DateTime.UtcNow;

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
