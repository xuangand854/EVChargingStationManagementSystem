using BusinessLogic.Base;
using BusinessLogic.IServices;
using Common;
using Common.DTOs.PaymentDto;
using Common.DTOs.SystemConfigurationDto;
using Infrastructure.IUnitOfWork;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogic.Services
{
    public class SystemConfigurationService(IUnitOfWork unitOfWork) : ISystemConfigurationService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        public async Task<IServiceResult> GetList()
        {
            try
            {
                var configurations = await _unitOfWork.SystemConfigurationRepository.GetAllAsync(
                    predicate: sc => !sc.IsDeleted,
                    orderBy: q => q.OrderByDescending(sc => sc.CreatedAt)
                );
                if (configurations == null || configurations.Count == 0)
                    return new ServiceResult(
                        Const.WARNING_NO_DATA_CODE,
                        "Không tìm thấy tùy chỉnh hệ thống nào"
                    );
                var response = configurations.Adapt<List<SystemConfigurationViewListDto>>();
                return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, response);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<IServiceResult> GetByName(string configName)
        {
            try
            {
                var config = await _unitOfWork.SystemConfigurationRepository.GetQueryable()
                    .AsNoTracking()
                    .Where(s => !s.IsDeleted && s.Name == configName)
                    .ProjectToType<SystemConfigurationViewDetailDto>()
                    .FirstOrDefaultAsync();

                if (config == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy đơn thanh toán");

                else
                    return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, config);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<IServiceResult> Update(int id, SystemConfigurationUpdateDto dto, Guid userId)
        {
            try
            {
                var configuration = await _unitOfWork.SystemConfigurationRepository.GetByIdAsync(
                    predicate: sc => !sc.IsDeleted && sc.Id == id,
                    asNoTracking: false
                );
                if (configuration == null)
                    return new ServiceResult(
                        Const.WARNING_NO_DATA_CODE,
                        "Không tìm thấy tùy chỉnh hệ thống nào"
                    );
                dto.Adapt(configuration);
                configuration.VersionNo = (configuration.VersionNo ?? 0) + 1;
                configuration.UpdatedAt = DateTime.UtcNow;
                configuration.UpdatedBy = userId;
                await _unitOfWork.SaveChangesAsync();
                return new ServiceResult(Const.SUCCESS_UPDATE_CODE, "Tùy chỉnh hệ thống đã được cập nhật thành công");
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
    }
}
