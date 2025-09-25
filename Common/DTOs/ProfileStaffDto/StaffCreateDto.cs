using System;
using System.ComponentModel.DataAnnotations;

namespace Common.DTOs.ProfileStaffDto
{
    public class StaffProfileDto
    {
        [Required(ErrorMessage = "ID Staff là bắt buộc.")]
        public Guid StaffId { get; set; }

        [Required(ErrorMessage = "Tên không được để trống.")]
        [StringLength(100, ErrorMessage = "Tên không được vượt quá 100 ký tự.")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email là bắt buộc.")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        public string Email { get; set; } = string.Empty;

        [StringLength(200, ErrorMessage = "Không được vượt quá 200 ký tự.")]
        public string? WorkingLocation { get; set; }

        [Required(ErrorMessage = "Trạng thái không được để trống.")]
        [RegularExpression("Active|Inactive", ErrorMessage = "Trạng thái chỉ được là Active hoặc Inactive.")]
        public string Status { get; set; } = "Active";
    }
}
