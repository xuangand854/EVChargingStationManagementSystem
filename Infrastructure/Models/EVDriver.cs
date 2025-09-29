using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Infrastructure.Models
{
    public class EVDriver
    {
        [Key]
        public Guid Id { get; set; }
        public int Score { get; set; } = 0;
        public bool IsActive { get; set; } = false;
        public string Status { get; set; } = "Active";

        public DateTime UpdatedAt { get; set; }

        public bool IsDeleted { get; set; } = false;

        [ForeignKey("UserAccount")]
        public Guid AccountId { get; set; }
        public UserAccount UserAccountNavigation { get; set; }

        [ForeignKey("Ranking")]
        public Guid RankingId { get; set; }
        public Ranking RankingNavigation { get; set; }

        public ICollection<UserVehicle> UserVehicles { get; set; } = [];

    }
}
