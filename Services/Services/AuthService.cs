using Common;
using Common.DTOs.AuthDto;
using Mapster;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Repositories.Models;
using Services.Base;
using Services.IServices;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Services.Services
{
    public class AuthService(UserManager<UserAccount> userManager, SignInManager<UserAccount> signInManager, IConfiguration configuration) : IAuthService
    {
        private readonly UserManager<UserAccount> _userManager = userManager;
        private readonly SignInManager<UserAccount> _signInManager = signInManager;
        private readonly IConfiguration _configuration = configuration;
        public async Task<IServiceResult> RegisterAccount(RegisterAccountDto dto)
        {
            //var user = new UserAccount
            //{
            //    UserName = dto.Email,
            //    Email = dto.Email,
            //    Name = dto.Name,
            //    PhoneNumber = dto.Phone,
            //    RegistrationDate = DateTime.UtcNow,
            //    Status = "Active"
            //};
            var user = new UserAccount();
            dto.Adapt(user);
            user.RegistrationDate = DateTime.UtcNow;
            user.Status = "Active";

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
                return new ServiceResult(Const.FAIL_CREATE_CODE, Const.FAIL_CREATE_MSG, result.Errors);

            // B2: gán role cho user
            //VD nếu muốn thêm nhiều role cho 1 user
            //await _userManager.AddToRolesAsync(user, new[] { "EVDriver", "BusinessManager" });
            var roleResult = await _userManager.AddToRoleAsync(user, "EVDriver");
            if (!roleResult.Succeeded)
                return new ServiceResult(Const.FAIL_CREATE_CODE, "Failed to assign role", roleResult.Errors);

            return new ServiceResult(Const.SUCCESS_CREATE_CODE, "Success register new account");
        }

        public async Task<IServiceResult> Login(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return new ServiceResult(Const.FAIL_READ_CODE, "Invalid email or email not exist");

            var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
            if (!result.Succeeded)
                //throw new UnauthorizedAccessException("Invalid username or password.");
                return new ServiceResult(Const.FAIL_READ_CODE, "Invalid username or password.");

            var authClaims = new List<Claim>
            {
                new("userId", user.Id.ToString()),
                //new("username", user.UserName.ToString()),
                new("email", user.Email),
                new("name", user.Name),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            var userRoles = await _userManager.GetRolesAsync(user);
            foreach (var role in userRoles)
            {
                authClaims.Add(new Claim("role", role));
            }

            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                expires: DateTime.Now.AddHours(3),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );
            return new ServiceResult
            (
                Const.SUCCESS_READ_CODE,
                Const.SUCCESS_READ_MSG,
                new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    expiration = token.ValidTo
                }
            );
        }
    }
}
