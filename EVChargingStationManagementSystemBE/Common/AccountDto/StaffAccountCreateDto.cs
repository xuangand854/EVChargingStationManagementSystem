using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.StaffDto
{
    public class StaffAccountCreateDto
    {
        [Required(ErrorMessage = "Tên không được bỏ trống")]
        [StringLength(100)]
        public string Name { get; set; }

        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Số điện thoại là bắt buộc")]
        [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
        public string PhoneNumber { get; set; }

        public string? Address { get; set; }
        public string? ProfilePictureUrl { get; set; }

        [Required(ErrorMessage = "Password là bắt buộc")]
        public string Password { get; set; }  // hash ở service

        public string Role { get; set; } = "Staff";  // mặc định Staff
    }
}