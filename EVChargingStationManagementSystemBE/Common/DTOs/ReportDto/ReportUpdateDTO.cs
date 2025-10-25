using System;
using System.ComponentModel.DataAnnotations;

namespace Common.DTOs
{
    public class ReportUpdateDTO
    {
        [Required]
        public Guid Id { get; set; }

        public string Title { get; set; }
        public string ReportType { get; set; }
        public string Severity { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }

        public DateTime? ResolvedAt { get; set; }
        public Guid? StationId { get; set; }
        public Guid? PostId { get; set; }
    }
}
