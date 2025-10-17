﻿using BusinessLogic.IServices;
using Common;
using Common.DTOs.SystemConfigurationDto;
using Common.Helpler;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace APIs.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SystemConfigurationController(ISystemConfigurationService service) : ControllerBase
    {
        private readonly ISystemConfigurationService _service = service;

        [HttpGet("GetList")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetList()
        {
            var result = await _service.GetList();

            if (result.Status == Const.SUCCESS_READ_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        [HttpPut("Update/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] SystemConfigurationUpdateDto dto)
        {
            Guid userId;
            try
            {
                userId = User.GetUserId();
            }
            catch
            {
                return Unauthorized(new { message = "Không xác định được userId từ token." });
            }

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _service.Update(id, dto, userId);
            if (result.Status == Const.SUCCESS_UPDATE_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            if (result.Status == Const.FAIL_UPDATE_CODE)
                return Conflict(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }
    }
}
