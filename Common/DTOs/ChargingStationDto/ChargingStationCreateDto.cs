using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DTOs.ChargingStationDto
{
    public class ChargingStationCreateDto
    {
        [Required, MaxLength(150)]
        public string StationName { get; set; } = string.Empty;
        [Required, MaxLength(250)]
        public string Location { get; set; } = string.Empty;
        [Required, MaxLength(100)]
        public string Province { get; set; } = string.Empty; // e.g., "Hồ Chí Minh"
        [Required, MaxLength(30)]
        public string Latitude { get; set; } = string.Empty;  // "10°50'10.8\"N" Kinh độ
        [Required, MaxLength(30)]
        public string Longitude { get; set; } = string.Empty; // "106°50'32.1\"E" Vĩ độ
        //public int TotalChargingPost { get; set; } = 0;// Total number of charging post at the station
        //public int AvailableChargers { get; set; }
        //public string Status { get; set; } = "Active"; // e.g., Active, Inactive, Maintenance
        //public DateTime CreatedAt { get; set; }
        //public DateTime UpdatedAt { get; set; }
        //public bool IsDeleted { get; set; } = false;
        public Guid? OperatorId { get; set; } // Nhân viên quản lý
    }
}
