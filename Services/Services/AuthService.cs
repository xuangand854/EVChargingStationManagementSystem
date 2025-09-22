using Common;
using Common.DTOs.AuthDto;
using Mapster;
using MapsterMapper;
using Microsoft.AspNetCore.Identity;
using Repositories.Models;
using ServiceLayer.Base;
using Services.Base;
using Services.IServices;

namespace Services.Services
{
    public class AuthService(UserManager<UserAccount> userManager, IMapper mapper) : IAuthService
    {
        private readonly UserManager<UserAccount> _userManager = userManager;
        private readonly IMapper _mapper = mapper;
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
    }
}
