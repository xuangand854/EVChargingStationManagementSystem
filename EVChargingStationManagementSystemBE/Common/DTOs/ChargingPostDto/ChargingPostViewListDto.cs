using Common.Enum.ChargingPost;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Common.DTOs.ChargingPostDto
{
    public class ChargingPostViewListDto
    {
        public Guid Id { get; set; }
        public string PostName { get; set; } = string.Empty;
        public string ChargerType { get; set; } = string.Empty;

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public ChargingPostStatus Status { get; set; } = ChargingPostStatus.Unknown;
        public Guid StationId { get; set; }

        //public ICollection<ChargingSession> ChargingSessions { get; set; } = [];
        //public ICollection<PowerOutputKWPerPost> PowerOutputKWPerPosts { get; set; } = [];
    }
}
