using BusinessLogic.Base;
using BusinessLogic.IServices;
using Common;
using Common.DTOs.ReportDto;
using Infrastructure.IUnitOfWork;
using Infrastructure.Models;
using Mapster;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogic.Services
{
    public class ReportService(IUnitOfWork unitOfWork) : IReportService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;

        //  LẤY TOÀN BỘ REPORT 
        public async Task<ServiceResult> GetAllAsync()
        {
            try
            {
                // Lấy tất cả report chưa bị xóa, kèm navigation để hiển thị thông tin đầy đủ
                var reports = await _unitOfWork.ReportRepository.GetAllAsync(
                    predicate: r => !r.IsDeleted,
                    include: q => q
                        .Include(r => r.ReportedBy)
                        .Include(r => r.ChargingStation)
                        .Include(r => r.ChargingPostNavigation),
                    orderBy: q => q.OrderByDescending(r => r.CreatedAt),
                    asNoTracking: true
                );

                if (reports == null || reports.Count == 0)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy báo cáo nào.");

                // Map sang ViewReportDTO để trả về client
                var response = reports.Adapt<List<ViewReportDTO>>();
                return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, response);
            }
            catch (Exception ex)
            {
                // Xử lý lỗi và log nếu cần
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        //  LẤY CHI TIẾT REPORT THEO ID 
        public async Task<ServiceResult> GetByIdAsync(Guid id)
        {
            try
            {
                var report = await _unitOfWork.ReportRepository.GetByIdAsync(
                    predicate: r => r.Id == id && !r.IsDeleted,
                    include: q => q
                        .Include(r => r.ReportedBy)
                        .Include(r => r.ChargingStation)
                        .Include(r => r.ChargingPostNavigation),
                    asNoTracking: true
                );

                if (report == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy báo cáo.");

                var response = report.Adapt<ViewReportDTO>();
                return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, response);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        // TẠO MỚI REPORT 
        public async Task<ServiceResult> CreateAsync(ReportCreateDTO dto)
        {
            try
            {
                // Map từ DTO sang entity (theo cấu hình Mapster)
                var report = dto.Adapt<Report>();

                // Gán thêm các giá trị hệ thống
                report.Id = Guid.NewGuid();
                report.CreatedAt = DateTime.UtcNow;
                report.UpdatedAt = DateTime.UtcNow;
                report.Status = "Open";       // Mặc định khi tạo là "Open"
                report.IsDeleted = false;

                await _unitOfWork.ReportRepository.CreateAsync(report);
                await _unitOfWork.SaveChangesAsync();

                var response = report.Adapt<ViewReportDTO>();
                return new ServiceResult(Const.SUCCESS_CREATE_CODE, Const.SUCCESS_CREATE_MSG, response);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        // CẬP NHẬT REPORT 
        public async Task<ServiceResult> UpdateAsync(Guid id, ReportUpdateDTO dto)
        {
            try
            {
                var report = await _unitOfWork.ReportRepository.GetByIdAsync(
                    predicate: r => r.Id == id && !r.IsDeleted,
                    asNoTracking: false // có tracking để EF nhận thay đổi
                );

                if (report == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy báo cáo.");

                // Map giá trị mới từ DTO sang entity hiện tại (chỉ map field khác null)
                dto.Adapt(report);
                report.UpdatedAt = DateTime.UtcNow;

                var result = await _unitOfWork.SaveChangesAsync();
                if (result <= 0)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, Const.FAIL_UPDATE_MSG);

                var response = report.Adapt<ViewReportDTO>();
                return new ServiceResult(Const.SUCCESS_UPDATE_CODE, Const.SUCCESS_UPDATE_MSG, response);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        // XÓA MỀM REPORT 
        public async Task<ServiceResult> DeleteAsync(Guid id)
        {
            try
            {
                var report = await _unitOfWork.ReportRepository.GetByIdAsync(
                    predicate: r => r.Id == id && !r.IsDeleted,
                    asNoTracking: false
                );

                if (report == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy báo cáo.");

                // Đánh dấu là đã xóa và đóng report
                report.IsDeleted = true;
                report.Status = "Closed";
                report.UpdatedAt = DateTime.UtcNow;

                var result = await _unitOfWork.SaveChangesAsync();
                if (result <= 0)
                    return new ServiceResult(Const.FAIL_DELETE_CODE, Const.FAIL_DELETE_MSG);

                return new ServiceResult(Const.SUCCESS_DELETE_CODE, Const.SUCCESS_DELETE_MSG);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
    }
}
