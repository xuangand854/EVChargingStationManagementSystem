using System;

namespace Common.DTOs.ReportDto
{
    public class ViewReportDTO
    {
        public Guid Id { get; set; }

        public string Title { get; set; }

        public string ReportType { get; set; } // Bug, Maintenance, Feature Request, Other

        public string Severity { get; set; } // Low, Medium, High, Critical

        public string Description { get; set; }

        public string Status { get; set; } // Open, In Progress, Resolved, Closed

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public DateTime? ResolvedAt { get; set; }

        // Reporter info
        public Guid ReportedById { get; set; }
        public string ReportedByName { get; set; }

        // Optional: Related station
        public Guid? StationId { get; set; }
        public string StationName { get; set; }

        // Optional: Related post
        public Guid? PostId { get; set; }
        public string PostName { get; set; }
    }
}
