#nullable disable
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Repositories.Models;

public class UserAccount : IdentityUser<Guid>
{
    [Required, MaxLength(255)]
    public string Name { get; set; }

    public string Gender { get; set; }

    public DateTime? DateOfBirth { get; set; }

    public string Address { get; set; }

    public string ProfilePictureUrl { get; set; }

    public DateTime RegistrationDate { get; set; } = DateTime.Now;

    public DateTime? LastLogin { get; set; }

    public bool EmailVerified { get; set; } = false;

    public string VerificationCode { get; set; }

    public bool IsVerified { get; set; } = false;

    public string LoginType { get; set; } = "System";

    public string Status { get; set; } = "Active";

    public DateTime UpdatedAt { get; set; } = DateTime.Now;

    public bool IsDeleted { get; set; } = false;

    public ICollection<EVDriver> EVDrivers { get; set; } = [];
    public ICollection<SCStaff> SCStaffs { get; set; } = [];
    public ICollection<Booking> Bookings { get; set; } = [];
    public ICollection<VehicleModel> VehicleModels { get; set; } = [];
    public ICollection<UserVehicle> UserVehicles { get; set; } = [];
    public ICollection<ChargingStation> ChargingStations { get; set; } = [];
    public ICollection<ChargingSession> ChargingSessions { get; set; } = [];

    [InverseProperty("PaidByNavigation")]
    public ICollection<Transaction> TransactionsPaid { get; set; } = [];

    [InverseProperty("RecordedByNavigation")]
    public ICollection<Transaction> TransactionsRecorded { get; set; } = [];
    public ICollection<Notification> Notifications { get; set; } = [];
    public ICollection<NotificationRecipient> NotificationRecipients { get; set; } = [];
    [InverseProperty("SystemConfigurationCreatedByNavigation")]
    public ICollection<SystemConfiguration> SystemConfigurationsCreator { get; set; } = [];

    [InverseProperty("SystemConfigurationUpdatedByNavigation")]
    public ICollection<SystemConfiguration> SystemConfigurationsUpdater { get; set; } = [];
}
