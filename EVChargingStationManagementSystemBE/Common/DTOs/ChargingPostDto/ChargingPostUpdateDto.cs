using System.ComponentModel.DataAnnotations;

namespace Common.DTOs.ChargingPostDto
{
    public class ChargingPostUpdateDto
    {
        public string? PostName { get; set; }
        public string? ChargerType { get; set; }
        public Guid StationId { get; set; }
    }
}
