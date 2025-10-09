using System.ComponentModel.DataAnnotations;

namespace Common.DTOs.ProfileStaffDto
{
    public class StaffAccountCreateDto
    {
        [Required(ErrorMessage = "Email không được để trống")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Xác nhận mật khẩu không được để trống")]
        [Compare("Password", ErrorMessage = "Mật khẩu xác nhận không khớp")]
        public string ConfirmPassword { get; set; }

    
        [Required(ErrorMessage = "Họ và tên không được để trống")]
        [MaxLength(100)]
        public string Name { get; set; }   

        [Phone]
        [MaxLength(15)]
        public string PhoneNumber { get; set; }  

        [MaxLength(255)]
        public string Address { get; set; } 

        [MaxLength(255)]
        public string ProfilePictureUrl { get; set; }  

        [MaxLength(255)]
        public string WorkingLocation { get; set; } 

        public string? Status { get; set; } = "Active";  
    }
}
