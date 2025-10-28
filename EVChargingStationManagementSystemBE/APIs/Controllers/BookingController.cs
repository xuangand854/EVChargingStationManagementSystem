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
    [Authorize] 
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

       
        [HttpPost]
        [Authorize(Roles = "EVDriver")] //  chỉ tài xế có thể tạo booking
        public async Task<IActionResult> CreateBooking([FromBody] BookingCreatedDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            Guid userId;
            try { userId = User.GetUserId(); }
            catch { return Unauthorized(new { message = "Không xác định được userId từ token." }); }

            var result = await _bookingService.CreateBooking(dto, userId);

            if (result.Status == Const.SUCCESS_CREATE_CODE)
                return Created("", new { data = result.Data, message = result.Message });

            if (result.Status == Const.FAIL_CREATE_CODE)
                return Conflict(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        [HttpGet]
        [Authorize(Roles = "Admin,System")] //  chỉ admin/system xem danh sách toàn bộ booking
        public async Task<IActionResult> GetBookingList()
        {
            var result = await _bookingService.GetBookingList();

            if (result.Status == Const.SUCCESS_READ_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        [HttpGet("{bookingId}")]
        [Authorize(Roles = "EVDriver,Admin,System")] //  cả EVDriver lẫn Admin đều xem được chi tiết
        public async Task<IActionResult> GetBookingDetail(Guid bookingId)
        {
            var result = await _bookingService.GetBookingDetail(bookingId);

            if (result.Status == Const.SUCCESS_READ_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        [HttpPatch("checkin")]
        [Authorize(Roles = "EVDriver")] //  chỉ tài xế mới checkin
        public async Task<IActionResult> CheckInBooking([FromBody] BookingCheckInDto dto)
        {
            Guid userId;
            try { userId = User.GetUserId(); }
            catch { return Unauthorized(new { message = "Không xác định được userId từ token." }); }

            var result = await _bookingService.CheckInBooking(dto, userId);

            if (result.Status == Const.SUCCESS_UPDATE_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.FAIL_UPDATE_CODE)
                return Conflict(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        [HttpPatch("{bookingId}")]
        [Authorize(Roles = "EVDriver")] //  chỉ người đặt mới được hủy booking
        public async Task<IActionResult> CancelBooking(Guid bookingId)
        {
            Guid userId;
            try { userId = User.GetUserId(); }
            catch { return Unauthorized(new { message = "Không xác định được userId từ token." }); }

            var result = await _bookingService.CancelBooking(bookingId, userId);

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
            await _bookingService.AutoCancelExpiredBookings();
            return Ok(new { message = "Đã xử lý hủy các booking hết hạn." });
        }

        [HttpPost("auto-reassign-error-stations")]
        [Authorize(Roles = "Admin,System")]
        public async Task<IActionResult> AutoReassignBookingsForErrorStations()
        {
            await _bookingService.AutoReassignBookingsForErrorStations();
            return Ok(new { message = "Đã xử lý chuyển các booking khỏi trạm lỗi." });
        }

        [HttpPost("lock-no-show-accounts")]
        [Authorize(Roles = "Admin,System")]
        public async Task<IActionResult> LockAccountsWithTooManyNoShows()
        {
            await _bookingService.LockAccountsWithTooManyNoShows();
            return Ok(new { message = "Đã khóa các tài khoản có quá nhiều lượt không đến." });
        }

        [HttpGet("my-bookings")]
        [Authorize(Roles = "EVDriver")] //  chỉ người dùng driver xem được booking của họ
        public async Task<IActionResult> GetMyBookings()
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

            var result = await _bookingService.GetMyBookings(userId);

            if (result.Status == Const.SUCCESS_READ_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }
    }
}
