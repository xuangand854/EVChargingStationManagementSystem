using BusinessLogic.Base;
using Common.DTOs.BookingDto;

namespace BusinessLogic.IServices
{
    public interface IBookingService
    {
        //  Tạo booking mới (Create Booking)
        // Áp dụng các rule BR04 → BR09, BR12
        Task<IServiceResult> CreateBooking(BookingCreateDto dto, Guid userId);

        //  Lấy danh sách booking
        // Nếu là EVDriver → lấy theo userId
        // Nếu là Admin → lấy toàn bộ
        Task<IServiceResult> GetBookingList(Guid? userId = null);

        //  Lấy chi tiết 1 booking cụ thể
        Task<IServiceResult> GetBookingDetail(Guid bookingId);

        //  Check-in (bắt đầu sạc)
        // Cập nhật trạng thái "InProgress" và ghi ActualStartTime
        Task<IServiceResult> CheckInBooking(Guid bookingId, Guid userId);

        //  Hoàn tất sạc (Complete)
        // Cập nhật ActualEndTime, Status = Completed, tính toán năng lượng
        Task<IServiceResult> CompleteBooking(Guid bookingId, double? batteryCapacity = null);

        //  Người dùng tự hủy booking trước giờ sạc
        Task<IServiceResult> CancelBooking(Guid bookingId, Guid userId);

        //  Auto cancel (background job)
        // Hủy các booking quá 15 phút chưa InProgress
        Task AutoCancelExpiredBookings();

        //  Tự động chuyển trạm khi trạm lỗi (background job)
        Task AutoReassignBookingsForErrorStations();

        //  Tự động khóa tài khoản sau 3 lần auto-cancel
        Task LockAccountsWithTooManyNoShows();

        //  (Optional) Lọc / tìm kiếm booking
        //Task<IServiceResult> FilterBookings(BookingFilterDto filter);
    }
}
