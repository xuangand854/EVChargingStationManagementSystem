using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Repositories.Models;

namespace Repositories.ModelsConfig
{
    public class SCStaffConfig : IEntityTypeConfiguration<SCStaff>
    {
        public void Configure(EntityTypeBuilder<SCStaff> builder)
        {
            builder.ToTable("SCStaff");
            builder.HasOne(sc => sc.UserAccountNavigation)
                   .WithMany(ua => ua.SCStaffs)
                   .HasForeignKey(sc => sc.AccountId);
        }
    }
}
