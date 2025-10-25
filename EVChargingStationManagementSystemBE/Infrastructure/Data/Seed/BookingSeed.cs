using Infrastructure.Models;
using System;

namespace Infrastructure.Data.Seed
{
    public static class BookingSeed
    {
        public static readonly DateTime CreatedAt1 = new DateTime(2025, 10, 25, 12, 0, 0);
        public static readonly DateTime StartTime1 = new DateTime(2025, 10, 26, 9, 0, 0);
        public static readonly DateTime EndTime1 = new DateTime(2025, 10, 26, 11, 0, 0);

        public static Booking[] GetBookings() => new Booking[]
        {
            new Booking
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                StationId = Guid.Parse("55555555-5555-5555-5555-555555555555"),
                ChargingStationNavigation = null!,
                BookedBy = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                BookedByNavigation = null!,
                StartTime = StartTime1,
                EndTime = EndTime1,
                Status = "Scheduled",
                CreatedAt = CreatedAt1,
                UpdatedAt = CreatedAt1
            }
        };
    }
}
