using BusinessLogic.Base;
using BusinessLogic.IServices;
using Common;
using Common.DTOs.ChargingPostDto;
using Common.Enum.ChargingPost;
using Common.Enum.ChargingStation;
using Common.Enum.Connector;
using Common.Enum.VehicleModel;
using Infrastructure.IUnitOfWork;
using Infrastructure.Models;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogic.Services
{
    public class ChargingPostService(IUnitOfWork unitOfWork) : IChargingPostService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;

        public async Task<IServiceResult> Create(ChargingPostCreateDto dto)
        {
            try
            {
                var chargingPost = dto.Adapt<ChargingPost>();
                chargingPost.Id = Guid.NewGuid();
                chargingPost.Status = ChargingPostUpdateStatus.InActive.ToString();
                chargingPost.CreatedAt = DateTime.Now;
                chargingPost.UpdatedAt = DateTime.Now;

                await _unitOfWork.ChargingPostRepository.CreateAsync(chargingPost);

                var chargingStation = await _unitOfWork.ChargingStationRepository.GetByIdAsync(
                    predicate: c => c.Id == chargingPost.StationId,
                    asNoTracking: false
                    );
                if (chargingStation == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy trạm sạc đã chọn");

                if (chargingPost.VehicleTypeSupported.Equals("Car"))
                {
                    chargingStation.TotalCarChargingPosts += 1;
                    chargingStation.TotalCarChargingConnectors += chargingPost.TotalConnectors;
                }
                else
                {
                    chargingStation.TotalBikeChargingPosts += 1;
                    chargingStation.TotalBikeConnectors += chargingPost.TotalConnectors;
                }

                // Bulk create connectors
                for (int i = 0; i < chargingPost.TotalConnectors; i++)
                {
                    var connector = new Connector
                    {
                        Id = Guid.NewGuid(),
                        ConnectorName = $"{chargingPost.PostName}-C{i + 1}",
                        Status = "OutOfService",
                        ChargingPostId = chargingPost.Id,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    await _unitOfWork.ConnectorRepository.CreateAsync(connector);
                }

                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                {
                    var response = chargingPost.Adapt<ChargingPostViewListDto>();
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

        public async Task<IServiceResult> Update(ChargingPostUpdateDto dto, Guid postId)
        {
            try
            {
                var chargingPost = await _unitOfWork.ChargingPostRepository.GetByIdAsync(
                    predicate: c => c.Id == postId,
                    asNoTracking: false
                    );
                if (chargingPost == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Trụ sạc không tồn tại");

                if (!chargingPost.Status.Equals("Maintained"))
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Trụ sạc phải có trạng thái là bảo trì mới được phép cập nhật");

                chargingPost = dto.Adapt(chargingPost);
                chargingPost.UpdatedAt = DateTime.UtcNow;

                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                {
                    var response = chargingPost.Adapt<ChargingPostViewListDto>();
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

        public async Task<IServiceResult> Delete(Guid postId)
        {
            try
            {
                var chargingPost = await _unitOfWork.ChargingPostRepository.GetByIdAsync(
                    predicate: c => c.Id == postId,
                    asNoTracking: false
                    );
                if (chargingPost == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Trụ sạc không tồn tại");

                if (!chargingPost.Status.Equals("Maintained"))
                    return new ServiceResult(Const.FAIL_DELETE_CODE, "Trụ sạc phải có trạng thái là bảo trì mới được phép xóa");

                chargingPost.IsDeleted = true;
                chargingPost.UpdatedAt = DateTime.UtcNow;

                var chargingStation = await _unitOfWork.ChargingStationRepository.GetByIdAsync(
                    predicate: c => c.Id == chargingPost.StationId,
                    asNoTracking: false
                    );

                if (chargingStation == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy trạm sạc đã chọn");

                if (chargingPost.VehicleTypeSupported.Equals("Car"))
                {
                    chargingStation.TotalCarChargingPosts -= 1;
                    chargingStation.TotalCarChargingConnectors -= chargingPost.TotalConnectors;
                }
                else
                {
                    chargingStation.TotalBikeChargingPosts -= 1;
                    chargingStation.TotalBikeConnectors -= chargingPost.TotalConnectors;
                }

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

        public async Task<IServiceResult> GetById(Guid postId)
        {
            try
            {
                var chargingPost = await _unitOfWork.ChargingPostRepository.GetByIdAsync(
                    predicate: v => !v.IsDeleted && v.Id == postId,
                    include: c => c
                        .Include(p => p.Connectors.Where(c => !c.IsDeleted).OrderByDescending(c => c.CreatedAt))
                        
                    );
                if (chargingPost == null)
                    return new ServiceResult(
                        Const.WARNING_NO_DATA_CODE,
                        "Không tìm thấy trụ sạc nào"
                    );

                else
                {
                    var response = chargingPost.Adapt<ChargingPostViewDetailDto>();
                    return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, response);
                }
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<IServiceResult> GetList()
        {
            try
            {
                var chargingPost = await _unitOfWork.ChargingPostRepository.GetAllAsync(
                    predicate: v => !v.IsDeleted,
                    orderBy: q => q.OrderByDescending(v => v.CreatedAt)
                    );

                if (chargingPost == null || chargingPost.Count == 0)
                    return new ServiceResult(
                        Const.WARNING_NO_DATA_CODE,
                        "Không tìm thấy trụ sạc nào");

                else
                {
                    var response = chargingPost.Adapt<List<ChargingPostViewListDto>>();
                    return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, response);
                }
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<IServiceResult> UpdateStatus(ChargingPostUpdateStatus status, Guid postId)
        {
            try
            {
                var chargingPost = await _unitOfWork.ChargingPostRepository.GetByIdAsync(
                    predicate: c => c.Id == postId,
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

                if (!chargingStation.Status.Equals(ChargingStationStatus.Active.ToString()) && status.Equals(ChargingPostUpdateStatus.Available))
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Trạm đang dừng hoạt động, vui lòng kích hoạt trạng thái trạm để có thể thay đổi trạng thái trụ sạc");

                if (status.ToString().Equals(chargingPost.Status))
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Trụ sạc đã ở trạng thái được chọn rồi");

                // Nếu chuyển từ bất kỳ trạng thái nào
                // sang Available thì tăng số trụ sạc khả dụng lên 1 và reset số cổng kết nối khả dụng
                if (!chargingPost.Status.Equals(ChargingPostUpdateStatus.Available.ToString()) && status.Equals(ChargingPostUpdateStatus.Available))
                {
                    chargingPost.AvailableConnectors = chargingPost.TotalConnectors;
                    if (chargingPost.VehicleTypeSupported.Equals(VehicleTypeEnum.Car.ToString()))
                    {
                        chargingStation.AvailableCarChargingPosts += 1;
                        chargingStation.AvailableCarConnectors += chargingPost.TotalConnectors;
                    }
                    else
                    {
                        chargingStation.AvailableBikeChargingPosts += 1;
                        chargingStation.AvailableBikeConnectors += chargingPost.TotalConnectors;
                    }

                    // Chuyển toàn bộ trạng thái các connector từ OutOfService sang Available
                    var connectors = await _unitOfWork.ConnectorRepository.GetAllAsync(
                        predicate: c => !c.IsDeleted && c.ChargingPostId == chargingPost.Id && c.Status.Equals(ConnectorStatus.OutOfService.ToString())
                        , asNoTracking: false);
                    foreach (var connector in connectors)
                    {
                        connector.Status = ConnectorStatus.Available.ToString();
                        connector.UpdatedAt = DateTime.UtcNow;
                    }
                }
                else if (chargingPost.Status.Equals(ChargingPostStatus.Available.ToString()) && !status.Equals(ChargingPostStatus.Available))
                {
                    if (chargingPost.VehicleTypeSupported.Equals(VehicleTypeEnum.Car.ToString()))
                    {
                        chargingStation.AvailableCarChargingPosts -= 1;
                        chargingStation.AvailableCarConnectors -= chargingPost.AvailableConnectors;
                    }
                    else
                    {
                        chargingStation.AvailableBikeChargingPosts -= 1;
                        chargingStation.AvailableBikeConnectors -= chargingPost.AvailableConnectors;
                    }

                    // Chuyển toàn bộ trạng thái các connector từ Available sang OutOfService
                    var connectors = await _unitOfWork.ConnectorRepository.GetAllAsync(
                        predicate: c => !c.IsDeleted && c.ChargingPostId == chargingPost.Id && c.Status.Equals(ChargingPostStatus.Available.ToString())
                        , asNoTracking: false);
                    foreach (var connector in connectors)
                    {
                        connector.Status = ConnectorStatus.OutOfService.ToString();
                        connector.UpdatedAt = DateTime.UtcNow;
                    }
                }
                else chargingPost.AvailableConnectors = 0;

                chargingPost.Status = status.ToString();
                chargingPost.UpdatedAt = DateTime.UtcNow;

                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                {
                    var response = chargingPost.Adapt<ChargingPostViewListDto>();
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
