using Infrastructure.Models;
using System;
using System.Collections.Generic;

namespace Infrastructure.Data.Seed
{
    public static class EVDriverSeed
    {
        public static List<EVDriverProfile> GetEVDrivers() => new List<EVDriverProfile>
        {
            new EVDriverProfile
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                AccountId = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                Score = 100,
                Status = "Active",
                IsDeleted = false,
                CreatedAt = new DateTime(2025,1,1),
                UpdatedAt = new DateTime(2025,1,1),
                RankingId = null
            }
        };
    }
}
