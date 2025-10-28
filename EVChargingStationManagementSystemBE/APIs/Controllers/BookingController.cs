using BusinessLogic.IServices;
using Common;
using Common.DTOs.BookingDto;
using Common.Helper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace APIs.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingController(IBookingService service) : ControllerBase
    {
        private readonly IBookingService _service = service;

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateBooking([FromBody] BookingCreatedDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            Guid userId;
            try { userId = User.GetUserId(); }
            catch { return Unauthorized(new { message = "Không xác định được userId từ token." }); }

            var result = await _service.CreateBooking(dto, userId);

            if (result.Status == Const.SUCCESS_CREATE_CODE)
                return Created("", new { data = result.Data, message = result.Message });

            if (result.Status == Const.FAIL_CREATE_CODE)
                return Conflict(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetBookingList()
        {
            Guid userId;
            try { userId = User.GetUserId(); }
            catch { return Unauthorized(new { message = "Không xác định được userId từ token." }); }

            var result = await _service.GetBookingList(userId);

            if (result.Status == Const.SUCCESS_READ_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        [HttpGet("{bookingId}")]
        [Authorize]
        public async Task<IActionResult> GetBookingDetail(Guid bookingId)
        {
            var result = await _service.GetBookingDetail(bookingId);

            if (result.Status == Const.SUCCESS_READ_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        [HttpPatch("checkin")]
        [Authorize]
        public async Task<IActionResult> CheckInBooking([FromBody] BookingCheckInDto dto)
        {
            Guid userId;
            try { userId = User.GetUserId(); }
            catch { return Unauthorized(new { message = "Không xác định được userId từ token." }); }

            var result = await _service.CheckInBooking(dto, userId);

            if (result.Status == Const.SUCCESS_UPDATE_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.FAIL_UPDATE_CODE)
                return Conflict(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        [HttpDelete("{bookingId}")]
        [Authorize]
        public async Task<IActionResult> CancelBooking(Guid bookingId)
        {
            Guid userId;
            try { userId = User.GetUserId(); }
            catch { return Unauthorized(new { message = "Không xác định được userId từ token." }); }

            var result = await _service.CancelBooking(bookingId, userId);

            if (result.Status == Const.SUCCESS_DELETE_CODE)
                return NoContent();

            if (result.Status == Const.FAIL_DELETE_CODE)
                return Conflict(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        [HttpPost("auto-cancel-expired")]
        [Authorize(Roles = "Admin,System")]
        public async Task<IActionResult> AutoCancelExpiredBookings()
        {
            await _service.AutoCancelExpiredBookings();
            return Ok(new { message = "Đã xử lý hủy các booking hết hạn." });
        }

        [HttpPost("auto-reassign-error-stations")]
        [Authorize(Roles = "Admin,System")]
        public async Task<IActionResult> AutoReassignBookingsForErrorStations()
        {
            await _service.AutoReassignBookingsForErrorStations();
            return Ok(new { message = "Đã xử lý chuyển các booking khỏi trạm lỗi." });
        }

        [HttpPost("lock-no-show-accounts")]
        [Authorize(Roles = "Admin,System")]
        public async Task<IActionResult> LockAccountsWithTooManyNoShows()
        {
            await _service.LockAccountsWithTooManyNoShows();
            return Ok(new { message = "Đã khóa các tài khoản có quá nhiều lượt không đến." });
        }
    }
}
