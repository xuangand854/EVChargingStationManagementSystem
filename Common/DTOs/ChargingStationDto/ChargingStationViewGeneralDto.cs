using Common.Enum.ChargingStation;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Common.DTOs.ChargingStationDto
{
    public class ChargingStationViewGeneralDto
    {
        public Guid Id { get; set; }
        public string StationName { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Province { get; set; } = string.Empty;
        public string Latitude { get; set; } = string.Empty;
        public string Longitude { get; set; } = string.Empty;
        public int TotalChargingPost { get; set; } = 0;
        public int AvailableChargers { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public ChargingStationStatus Status { get; set; } = ChargingStationStatus.Unknown;
        public Guid OperatorId { get; set; }
    }
}
