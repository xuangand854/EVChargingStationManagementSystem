using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTOs.VoucherDto
{
    public class UseVoucherRequestDto
    {
        public Guid UserVoucherId { get; set; }
        public Guid StationId { get; set; }
    }
}