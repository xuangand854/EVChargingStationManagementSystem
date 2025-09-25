#nullable disable
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Repositories.Models;
using Repositories.ModelsConfig;

namespace Repositories.Data
{
    public class EVCSMSContext : IdentityDbContext<UserAccount, Role, Guid>
    {
        public EVCSMSContext() { }
        public EVCSMSContext(DbContextOptions<EVCSMSContext> options) : base(options) { }

        public DbSet<UserAccount> UserAccounts { get; set; }
        public DbSet<EVDriver> EVDrivers { get; set; }
        public DbSet<Ranking> Rankings { get; set; }
        public DbSet<UserVehicle> UserVehicles { get; set; }
        public DbSet<VehicleModel> VehicleModels { get; set; }
        public DbSet<ChargingStation> ChargingStations { get; set; }
        public DbSet<SCStaff> SCStaffs { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<ChargingPost> ChargingPosts { get; set; }
        public DbSet<ChargingSession> ChargingSessions { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<NotificationRecipient> NotificationRecipients { get; set; }
        public DbSet<SystemConfiguration> SystemConfigurations { get; set; }
        public DbSet<PowerOutputKW> PowerOutputsKW { get; set; }
        public DbSet<PowerOutputKWPerPost> PowerOutputKWPerPosts { get; set; }

        public static string GetConnectionString(string connectionStringName)
        {
            var config = new ConfigurationBuilder()
                .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
                .AddJsonFile("appsettings.json")
                .Build();

            string connectionString = config.GetConnectionString(connectionStringName);

            return connectionString;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
            => optionsBuilder.UseSqlServer(GetConnectionString("DefaultConnection"));

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.ApplyConfiguration(new SystemConfigurationConfig());
            builder.ApplyConfiguration(new BookingConfig());
            builder.ApplyConfiguration(new ChargingStationConfig());
            builder.ApplyConfiguration(new ChargingPostConfig());
            builder.ApplyConfiguration(new NotificationConfig());
            builder.ApplyConfiguration(new NotificationRecipientConfig());
            builder.ApplyConfiguration(new UserVehicleConfig());
            builder.ApplyConfiguration(new VehicleModelConfig());
            builder.ApplyConfiguration(new ChargingSessionConfig());
            builder.ApplyConfiguration(new TransactionConfig());
            builder.ApplyConfiguration(new SCStaffConfig());
            builder.ApplyConfiguration(new EVDriverConfig());
        }
    }
}
