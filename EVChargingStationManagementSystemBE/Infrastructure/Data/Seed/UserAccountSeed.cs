using Microsoft.AspNetCore.Identity;
using Infrastructure.Models;

namespace Infrastructure.Data.Seed
{
    public static class UserAccountSeed
    {
        public static List<UserAccount> GetUserAccounts()
        {
            var hasher = new PasswordHasher<UserAccount>();
            var admin = new UserAccount
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Name = "Admin",
                Email = "admin@gmail.com",
                RegistrationDate = new DateTime(2025, 01, 01),
                CreatedAt = new DateTime(2025, 01, 01),
                UpdatedAt = new DateTime(2025, 01, 01),
                Status = "Active",
                UserName = "admin@gmail.com",
                NormalizedEmail = "ADMIN@GMAIL.COM",
                EmailConfirmed = true,
                SecurityStamp = "b0a67e8b-2351-4d2b-8ef1-1e908f5b63e1",
                ConcurrencyStamp = "457f1c5c-f68e-4364-912e-f0e443f8243d",
                LockoutEnabled = true,
                PhoneNumber = "0123456789",
            };
            //var staff = new UserAccount
            //{
            //    Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            //    Name = "Staff",
            //    Email = "staff@gmail.com",
            //    RegistrationDate = new DateTime(2025, 01, 01),
            //    CreatedAt = new DateTime(2025, 01, 01),
            //    UpdatedAt = new DateTime(2025, 01, 01),
            //    Status = "Active",
            //    UserName = "staff@gmail.com",
            //    NormalizedEmail = "STAFF@GMAIL.COM",
            //    EmailConfirmed = true,
            //    SecurityStamp = "142fa5de-d603-4453-81f9-5c9347280452",
            //    ConcurrencyStamp = "26aff629-ed41-424c-986c-bec9fb174ae6",
            //    LockoutEnabled = true
            //};
            admin.PasswordHash = "AQAAAAEAACcQAAAAEM1Xyeldl4HuIOaMf7BQdVAlsJeZsckJRwqii7Lw/+qJ1qNg0Q7BS61ODpuUt+/RVQ==";
            //staff.PasswordHash = "AQAAAAEAACcQAAAAEM1Xyeldl4HuIOaMf7BQdVAlsJeZsckJRwqii7Lw/+qJ1qNg0Q7BS61ODpuUt+/RVQ==";
            return [admin];
        }
    }
}
