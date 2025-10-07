using System.ComponentModel.DataAnnotations;

namespace Common.DTOs.ChargingPostDto
{
    public class ChargingPostCreateDto
    {
        [Required]
        public string PostName { get; set; } = string.Empty;
        [Required]
        public string ChargerType { get; set; } = string.Empty;

        //public ChargingPostStatus Status { get; set; } = ChargingPostStatus.Unknown;
        public Guid StationId { get; set; }
    }
}
