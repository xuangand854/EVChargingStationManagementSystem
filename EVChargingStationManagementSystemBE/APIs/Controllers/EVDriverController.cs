using BusinessLogic.IServices;
using Common;
using Common.DTOs.EVDriverDto;
using Common.DTOs.ProfileEVDriver;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EVDriverController(IEVDriverService evDriverService) : ControllerBase
    {
        private readonly IEVDriverService _evDriverService = evDriverService;

        // GET: api/evdriver/{driverId}
        [HttpGet("{driverId}")]// Sử dụng để có thể xem được thông tin của ng dùng 
        public async Task<IActionResult> GetById([FromRoute] Guid driverId)
        {
            var result = await _evDriverService.GetById(driverId);

            if (result.Status == Const.SUCCESS_READ_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        // POST: api/evdriver/{accountId}/profile
        [HttpPost("{accountId}/profile")]
        [Authorize(Roles = "EVDriver")] // EVDriver tự tạo profile
        public async Task<IActionResult> CreateProfile([FromRoute] Guid accountId, [FromBody] EVDriverCreateProfileDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _evDriverService.CreateProfile(dto, accountId);

            if (result.Status == Const.SUCCESS_CREATE_CODE && result.Data is EVDriverViewDto createdDto)
                return CreatedAtAction(nameof(GetById), new { driverId = createdDto.Id },
                        new { data = result.Data, message = result.Message });

            if (result.Status == Const.FAIL_CREATE_CODE)
                return Conflict(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        // PUT: api/evdriver/update
        [HttpPut("update")]
        [Authorize(Roles = "EVDriver")] // chỉ có người dùng mới đc đổi thông tin của chính bản thân mình 
        public async Task<IActionResult> UpdateProfile([FromBody] EVDriverUpdateSelfDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _evDriverService.UpdateProfile(dto);

            if (result.Status == Const.SUCCESS_UPDATE_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            if (result.Status == Const.FAIL_UPDATE_CODE)
                return Conflict(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        // PATCH: api/evdriver/{driverId}/status
        [HttpPatch("{driverId}/status")]
        [Authorize(Roles = "Admin")] // Chỉ Admin được đổi status
        public async Task<IActionResult> UpdateStatus([FromRoute] Guid driverId, [FromBody] EVDriverUpdateStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.DriverId != driverId)
                return BadRequest(new { message = "DriverId trong route và body không khớp" });

            var result = await _evDriverService.UpdateStatus(dto);

            if (result.Status == Const.SUCCESS_UPDATE_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            if (result.Status == Const.FAIL_UPDATE_CODE)
                return Conflict(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        // DELETE: api/evdriver/{driverId}
        [HttpDelete("{driverId}")]
        [Authorize(Roles = "Admin")] // Admin có quyền xoá EVDriver
        public async Task<IActionResult> Delete([FromRoute] Guid driverId)
        {
            var result = await _evDriverService.Delete(driverId);

            if (result.Status == Const.SUCCESS_DELETE_CODE)
                return NoContent();

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            if (result.Status == Const.FAIL_DELETE_CODE)
                return Conflict(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }
    }
}
