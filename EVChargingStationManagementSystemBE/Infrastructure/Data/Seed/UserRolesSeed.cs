using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;

namespace Infrastructure.Data.Seed
{
    public static class UserRolesSeed
    {
        public static List<IdentityUserRole<Guid>> GetUserRoles() => new List<IdentityUserRole<Guid>>
        {
            new IdentityUserRole<Guid>
            {
                UserId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                RoleId = Guid.Parse("11111111-1111-1111-1111-111111111111")
            },
            new IdentityUserRole<Guid>
            {
                UserId = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                RoleId = Guid.Parse("33333333-3333-3333-3333-333333333333")
            }
        };
    }
}
