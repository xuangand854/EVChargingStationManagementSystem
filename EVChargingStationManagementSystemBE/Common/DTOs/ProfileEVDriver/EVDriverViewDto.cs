using System;
using System.Collections.Generic;

namespace Common.DTOs.EVDriverDto
{
    public class EVDriverViewDto
    {
        public Guid Id { get; set; }
        public Guid AccountId { get; set; }
        public Guid RankingId { get; set; }

        public int Score { get; set; }
        public bool IsActive { get; set; }

        public string Status { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Danh sách VehicleModel mà driver sở hữu
        public List<Guid> VehicleModelIds { get; set; } = new();
    }
}
