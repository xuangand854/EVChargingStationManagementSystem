using BusinessLogic.IServices;
using Common;
using Common.DTOs.BookingDto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        // POST: api/booking (EVDriver)
        [HttpPost]
        [Authorize(Roles = "EVDriver")]
        public async Task<IActionResult> CreateBooking([FromBody] BookingCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = Guid.Parse(User.Identity.Name!);
            var result = await _bookingService.CreateBooking(dto, userId);

            if (result.Status == Const.SUCCESS_CREATE_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.FAIL_CREATE_CODE)
                return Conflict(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        // GET: api/booking (Admin or EVDriver)
        [HttpGet]
        [Authorize(Roles = "Admin,EVDriver")]
        public async Task<IActionResult> GetBookingList()
        {
            Guid? userId = null;
            if (User.IsInRole("EVDriver"))
                userId = Guid.Parse(User.Identity.Name!);

            var result = await _bookingService.GetBookingList(userId);

            if (result.Status == Const.SUCCESS_READ_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        // GET: api/booking/{bookingId} (Admin or EVDriver)
        [HttpGet("{bookingId}")]
        [Authorize(Roles = "Admin,EVDriver")]
        public async Task<IActionResult> GetBookingDetail([FromRoute] Guid bookingId)
        {
            var result = await _bookingService.GetBookingDetail(bookingId);

            if (result.Status == Const.SUCCESS_READ_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        // PATCH: api/booking/{bookingId}/checkin (EVDriver)
        [HttpPatch("{bookingId}/checkin")]
        [Authorize(Roles = "EVDriver")]
        public async Task<IActionResult> CheckInBooking([FromRoute] Guid bookingId)
        {
            var userId = Guid.Parse(User.Identity.Name!);
            var result = await _bookingService.CheckInBooking(bookingId, userId);

            if (result.Status == Const.SUCCESS_UPDATE_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.FAIL_UPDATE_CODE)
                return Conflict(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        // PATCH: api/booking/{bookingId}/complete (EVDriver)
        [HttpPatch("{bookingId}/complete")]
        [Authorize(Roles = "EVDriver")]
        public async Task<IActionResult> CompleteBooking([FromRoute] Guid bookingId)
        {
            var result = await _bookingService.CompleteBooking(bookingId );

            if (result.Status == Const.SUCCESS_UPDATE_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.FAIL_UPDATE_CODE)
                return Conflict(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        // PATCH: api/booking/{bookingId}/cancel (EVDriver)
        [HttpPatch("{bookingId}/cancel")]
        [Authorize(Roles = "EVDriver")]
        public async Task<IActionResult> CancelBooking([FromRoute] Guid bookingId)
        {
            var userId = Guid.Parse(User.Identity.Name!);
            var result = await _bookingService.CancelBooking(bookingId, userId);

            if (result.Status == Const.SUCCESS_UPDATE_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.FAIL_UPDATE_CODE)
                return Conflict(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        // POST: api/booking/autocancel (Admin - Background Job)
        [HttpPost("autocancel")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AutoCancelExpireBookings()
        {
            await _bookingService.AutoCancelExpiredBookings();
            return Ok(new { message = "Đã xử lý auto-cancel cho các booking quá hạn." });
        }

        // POST: api/booking/autoreassign (Admin - Background Job)
        [HttpPost("autoreassign")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AutoReassignBookingsForErrorStations()
        {
            await _bookingService.AutoReassignBookingsForErrorStations();
            return Ok(new { message = "Đã xử lý chuyển trạm cho các booking tại trạm lỗi." });
        }

        // POST: api/booking/autolock (Admin - Background Job)
        [HttpPost("autolock")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> LockAccountsWithTooManyNoShows()
        {
            await _bookingService.LockAccountsWithTooManyNoShows();
            return Ok(new { message = "Đã khóa các tài khoản có quá nhiều lần không check-in." });
        }

        // (Optional) POST: api/booking/filter (Admin)
        /*
        [HttpPost("filter")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> FilterBookings([FromBody] BookingFilterDto filter)
        {
            var result = await _bookingService.FilterBookings(filter);

            if (result.Status == Const.SUCCESS_READ_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }
        */
    }
}

