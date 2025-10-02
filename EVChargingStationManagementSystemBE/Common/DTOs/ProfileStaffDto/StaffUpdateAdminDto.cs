using System.ComponentModel.DataAnnotations;

namespace Common.DTOs.ProfileStaffDto
{
    public class StaffUpdateAdminDto
    {
        [Required(ErrorMessage = "StaffId là bắt buộc")]
        public Guid StaffId { get; set; }

        [StringLength(100, ErrorMessage = "Tên không vượt quá 100 ký tự.")]
        public string? Name { get; set; }

        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string? Email { get; set; }

        [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
        public string? PhoneNumber { get; set; }

        [StringLength(200, ErrorMessage = "Địa chỉ không vượt quá 200 ký tự.")]
        public string? Address { get; set; }

        public string? ProfilePictureUrl { get; set; }

        [StringLength(200, ErrorMessage = "Nơi làm việc không vượt quá 200 ký tự.")]
        public string? WorkingLocation { get; set; }

        [RegularExpression("Active|Inactive", ErrorMessage = "Trạng thái chỉ được là Active hoặc Inactive.")]
        public string? Status { get; set; }
    }
}
