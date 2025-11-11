using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTOs.VoucherDto
{
    public class ExpireVoucherDto
    {
        public Guid UserVoucherId { get; set; }
        public DateTime ExpiredAt { get; set; }
        public string Status { get; set; } = "Expired";
    }
}