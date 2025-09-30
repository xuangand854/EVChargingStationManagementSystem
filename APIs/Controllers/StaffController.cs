using BusinessLogic.IServices;
using Common;
using Common.DTOs.ProfileStaffDto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace APIs.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StaffController(ISCStaffService staffService) : ControllerBase
    {
        private readonly ISCStaffService _staffService = staffService;

        // ✅ GET: api/staff/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetStaff(Guid id)
        {
            var result = await _staffService.GetById(id);

            if (result.Status == Const.FAIL_READ_CODE)
                return NotFound(new { message = result.Message });

            if (result.Status == Const.SUCCESS_READ_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        // ✅ POST: api/staff/{accountId}/profile
        [HttpPost("{accountId}/profile")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateProfile(Guid accountId, [FromBody] StaffCreateProfileDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _staffService.CreateStaffProfile(dto, accountId);

            if (result.Status == Const.FAIL_CREATE_CODE)
                return BadRequest(new { message = result.Message });

            if (result.Data is not StaffViewDto staff)
                return StatusCode(500, new { message = "Invalid staff data returned" });

            return CreatedAtAction(
                nameof(GetStaff),
                new { id = staff.Id },
                new { data = staff, message = result.Message }
            );
        }

        // ✅ PATCH: api/staff/update/admin
        [HttpPatch("update/admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateProfileByAdmin([FromBody] StaffUpdateAdminDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _staffService.UpdateProfileByAdmin(dto);

            if (result.Status == Const.FAIL_UPDATE_CODE || result.Status == Const.FAIL_READ_CODE)
                return BadRequest(new { message = result.Message });

            if (result.Status == Const.SUCCESS_UPDATE_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        // ✅ PATCH: api/staff/update
        [HttpPatch("update")]
        [Authorize(Roles = "Staff")]
        public async Task<IActionResult> UpdateProfileByStaff([FromBody] StaffUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _staffService.UpdateProfileByStaff(dto);

            if (result.Status == Const.FAIL_UPDATE_CODE || result.Status == Const.FAIL_READ_CODE)
                return BadRequest(new { message = result.Message });

            if (result.Status == Const.SUCCESS_UPDATE_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        // ✅ PATCH: api/staff/{id}/status
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStaffStatus(Guid id, [FromBody] StaffUpdateStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.StaffId != id)
                return BadRequest(new { message = "StaffId in route and body do not match" });

            var result = await _staffService.UpdateStaffStatus(dto);

            if (result.Status == Const.FAIL_UPDATE_CODE || result.Status == Const.FAIL_READ_CODE)
                return BadRequest(new { message = result.Message });

            if (result.Status == Const.SUCCESS_UPDATE_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        // ✅ DELETE: api/staff/{staffId}
        [HttpDelete("{staffId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteStaff(Guid staffId)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _staffService.Delete(staffId);

            if (result.Status == Const.FAIL_READ_CODE)
                return NotFound(new { message = result.Message });

            if (result.Status == Const.FAIL_DELETE_CODE)
                return BadRequest(new { message = result.Message });

            if (result.Status == Const.SUCCESS_DELETE_CODE)
                return Ok(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }
    }
}
