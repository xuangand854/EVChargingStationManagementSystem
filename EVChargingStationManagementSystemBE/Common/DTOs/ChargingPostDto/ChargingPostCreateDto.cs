using Common.Enum.VehicleModel;
using System.ComponentModel.DataAnnotations;

namespace Common.DTOs.ChargingPostDto
{
    public class ChargingPostCreateDto
    {
        [Required]
        public string PostName { get; set; } = string.Empty;
        [Required]
        public string ConnectorType { get; set; } = string.Empty;
        [Required]
        public int MaxPowerKW { get; set; }
        [Required]
        public VehicleTypeEnum VehicleTypeSupported { get; set; } = VehicleTypeEnum.Unknown;
        [Required]
        public int TotalConnectors { get; set; }
        [Required]
        public Guid StationId { get; set; }
    }
}
