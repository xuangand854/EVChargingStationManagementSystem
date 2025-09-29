using BusinessLogic.Base;
using Common.DTOs.AuthDto;

namespace BusinessLogic.IServices
{
    public interface IAuthService
    {
        Task<IServiceResult> RegisterAccount(RegisterAccountDto request);
        Task<IServiceResult> Login(LoginDto dto);
    }
}
