using System.ComponentModel.DataAnnotations;

namespace Common.DTOs.ProfileStaffDto
{
    public class StaffCreateProfileDto
    {
        [Required(ErrorMessage = "Tên là bắt buộc")]
        [StringLength(100, ErrorMessage = "Tên không vượt quá 100 ký tự.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; } = string.Empty;

        [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
        public string? PhoneNumber { get; set; }

        [StringLength(200, ErrorMessage = "Địa chỉ không vượt quá 200 ký tự.")]
        public string? Address { get; set; }

        public string? ProfilePictureUrl { get; set; }

        [StringLength(200, ErrorMessage = "Nơi làm việc không vượt quá 200 ký tự.")]
        public string? WorkingLocation { get; set; }

        [Required(ErrorMessage = "Trạng thái không được để trống")]
        [RegularExpression("Active|Inactive", ErrorMessage = "Trạng thái chỉ được là Active hoặc Inactive.")]
        public string Status { get; set; } = "Active";
    }
}
