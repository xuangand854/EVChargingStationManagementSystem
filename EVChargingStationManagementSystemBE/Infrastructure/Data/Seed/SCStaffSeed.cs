using Infrastructure.Models;
using System;
using System.Collections.Generic;

namespace Infrastructure.Data.Seed
{
    public static class SCStaffSeed
    {
        public static List<SCStaffProfile> GetSCStaffs() => new List<SCStaffProfile>
        {
            new SCStaffProfile
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                AccountId = Guid.Parse("44444444-4444-4444-4444-444444444444"), // staff@gmail.com
                WorkingLocation = "Hanoi Station",
                Status = "Active",
                CreatedAt = new DateTime(2025,1,1),
                UpdatedAt = new DateTime(2025,1,1),
                IsDeleted = false
            }
        };
    }
}
