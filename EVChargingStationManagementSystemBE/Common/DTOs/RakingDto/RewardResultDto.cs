using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTOs.RakingDto
{
    public class RewardResultDto
    {
        public Guid EVDriverId { get; set; }
        public int PointsEarned { get; set; }
        public string VoucherReward { get; set; } // e.g. "Giảm 50.000đ", "Miễn phí 1 tháng"
        public DateTime RewardedAt { get; set; }
    }
}