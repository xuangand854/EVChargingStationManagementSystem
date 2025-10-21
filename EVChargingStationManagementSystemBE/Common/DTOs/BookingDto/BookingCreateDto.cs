using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTOs.BookingDto
{
    public class BookingCreateDto
    {
        public Guid StationId { get; set; }
        public Guid VehicleId { get; set; }
        public DateTime StartTime { get; set; }
        public double? CurrentBattery { get; set; }
        public double? TargetBattery { get; set; }
    }
}

