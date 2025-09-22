using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Repositories.Models
{
    public class SCStaff
    {
        [Key]
        public Guid Id { get; set; }
        public string? WorkingLocation { get; set; }
        public string Status { get; set; } = "Active";
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; } = false;

        [ForeignKey("UserAccount")]
        public Guid AccountId { get; set; }
        public UserAccount UserAccountNavigation { get; set; }

    }
}
