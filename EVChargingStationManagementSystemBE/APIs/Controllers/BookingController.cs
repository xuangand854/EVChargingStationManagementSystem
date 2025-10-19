using BusinessLogic.IServices;
using Common;
using Common.DTOs.BookingDto;
using Common.Helpler;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "EVDriver,Admin")]
    public class BookingController(IBookingService service) : ControllerBase
    {
        private readonly IBookingService _service = service;

        [HttpPost("create")]
        [Authorize(Roles = "EVDriver")]
        public async Task<IActionResult> Create([FromBody] BookingCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            Guid userId;
            try
            {
                userId = User.GetUserId();
            }
            catch
            {
                return Unauthorized(new { message = "Không xác định được userId từ token." });
            }

            var result = await _service.CreateBooking(dto, userId);

            if (result.Status == Const.SUCCESS_CREATE_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.FAIL_CREATE_CODE)
                return Conflict(new { message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        [HttpGet]
        public async Task<IActionResult> GetList()
        {
            Guid? userId = null;

            if (User.IsInRole("EVDriver"))
            {
                try
                {
                    userId = User.GetUserId();
                }
                catch
                {
                    return Unauthorized(new { message = "Không xác định được userId từ token." });
                }
            }

            var result = await _service.GetBookingList(userId);

            if (result.Status == Const.SUCCESS_READ_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        [HttpGet("{bookingId}")]
        public async Task<IActionResult> GetById([FromRoute] Guid bookingId)
        {
            var result = await _service.GetBookingDetail(bookingId);

            if (result.Status == Const.SUCCESS_READ_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        [HttpPut("{bookingId}/checkin")]
        [Authorize(Roles = "EVDriver")]
        public async Task<IActionResult> CheckIn([FromRoute] Guid bookingId)
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

            var result = await _service.CheckInBooking(bookingId, userId);

            if (result.Status == Const.SUCCESS_UPDATE_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.FAIL_UPDATE_CODE)
                return Conflict(new { message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        [HttpPut("{bookingId}/complete")]
        [Authorize(Roles = "EVDriver")]
        public async Task<IActionResult> Complete([FromRoute] Guid bookingId, [FromQuery] double? batteryCapacity = null)
        {
            // Gọi service, hệ thống sẽ tự tính ActualEnergyKWh theo công thức nội bộ
            var result = await _service.CompleteBooking(bookingId, batteryCapacity);

            if (result.Status == Const.SUCCESS_UPDATE_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.FAIL_UPDATE_CODE)
                return Conflict(new { message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        [HttpDelete("{bookingId}/cancel")]
        [Authorize(Roles = "EVDriver")]
        public async Task<IActionResult> Cancel([FromRoute] Guid bookingId)
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

            var result = await _service.CancelBooking(bookingId, userId);

            if (result.Status == Const.SUCCESS_UPDATE_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.FAIL_UPDATE_CODE)
                return Conflict(new { message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }
    }
}
