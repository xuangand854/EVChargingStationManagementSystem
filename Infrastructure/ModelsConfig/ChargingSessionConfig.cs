using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Infrastructure.Models;

namespace Infrastructure.ModelsConfig
{
    public class ChargingSessionConfig : IEntityTypeConfiguration<ChargingSession>
    {
        public void Configure(EntityTypeBuilder<ChargingSession> builder)
        {
            builder.ToTable("ChargingSession");

            builder.HasOne(cs => cs.ChargingPostNavigation)
                   .WithMany(cp => cp.ChargingSessions)
                   .HasForeignKey(cs => cs.ChargingPostId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(cs => cs.UserVehicleNavigation)
                    .WithMany(uv => uv.ChargingSessions)
                    .HasForeignKey(cs => cs.UserVehicleId)
                    .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(cs => cs.StartedByNavigation)
                    .WithMany(ev => ev.ChargingSessions)
                    .HasForeignKey(cs => cs.StartedBy);
        }
    }
}
