using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Infrastructure.Models;

namespace Infrastructure.ModelsConfig
{
    internal class UserVehicleConfig : IEntityTypeConfiguration<UserVehicle>
    {
        public void Configure(EntityTypeBuilder<UserVehicle> builder)
        {
            builder.ToTable("UserVehicle");

            builder.HasOne(uv => uv.EVDriverNavigation)
                   .WithMany(ev => ev.UserVehicles)
                   .HasForeignKey(uv => uv.DriverId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(uv => uv.VehicleModelNavigation)
                     .WithMany(vm => vm.UserVehicles)
                     .HasForeignKey(uv => uv.VehicleModelId)
                     .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
