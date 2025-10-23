﻿using BusinessLogic.IServices;
using Common;
using Common.DTOs.ChargingSessionDto;
using Common.Helpler;
using Microsoft.AspNetCore.Mvc;

namespace APIs.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChargingSessionController(IChargingSessionService service) : ControllerBase
    {
        private readonly IChargingSessionService _service = service;

        [HttpGet]
        public async Task<IActionResult> GetList()
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

            var result = await _service.GetList(userId);

            if (result.Status == Const.SUCCESS_READ_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        [HttpGet("{sessionId}")]
        public async Task<IActionResult> GetById([FromRoute] Guid sessionId)
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

            var result = await _service.GetById(sessionId, userId);

            if (result.Status == Const.SUCCESS_READ_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        [HttpPost("Start")]
        public async Task<IActionResult> Start([FromBody]ChargingSessionStartDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _service.Start(dto);

            if (result.Status == Const.SUCCESS_CREATE_CODE && result.Data is ChargingSessionViewDetailDto createdDto)
                return CreatedAtAction(nameof(GetById), new { sessionId = createdDto.Id },
                        new { data = result.Data, message = result.Message });

            if (result.Status == Const.FAIL_CREATE_CODE)
                return Conflict(new { message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        [HttpPatch("Stop")]
        public async Task<IActionResult> Stop([FromBody] ChargingSessionStopDto dto, Guid sessionId)
        {
            var result = await _service.Stop(dto, sessionId);

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
