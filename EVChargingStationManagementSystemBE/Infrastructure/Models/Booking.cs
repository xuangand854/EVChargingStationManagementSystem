using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Infrastructure.Models
{
    public class Booking
    {
        [Key]
        public Guid Id { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Status { get; set; } = "Scheduled"; // e.g., Scheduled, Completed, Cancelled
        public double? CurrentBattery { get; set; }
        public double? TargetBattery { get; set; }
        public double? EstimatedEnergyKWh { get; set; } 
        public double? ActualEnergyKWh { get; set; }   
        public DateTime? ActualStartTime { get; set; } 
        public DateTime? ActualEndTime { get; set; } 
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        [ForeignKey("ChargingStation")]
        public Guid StationId { get; set; }
        public ChargingStation ChargingStationNavigation { get; set; }

        [ForeignKey("UserAccount")]
        public Guid BookedBy { get; set; }
        public UserAccount BookedByNavigation { get; set; }
    }
}
