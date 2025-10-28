using System;
using System.ComponentModel.DataAnnotations;

namespace Common.DTOs.BookingDto
{
    public class BookingCheckInDto
    {
        [Required(ErrorMessage = "BookingId is required.")]
        public Guid BookingId { get; set; }

        [Required(ErrorMessage = "ConnectorId is required.")]
        public Guid ConnectorId { get; set; } // xác định đúng cổng sạc driver đang dùng

        [Range(0, 100, ErrorMessage = "CurrentBattery must be between 0 and 100.")]
        public double CurrentBattery { get; set; }

        [Range(0, 100, ErrorMessage = "TargetBattery must be between 0 and 100.")]
        public double TargetBattery { get; set; }

        // Thời gian check-in thực tế
        public DateTime? ActualStartTime { get; set; } = DateTime.UtcNow;
    }
}
