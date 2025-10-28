using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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

        // EndTime được tự tính (StartTime + 1h30)
    }
}