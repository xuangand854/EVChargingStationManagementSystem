using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Data.Seed
{
    public static class UserRolesSeed
    {
        //public void Configure(EntityTypeBuilder<IdentityUserRole<Guid>> builder)
        //{
        //    builder.HasData(
        //        new IdentityUserRole<Guid>
        //        {
        //            UserId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
        //            RoleId = Guid.Parse("11111111-1111-1111-1111-111111111111")
        //        },
        //        new IdentityUserRole<Guid>
        //        {
        //            UserId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
        //            RoleId = Guid.Parse("22222222-2222-2222-2222-222222222222")
        //        }
        //    );
        //}

        public static List<IdentityUserRole<Guid>> GetUserRoles()
        {
            return [
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
                ];
        }
    }
}
