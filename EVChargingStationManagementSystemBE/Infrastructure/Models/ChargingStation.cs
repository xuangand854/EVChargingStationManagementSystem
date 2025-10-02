using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Infrastructure.Models
{
    public class ChargingStation
    {
        [Key]
        public Guid Id { get; set; }
        [Required, MaxLength(150)]
        public string StationName { get; set; }
        public string Location { get; set; }
        public string Province { get; set; } // e.g., "Hồ Chí Minh"
        public string Latitude { get; set; }  // "10°50'10.8\"N" Kinh độ
        public string Longitude { get; set; } // "106°50'32.1\"E" Vĩ độ
        public int TotalChargingPost { get; set; } = 0;// Total number of charging post at the station
        public int AvailableChargers { get; set; } = 0;
        public string Status { get; set; } = "Active"; // e.g., Active, Inactive, Maintenance
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        [ForeignKey("UserAccount")]
        public Guid? OperatorId { get; set; } // Nhân viên quản lý
        public UserAccount OperatorNavigation { get; set; }

        public ICollection<ChargingPost> ChargingPosts { get; set; } = [];
        public ICollection<Booking> Bookings { get; set; } = [];

    }
}
