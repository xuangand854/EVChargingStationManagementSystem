using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Infrastructure.Models
{
    public class ChargingSession
    {
        [Key]
        public Guid Id { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; } // Nullable for ongoing sessions
        public double EnergyDeliveredKWh { get; set; } // Total energy delivered in kWh
        [Precision(18, 2)]
        public decimal Cost { get; set; } // Total cost of the session
        public string Status { get; set; } = "InProgress"; // e.g., InProgress, Completed, Cancelled
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        [ForeignKey("ChargingPost")]
        public Guid ChargingPostId { get; set; }
        public ChargingPost ChargingPostNavigation { get; set; }

        [ForeignKey("UserVehicle")]
        public Guid UserVehicleId { get; set; }
        public UserVehicle UserVehicleNavigation { get; set; }

        [ForeignKey("UserAccount")]
        public Guid StartedBy { get; set; }
        public UserAccount StartedByNavigation { get; set; }

        [ForeignKey("Booking")]
        public Guid? BookingId { get; set; } // Nullable if not booked
        public Booking BookingNavigation { get; set; }

        public ICollection<Transaction> Transactions { get; set; } = [];
    }
}
