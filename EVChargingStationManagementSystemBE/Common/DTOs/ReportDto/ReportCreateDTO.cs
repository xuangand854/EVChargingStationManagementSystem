using System;
using System.ComponentModel.DataAnnotations;

namespace Common.DTOs
{
    public class ReportCreateDTO
    {
        [Required, MaxLength(200)]
        public string Title { get; set; }

        [Required]
        public string ReportType { get; set; } // Bug, Maintenance, etc.

        [Required]
        public string Severity { get; set; } // Low, Medium, High, Critical

        public string Description { get; set; }

        [Required]
        public Guid ReportedById { get; set; }

        public Guid? StationId { get; set; }
        public Guid? PostId { get; set; }
    }
}
