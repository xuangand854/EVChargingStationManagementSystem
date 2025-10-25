using Infrastructure.Models;
using System;
using System.Collections.Generic;

namespace Infrastructure.Data.Seed
{
    public static class VehicleModelSeed
    {
        public static List<VehicleModel> GetVehicleModels() => new List<VehicleModel>
        {
            new VehicleModel
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                ModelName = "VF8",
                Brand = "VinFast",
                VehicleType = "Car",
                ModelYear = 2025,
                BatteryCapacityKWh = 75,
                RecommendedChargingPowerKW = 11,
                ImageUrl = "string",
                Status = "Active",
                CreatedAt = new DateTime(2025,1,1),
                UpdatedAt = new DateTime(2025,1,1),
                IsDeleted = false,
                CreatedBy = Guid.Parse("11111111-1111-1111-1111-111111111111")
            }
        };
    }
}