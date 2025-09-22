using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Repositories.Models
{
    public class ChargingPost
    {
        [Key]
        public Guid Id { get; set; }
        [MaxLength(100)]
        public string PostName { get; set; }
        public string ChargerType { get; set; } // e.g., Type2, CCS, CHAdeMO
        //public int PowerOutputKW { get; set; } // Power output in kW
        public string Status { get; set; } = "Available"; // e.g., Available, In Use, Out of Service
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; } = false;

        [ForeignKey("ChargingStation")]
        public Guid StationId { get; set; }
        public ChargingStation ChargingStationNavigation { get; set; }

        public ICollection<ChargingSession> ChargingSessions { get; set; } = [];
        public ICollection<PowerOutputKWPerPost> PowerOutputKWPerPosts { get; set; } = [];
    }
}
