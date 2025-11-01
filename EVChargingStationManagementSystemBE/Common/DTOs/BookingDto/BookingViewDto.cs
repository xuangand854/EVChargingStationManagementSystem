﻿using System;

namespace Common.DTOs.BookingDto
{
    public class BookingViewDto
    {
        public Guid Id { get; set; }

        // Thời gian dự kiến và thực tế
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public DateTime? ActualStartTime { get; set; }
        public DateTime? ActualEndTime { get; set; }

        // Trạng thái
        public string Status { get; set; } = "Scheduled";

        // Thông tin pin & năng lượng
        public double? CurrentBattery { get; set; }
        public double? TargetBattery { get; set; }
        public double? EstimatedEnergyKWh { get; set; }
        public double? ActualEnergyKWh { get; set; }

        // Trạm sạc
        public Guid StationId { get; set; }
        public string? StationName { get; set; }
        public string? StationAddress { get; set; }

        // Connector
        public Guid? ConnectorId { get; set; }
        public string? ConnectorName { get; set; }

        // Người đặt
        public Guid BookedBy { get; set; }
        public string? DriverName { get; set; }
        public string? DriverEmail { get; set; }

        // Mã check-in
        public string? CheckInCode { get; set; }

        // Audit
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
    }
}
