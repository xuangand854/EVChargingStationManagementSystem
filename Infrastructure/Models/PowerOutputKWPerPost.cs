using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace Infrastructure.Models
{
    [PrimaryKey(nameof(ChargingPostId), nameof(PowerOutputKWId))]
    public class PowerOutputKWPerPost
    {
        public Guid ChargingPostId { get; set; }
        public ChargingPost ChargingPost { get; set; }

        public int PowerOutputKWId { get; set; }
        public PowerOutputKW PowerOutputKW { get; set; }
    }
}
