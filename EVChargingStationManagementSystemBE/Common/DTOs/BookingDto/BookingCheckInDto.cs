using System;
using System.ComponentModel.DataAnnotations;

namespace Common.DTOs.BookingDto
{
    public class BookingCheckInDto
    {
        [Required(ErrorMessage = "BookingId is required.")]
        public Guid BookingId { get; set; }

        [Required(ErrorMessage = "ConnectorId is required.")]
        public Guid ConnectorId { get; set; }

        [Range(0, 100, ErrorMessage = "CurrentBattery must be between 0 and 100.")]
        public double CurrentBattery { get; set; }

        // Cho phép null, nếu null => service tự gán = 100
        [Range(0, 100, ErrorMessage = "TargetBattery must be between 0 và 100.")]
        public int? TargetBattery { get; set; }

        [Required(ErrorMessage = "Check-in code is required.")]
        [StringLength(4, MinimumLength = 4, ErrorMessage = "Check-in code must be 4 digits.")]
        public string CheckInCode { get; set; } = null!;

        public DateTime ActualStartTime { get; set; } = DateTime.UtcNow;
    }
}
