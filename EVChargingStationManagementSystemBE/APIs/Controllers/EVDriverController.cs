
using BusinessLogic.IServices;
using Common;
using Common.DTOs.ProfileEVDriverDto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EVDriverController : ControllerBase
    {
        private readonly IEVDriverService _evDriverService;

        public EVDriverController(IEVDriverService evDriverService)
        {
            _evDriverService = evDriverService;
        }

        //  GET: api/evdriver/all (Admin)
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _evDriverService.GetAll();

            if (result.Status == Const.SUCCESS_READ_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        //  GET: api/evdriver/{driverId} (Driver hoặc Admin)
        [HttpGet("{driverId}")]
        [Authorize(Roles = "Admin,EVDriver")]
        public async Task<IActionResult> GetById([FromRoute] Guid driverId)
        {
            var result = await _evDriverService.GetById(driverId);

            if (result.Status == Const.SUCCESS_READ_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

       
        //  PUT: api/evdriver/update (Driver tự cập nhật)
        [HttpPut("update")]
        [Authorize(Roles = "EVDriver")]
        public async Task<IActionResult> UpdateProfile([FromBody] EVDriverUpdateSelfDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _evDriverService.UpdateProfile(dto);

            if (result.Status == Const.SUCCESS_UPDATE_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.FAIL_UPDATE_CODE)
                return Conflict(new { message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        //  PATCH: api/evdriver/{driverId}/status (Admin)
        [HttpPatch("{driverId}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus([FromRoute] Guid driverId, [FromBody] EVDriverUpdateStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.DriverId != driverId)
                return BadRequest(new { message = "DriverId trong route và body không khớp" });

            var result = await _evDriverService.UpdateStatus(dto);

            if (result.Status == Const.SUCCESS_UPDATE_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.FAIL_UPDATE_CODE)
                return Conflict(new { message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        //  DELETE: api/evdriver/{driverId} (Admin)
        [HttpDelete("{driverId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete([FromRoute] Guid driverId)
        {
            var result = await _evDriverService.Delete(driverId);

            if (result.Status == Const.SUCCESS_DELETE_CODE)
                return NoContent();

            if (result.Status == Const.FAIL_DELETE_CODE)
                return Conflict(new { message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }
    }
}
