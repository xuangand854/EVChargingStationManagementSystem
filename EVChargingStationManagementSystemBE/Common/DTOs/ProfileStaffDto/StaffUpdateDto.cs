using System.ComponentModel.DataAnnotations;

namespace Common.DTOs.ProfileStaffDto
{
    public class StaffUpdateDto
    {
        [Required(ErrorMessage = "StaffId là bắt buộc")]
        public Guid StaffId { get; set; }

        [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
        public string? PhoneNumber { get; set; }

        [StringLength(200, ErrorMessage = "Địa chỉ không vượt quá 200 ký tự.")]
        public string? Address { get; set; }

        public string? ProfilePictureUrl { get; set; }
    }
}
