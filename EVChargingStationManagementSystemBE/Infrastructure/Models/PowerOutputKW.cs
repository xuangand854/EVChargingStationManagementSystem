using System.ComponentModel.DataAnnotations;

namespace Infrastructure.Models
{
    public class PowerOutputKW
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int Value { get; set; } // Power output in kW
        public string Description { get; set; } // Optional description
        public DateTime CreatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        public ICollection<PowerOutputKWPerPost> PowerOutputKWPerPosts { get; set; } = [];
    }
}
