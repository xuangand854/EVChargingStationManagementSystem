﻿using BusinessLogic.Base;
using Common;
using Common.DTOs.ReportDto;

namespace BusinessLogic.IServices
{
    public interface IReportService
    {
        Task<ServiceResult> GetAllAsync();
        Task<ServiceResult> GetByIdAsync(Guid id);
        Task<ServiceResult> CreateAsync(ReportCreateDTO dto);
        Task<ServiceResult> UpdateAsync(Guid id, ReportUpdateDTO dto);
        Task<ServiceResult> DeleteAsync(Guid id);
    }
}
