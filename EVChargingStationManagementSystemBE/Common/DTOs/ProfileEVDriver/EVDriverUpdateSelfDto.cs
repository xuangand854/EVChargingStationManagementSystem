using System.ComponentModel.DataAnnotations;

namespace Common.DTOs.EVDriverDto
{
    public class EVDriverUpdateSelfDto
    {
        [Required(ErrorMessage = "DriverId là bắt buộc")]
        public Guid DriverId { get; set; }

        // Các thông tin cá nhân (UserAccountNavigation)
        public string? Name { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? ProfilePictureUrl { get; set; }

        // EVDriver có thể cập nhật xe mà mình sở hữu
        public List<Guid>? VehicleModelIds { get; set; }
    }
}
