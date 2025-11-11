using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTOs.VoucherDto
{
    public class RedeemVoucherRequestDto
    {
        public Guid EVDriverId { get; set; }
        public Guid VoucherId { get; set; }
    }
}