using Common.DTOs.AuthDto;
using Services.Base;

namespace Services.IServices
{
    public interface IAuthService
    {
        Task<IServiceResult> RegisterAccount(RegisterAccountDto request);
    }
}
