using Common;
using Common.DTOs.AuthDto;
using Microsoft.AspNetCore.Mvc;
using Services.IServices;

namespace APIs.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController(IAuthService authService) : ControllerBase
    {
        private readonly IAuthService _authService = authService;

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterAccountDto dto)
        {

            var result = await _authService.RegisterAccount(dto);

            if (result.Status == Const.FAIL_CREATE_CODE)
            {
                return BadRequest(result.Data);
            }

            //return Ok(new { Message = "Register success!" });
            return Ok(result.Message);
        }
    }
}
