using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Repositories.Data.Seed
{
    public class UserRolesSeed : IEntityTypeConfiguration<IdentityUserRole<Guid>>
    {
        public void Configure(EntityTypeBuilder<IdentityUserRole<Guid>> builder)
        {
            builder.HasData(
                new IdentityUserRole<Guid>
                {
                    UserId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    RoleId = Guid.Parse("11111111-1111-1111-1111-111111111111")
                },
                new IdentityUserRole<Guid>
                {
                    UserId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    RoleId = Guid.Parse("22222222-2222-2222-2222-222222222222")
                }
            );
        }
    }
}
