using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Infrastructure.Models
{
    public class UserVehicle
    {
        [Key]
        public Guid Id { get; set; }

        [ForeignKey("EVDriver")]
        public Guid DriverId { get; set; }
        public EVDriver EVDriverNavigation { get; set; }

        [ForeignKey("VehicleModel")]
        public Guid VehicleModelId { get; set; }
        public VehicleModel VehicleModelNavigation { get; set; }

        public ICollection<ChargingSession> ChargingSessions { get; set; } = [];
    }
}
