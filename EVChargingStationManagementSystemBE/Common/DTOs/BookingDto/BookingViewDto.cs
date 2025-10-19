namespace Common.DTOs.BookingDto
{
    public class BookingViewDto
    {
        public Guid Id { get; set; }

        // Người đặt
        public Guid BookedBy { get; set; }
        public string? DriverName { get; set; }

        // Trạm sạc
        public Guid StationId { get; set; }
        public string? StationName { get; set; }

        // Thông tin thời gian
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        // Pin và năng lượng
        public double? CurrentBattery { get; set; }
        public double? TargetBattery { get; set; }
        public double? EstimatedEnergyKWh { get; set; }
        public double? ActualEnergyKWh { get; set; }

        // Trạng thái
        public string Status { get; set; }
    }
}