using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace Common.DTOs.BookingDto
{
    public class BookingViewDto
    {
        public Guid Id { get; set; }

        // Thời gian đặt và thực tế
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public DateTime? ActualStartTime { get; set; }
        public DateTime? ActualEndTime { get; set; }

        // Trạng thái
        public string Status { get; set; } = "Scheduled";

        // Thông tin pin & năng lượng
        public double? CurrentBattery { get; set; }
        public double? TargetBattery { get; set; }
        public double? EstimatedEnergyKWh { get; set; }
        public double? ActualEnergyKWh { get; set; }

        // Thông tin tạo & cập nhật
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Thông tin trạm sạc
        public Guid StationId { get; set; }
        public string? StationName { get; set; }      // Lấy từ ChargingStationNavigation.Name
        public string? StationAddress { get; set; }   // Lấy từ ChargingStationNavigation.Address

        // Người đặt
        public Guid BookedBy { get; set; }
        public string? DriverName { get; set; }       // Lấy từ UserAccount.FullName hoặc Username
        public string? DriverEmail { get; set; }      // Lấy từ UserAccount.Email

        // Flag xóa mềm
        public bool IsDeleted { get; set; }
    }
}
