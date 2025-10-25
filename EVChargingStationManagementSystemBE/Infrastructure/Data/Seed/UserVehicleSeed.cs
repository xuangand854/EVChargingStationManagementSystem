using Infrastructure.Models;
using System;
using System.Collections.Generic;

namespace Infrastructure.Data.Seed
{
    public static class UserVehicleSeed
    {
        public static List<UserVehicle> GetUserVehicles() => new List<UserVehicle>
        {
            new UserVehicle
            {
                DriverId = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                VehicleModelId = Guid.Parse("11111111-1111-1111-1111-111111111111")
            }
        };
    }
}
