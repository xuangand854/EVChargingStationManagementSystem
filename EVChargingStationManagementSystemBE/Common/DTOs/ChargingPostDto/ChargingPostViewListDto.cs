using Common.Enum.ChargingPost;
using System.Text.Json.Serialization;

namespace Common.DTOs.ChargingPostDto
{
    public class ChargingPostViewListDto
    {
        public Guid Id { get; set; }
        public string PostName { get; set; } = string.Empty;
        public string ConnectorType { get; set; } = string.Empty;
        public string VehicleTypeSupported { get; set; } = string.Empty;

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public ChargingPostStatus Status { get; set; } = ChargingPostStatus.Unknown;
        public Guid StationId { get; set; }

        //public ICollection<ChargingSession> ChargingSessions { get; set; } = [];
        //public ICollection<PowerOutputKWPerPost> PowerOutputKWPerPosts { get; set; } = [];
    }
}
