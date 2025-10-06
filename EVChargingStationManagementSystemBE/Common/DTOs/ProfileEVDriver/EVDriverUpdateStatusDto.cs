using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTOs.ProfileEVDriver
{
   
    public class EVDriverUpdateStatusDto
    {
        [Required(ErrorMessage = "DriverId là bắt buộc")]
        public Guid DriverId { get; set; }

        [Required(ErrorMessage = "Trạng thái là bắt buộc")]
        [RegularExpression("Active|Inactive", ErrorMessage = "Chỉ được Active hoặc Inactive")]
        public string Status { get; set; }
    }
}