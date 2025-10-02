using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Infrastructure.Models;

namespace Infrastructure.ModelsConfig
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
