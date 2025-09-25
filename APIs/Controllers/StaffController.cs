using Common;
using Common.DTOs.AuthDto;
using Common.DTOs.ProfileStaffDto;
using Microsoft.AspNetCore.Mvc;
using Services.IServices;
using Services.Services;

namespace APIs.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StaffController(ISCStaffService staffService) : ControllerBase
    {
        private readonly ISCStaffService _staffService = staffService;
        [HttpGet("{id}")]
        public async Task<IActionResult> GetStaff(Guid id)
        {

            var result = await _staffService.GetById(id);

            if (result.Status == Const.FAIL_READ_CODE)
            {
                return BadRequest(result.Data);
            }

            //return Ok(new { Message = "Register success!" });
            return Ok(result.Data);
        }
    }
}

