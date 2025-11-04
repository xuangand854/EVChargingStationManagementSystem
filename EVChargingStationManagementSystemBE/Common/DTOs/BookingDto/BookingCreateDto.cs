using System;
using System.ComponentModel.DataAnnotations;

namespace Common.DTOs.BookingDto
{
    public class BookingCreatedDto
    {
        [Required(ErrorMessage = "StationId is required.")]
        public Guid StationId { get; set; }

        [Required(ErrorMessage = "VehicleId is required.")]
        public Guid VehicleId { get; set; }

        [Required(ErrorMessage = "StartTime is required.")]
        public DateTime StartTime { get; set; }

        // Có thể để client chọn duration hoặc mặc định 1.5 tiếng
        public double? DurationHours { get; set; } = 1.5;
    }
}
