using Common.Enum.ChargingSession;
using Common.Enum.VehicleModel;
using System.Text.Json.Serialization;

namespace Common.DTOs.ChargingSessionDto
{
    public class ChargingSessionViewListDto
    {
        public int Id { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }

        //[JsonConverter(typeof(JsonStringEnumConverter))]
        public ChargingSessionStatus Status { get; set; } = ChargingSessionStatus.Unknown;
        public string ConnectorType { get; set; } = null!;
        public string EnergyProvider { get; set; } = null!;

        //[JsonConverter(typeof(JsonStringEnumConverter))]
        public VehicleTypeEnum VehicleType { get; set; } = VehicleTypeEnum.Unknown;
        //public string? StationName { get; set; }
        //public decimal? TotalEnergyConsumedKWh { get; set; }
        //public decimal? TotalCost { get; set; }
    }
}
