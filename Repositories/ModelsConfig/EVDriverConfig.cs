using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Repositories.Models;

namespace Repositories.ModelsConfig
{
    public class EVDriverConfig : IEntityTypeConfiguration<EVDriver>
    {
        public void Configure(EntityTypeBuilder<EVDriver> builder)
        {
            builder.ToTable("EVDriver");
            builder.HasOne(ev => ev.UserAccountNavigation)
                   .WithMany(ua => ua.EVDrivers)
                   .HasForeignKey(ev => ev.AccountId);
        }
    }
}
