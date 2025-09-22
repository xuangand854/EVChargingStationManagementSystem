using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Repositories.Models
{
    public class Booking
    {
        [Key]
        public Guid Id { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Status { get; set; } = "Scheduled"; // e.g., Scheduled, Completed, Cancelled
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; } = false;

        [ForeignKey("ChargingStation")]
        public Guid StationId { get; set; }
        public ChargingStation ChargingStationNavigation { get; set; }

        [ForeignKey("UserAccount")]
        public Guid BookedBy { get; set; }
        public UserAccount BookedByNavigation { get; set; }
    }
}
