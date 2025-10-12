using Azure;
using BusinessLogic.Base;
using BusinessLogic.IServices;
using Common;
using Common.DTOs.ChargingPostDto;
using Common.DTOs.ChargingStationDto;
using Common.Enum.ChargingPost;
using Infrastructure.IUnitOfWork;
using Infrastructure.Models;
using Mapster;

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
                chargingPost.Status = "Inactive";
                chargingPost.CreatedAt = DateTime.Now;
                chargingPost.UpdatedAt = DateTime.Now;

                await _unitOfWork.ChargingPostRepository.CreateAsync(chargingPost);

                var chargingStation = await _unitOfWork.ChargingStationRepository.GetByIdAsync(
                    predicate: c => c.Id == chargingPost.StationId,
                    asNoTracking: false
                    );
                if (chargingStation == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy trạm sạc đã chọn");

                chargingStation.TotalChargingPost += 1;

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

                chargingStation.TotalChargingPost -= 1;

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
                    predicate: v => !v.IsDeleted && v.Id == postId
                    );
                if (chargingPost == null)
                    return new ServiceResult(
                        Const.WARNING_NO_DATA_CODE,
                        "Không tìm thấy trụ sạc nào"
                    );

                else
                {
                    var response = chargingPost.Adapt<ChargingPostViewListDto>();
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

        public async Task<IServiceResult> UpdateStatus(ChargingPostStatus status, Guid postId)
        {
            try
            {
                var chargingPost = await _unitOfWork.ChargingPostRepository.GetByIdAsync(
                    predicate: c => c.Id == postId,
                    asNoTracking: false
                    );

                if (chargingPost == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Trụ sạc không tồn tại");

                chargingPost.Status = status.ToString();
                chargingPost.UpdatedAt = DateTime.UtcNow;

                var chargingStation = await _unitOfWork.ChargingStationRepository.GetByIdAsync(
                    predicate: c => c.Id == chargingPost.StationId,
                    asNoTracking: false
                    );
                if (chargingStation == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy trạm sạc đã chọn");

                if (chargingPost.Status.Equals("Active"))
                    chargingStation.AvailableChargers += 1;
                else chargingStation.AvailableChargers -= 1;

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
