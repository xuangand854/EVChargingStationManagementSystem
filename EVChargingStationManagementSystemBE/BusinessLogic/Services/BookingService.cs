using BusinessLogic.Base;
using BusinessLogic.IServices;
using Common;
using Common.DTOs.BookingDto;
using Infrastructure.IUnitOfWork;
using Infrastructure.Models;
using Mapster;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogic.Services
{
    public class BookingService(IUnitOfWork unitOfWork, UserManager<UserAccount> userManager) : IBookingService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly UserManager<UserAccount> _userManager = userManager;

    
        /// Tạo mới một booking cho người dùng EVDriver.
  
        public async Task<IServiceResult> CreateBooking(BookingCreateDto dto, Guid userId)
        {
            try
            {
                // 1. Kiểm tra tài khoản người dùng có tồn tại và chưa bị xóa
                var user = await _unitOfWork.UserAccountRepository.GetByIdAsync(
                    predicate: u => u.Id == userId && !u.IsDeleted,
                    asNoTracking: false
                );
                if (user == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy tài khoản người dùng");

                // 2. Kiểm tra vai trò: chỉ người dùng có vai trò EVDriver mới được phép đặt chỗ
                var roles = await _userManager.GetRolesAsync(user);
                if (!roles.Any(r => r.Equals("EVDriver", StringComparison.OrdinalIgnoreCase)))
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Chỉ người dùng EVDriver mới được phép đặt chỗ");

                // 3. Kiểm tra hồ sơ EVDriver: người dùng phải có hồ sơ EVDriver hợp lệ
                var evDriver = await _unitOfWork.EVDriverRepository.GetByIdAsync(
                    predicate: e => e.AccountId == userId && !e.IsDeleted
                );
                if (evDriver == null)
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Người dùng chưa có hồ sơ EVDriver");

                // 4. Kiểm tra xe: xe phải tồn tại và chưa bị xóa
                var vehicle = await _unitOfWork.VehicleModelRepository.GetByIdAsync(
                    predicate: v => v.Id == dto.VehicleId && !v.IsDeleted
                );
                if (vehicle == null)
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Xe được chọn không hợp lệ");

                // 5. Kiểm tra loại xe: chỉ hỗ trợ EV hoặc Plug-in Hybrid
                if (!vehicle.VehicleType.Equals("EV", StringComparison.OrdinalIgnoreCase) &&
                    !vehicle.VehicleType.Equals("Plug-in Hybrid", StringComparison.OrdinalIgnoreCase))
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Loại xe không được hệ thống hỗ trợ");

                // 6. Kiểm tra thời gian bắt đầu: phải cách thời điểm hiện tại ít nhất 15 phút
                if (dto.StartTime < DateTime.UtcNow.AddMinutes(15))
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Thời gian bắt đầu phải cách hiện tại ít nhất 15 phút");

                // 7. Kiểm tra người dùng có booking đang hoạt động không (Scheduled hoặc InProgress)
                var activeBookings = await _unitOfWork.BookingRepository.GetAllAsync(
                    predicate: b => b.BookedBy == userId &&
                                    (b.Status == "Scheduled" || b.Status == "InProgress")
                );
                if (activeBookings.Any())
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Bạn đã có một booking đang hoạt động");

                // 8. Kiểm tra không được đặt liên tiếp tại cùng trạm trong vòng 30 phút
                var recentBooking = await _unitOfWork.BookingRepository.GetAllAsync(
                    predicate: b => b.BookedBy == userId &&
                                    b.StationId == dto.StationId &&
                                    b.ActualEndTime.HasValue &&
                                    b.ActualEndTime.Value > DateTime.UtcNow.AddMinutes(-30)
                );
                if (recentBooking.Any())
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Không thể đặt liên tiếp tại cùng trạm trong vòng 30 phút");

                // 9. Kiểm tra trạm sạc: trạm phải tồn tại, chưa bị xóa và không gặp sự cố
                var station = await _unitOfWork.ChargingStationRepository.GetByIdAsync(
                    predicate: s => s.Id == dto.StationId && !s.IsDeleted,
                    include: s => s.Include(p => p.ChargingPosts)
                );
                if (station == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy trạm sạc");

                if (station.Status.Equals("Error", StringComparison.OrdinalIgnoreCase))
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Trạm sạc đang gặp sự cố, vui lòng chọn trạm khác");

                // 10. Tìm trụ sạc khả dụng tại trạm (ưu tiên trụ được tạo sớm nhất)
                var availablePost = station.ChargingPosts
                    .Where(p => p.Status == "Available")
                    .OrderBy(p => p.CreatedAt)
                    .FirstOrDefault();
                if (availablePost == null)
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Không có trụ sạc khả dụng tại trạm này");

                // 11. Tạo mới booking
                var booking = dto.Adapt<Booking>();
                booking.Id = Guid.NewGuid();
                booking.BookedBy = userId;
                booking.Status = "Scheduled";
                booking.EndTime = dto.StartTime.AddHours(2); // Mặc định thời lượng sạc là 2 tiếng
                booking.CreatedAt = DateTime.UtcNow;
                booking.UpdatedAt = DateTime.UtcNow;
                booking.StationId = dto.StationId;

                // 12. Cập nhật trạng thái trụ sạc thành Reserved
                availablePost.Status = "Reserved";
                availablePost.UpdatedAt = DateTime.UtcNow;

                // Lưu booking và cập nhật trụ sạc
                await _unitOfWork.BookingRepository.CreateAsync(booking);
                var result = await _unitOfWork.SaveChangesAsync();

                // Trả về kết quả thành công nếu lưu thành công
                if (result > 0)
                {
                    var response = booking.Adapt<BookingViewDto>();
                    return new ServiceResult(Const.SUCCESS_CREATE_CODE, "Đặt chỗ thành công", response);
                }

                // Trường hợp lưu thất bại
                return new ServiceResult(Const.FAIL_CREATE_CODE, "Không thể tạo đặt chỗ");
            }
            catch (Exception ex)
            {
                // Xử lý ngoại lệ và trả về lỗi hệ thống
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }


        public async Task<IServiceResult> GetBookingDetail(Guid bookingId)
        {
            try
            {
                // 1️ Lấy booking từ DB kèm các quan hệ
                var booking = await _unitOfWork.BookingRepository.GetByIdAsync(
                    predicate: b => b.Id == bookingId && !b.IsDeleted,
                    include: b => b
                        .Include(x => x.BookedByNavigation)
                        .Include(x => x.ChargingStationNavigation)
                        .Include(x => x.ChargingStationNavigation.ChargingPosts)
                );

                // 2️ Kiểm tra tồn tại
                if (booking == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy thông tin booking");

                // 3️ Map sang DTO hiển thị
                var response = booking.Adapt<BookingViewDto>();
                return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, response);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
        public async Task<IServiceResult> GetBookingList(Guid? userId = null)
        {
            try
            {
                // Nếu userId != null → chỉ lấy booking của người đó (EVDriver)
                var bookings = await _unitOfWork.BookingRepository.GetAllAsync(
                    predicate: b => !b.IsDeleted && (userId == null || b.BookedBy == userId),
                    include: b => b
                        .Include(x => x.ChargingStationNavigation)
                        .Include(x => x.BookedByNavigation),
                    orderBy: q => q.OrderByDescending(b => b.CreatedAt)
                );

                if (bookings == null || bookings.Count == 0)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy booking nào");

                // Map sang BookingViewDto
                var response = bookings.Adapt<List<BookingViewDto>>();
                return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, response);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }
      
        /// Thực hiện check-in cho một booking của người dùng EVDriver.
        /// Kiểm tra quyền, thời gian hợp lệ và cập nhật trạng thái booking và trụ sạc.
        public async Task<IServiceResult> CheckInBooking(Guid bookingId, Guid userId)
        {
            try
            {
                // 1️. Kiểm tra người dùng có tồn tại và chưa bị xóa
                var user = await _unitOfWork.UserAccountRepository.GetByIdAsync(
                    predicate: u => u.Id == userId && !u.IsDeleted,
                    asNoTracking: false
                );
                if (user == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy người dùng");

                // 2️. Kiểm tra quyền: chỉ người dùng có vai trò EVDriver mới được phép check-in
                var roles = await _userManager.GetRolesAsync(user);
                if (!roles.Contains("EVDriver", StringComparer.OrdinalIgnoreCase))
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Chỉ EVDriver mới có thể check-in");

                // 3️. Lấy thông tin booking theo ID, bao gồm thông tin trạm và các trụ sạc
                var booking = await _unitOfWork.BookingRepository.GetByIdAsync(
                    predicate: b => b.Id == bookingId && !b.IsDeleted,
                    include: b => b
                        .Include(x => x.ChargingStationNavigation)
                        .ThenInclude(cs => cs.ChargingPosts),
                    asNoTracking: false
                );
                if (booking == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy thông tin booking");

                // Kiểm tra người dùng có phải là người đã đặt booking này không
                if (booking.BookedBy != userId)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Bạn không có quyền check-in cho booking này");

                // Kiểm tra trạng thái booking phải là "Scheduled" (đang chờ check-in)
                if (!booking.Status.Equals("Scheduled", StringComparison.OrdinalIgnoreCase))
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Booking không ở trạng thái chờ check-in");

                // 4️. Kiểm tra thời gian check-in hợp lệ: chỉ được check-in trong khoảng ±15 phút so với giờ bắt đầu
                var now = DateTime.UtcNow;
                if (now < booking.StartTime.AddMinutes(-15) || now > booking.StartTime.AddMinutes(15))
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Bạn chỉ có thể check-in trong vòng 15 phút trước hoặc sau giờ bắt đầu");

                // 5️. Cập nhật trạng thái booking sang "InProgress" và ghi nhận thời gian bắt đầu thực tế
                booking.Status = "InProgress";
                booking.ActualStartTime = DateTime.UtcNow;
                booking.UpdatedAt = DateTime.UtcNow;

                // 6️. Cập nhật trạng thái trụ sạc từ "Reserved" sang "Charging"
                var post = booking.ChargingStationNavigation.ChargingPosts
                    .FirstOrDefault(p => p.Status == "Reserved");
                if (post != null)
                {
                    post.Status = "Charging";
                    post.UpdatedAt = DateTime.UtcNow;
                }

                // 7️. Lưu thay đổi vào cơ sở dữ liệu
                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                {
                    var response = booking.Adapt<BookingViewDto>();
                    return new ServiceResult(Const.SUCCESS_UPDATE_CODE, "Check-in thành công, quá trình sạc đã bắt đầu", response);
                }

                // Trường hợp lưu thất bại
                return new ServiceResult(Const.FAIL_UPDATE_CODE, "Check-in thất bại, vui lòng thử lại");
            }
            catch (Exception ex)
            {
                // Xử lý ngoại lệ và trả về lỗi hệ thống
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<IServiceResult> CompleteBooking(Guid bookingId, double? batteryCapacity = null)
        {
            try
            {
                // 1️. Lấy thông tin booking và các quan hệ liên quan (Trạm sạc + Trụ sạc)
                var booking = await _unitOfWork.BookingRepository.GetByIdAsync(
                    predicate: b => b.Id == bookingId && !b.IsDeleted,
                    include: b => b
                        .Include(x => x.ChargingStationNavigation)
                        .ThenInclude(cs => cs.ChargingPosts),
                    asNoTracking: false
                );

                if (booking == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy thông tin đặt chỗ");

                // 2️. Chỉ cho phép hoàn tất khi đang trong trạng thái sạc
                if (!booking.Status.Equals("InProgress", StringComparison.OrdinalIgnoreCase))
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Chỉ có thể hoàn tất khi booking đang ở trạng thái InProgress");

                // 3️. Lấy dung lượng pin của xe (nếu có VehicleModel thì lấy thật, tạm mặc định nếu chưa có)
                double vehicleBatteryCapacity = batteryCapacity ?? 60.0; // 60kWh: giá trị mặc định phổ biến cho xe điện trung bình

                // 4️. Xử lý giá trị phần trăm pin trước và sau sạc
                double currentBattery = booking.CurrentBattery ?? 0;
                double targetBattery = booking.TargetBattery ?? 100;

                // Đảm bảo dữ liệu nằm trong phạm vi 0–100%
                currentBattery = Math.Clamp(currentBattery, 0, 100);
                targetBattery = Math.Clamp(targetBattery, currentBattery, 100);
                // check điều kiện để có thể sạc pin mong muốn phải lớn hơn pin hiện tại có 
                if (targetBattery <= currentBattery)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Mức pin mục tiêu phải lớn hơn mức pin hiện tại để tính năng lượng");

                // 5️. Tính toán năng lượng tiêu thụ thực tế (kWh)
                //  Công thức: Energy = ((TargetBattery - CurrentBattery) / 100) × BatteryCapacity
                double actualEnergyUsed = ((targetBattery - currentBattery) / 100.0) * vehicleBatteryCapacity;
                actualEnergyUsed = Math.Round(actualEnergyUsed, 2);

                // 6️. Cập nhật thông tin booking
                booking.Status = "Completed";
                booking.ActualEnergyKWh = actualEnergyUsed;
                booking.ActualEndTime = DateTime.UtcNow;
                booking.UpdatedAt = DateTime.UtcNow;

                // 7️⃣. Cập nhật trụ sạc trở lại trạng thái khả dụng
                var activePost = booking.ChargingStationNavigation.ChargingPosts
                    .FirstOrDefault(p => p.Status == "Charging" || p.Status == "Reserved");

                if (activePost != null)
                {
                    activePost.Status = "Available";
                    activePost.UpdatedAt = DateTime.UtcNow;
                }

                // 8️. Lưu thay đổi xuống DB
                var result = await _unitOfWork.SaveChangesAsync();

                if (result > 0)
                {
                    var response = booking.Adapt<BookingViewDto>();
                    response.ActualEnergyKWh = actualEnergyUsed;

                    return new ServiceResult(Const.SUCCESS_UPDATE_CODE,
                        $"Hoàn tất sạc thành công. Tổng năng lượng tiêu thụ: {actualEnergyUsed} kWh",
                        response);
                }

                return new ServiceResult(Const.FAIL_UPDATE_CODE, "Không thể hoàn tất sạc, vui lòng thử lại");
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }



        /// Hủy một booking đã được đặt bởi người dùng EVDriver.
        /// Kiểm tra quyền sở hữu, trạng thái hợp lệ và giải phóng trụ sạc nếu cần.
        /// ID của booking cần hủy.
        /// ID của người dùng thực hiện yêu cầu hủy.
        /// Kết quả thực hiện hủy booking.
        public async Task<IServiceResult> CancelBooking(Guid bookingId, Guid userId)
        {
            try
            {
                // 1️. Lấy thông tin người dùng theo userId, đảm bảo tài khoản tồn tại và chưa bị xóa
                var user = await _unitOfWork.UserAccountRepository.GetByIdAsync(
                    predicate: u => u.Id == userId && !u.IsDeleted,
                    asNoTracking: false
                );
                if (user == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy người dùng");

                // 2️. Kiểm tra vai trò: chỉ người dùng có vai trò EVDriver mới được phép hủy booking
                var roles = await _userManager.GetRolesAsync(user);
                if (!roles.Any(r => r.Equals("EVDriver", StringComparison.OrdinalIgnoreCase)))
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Chỉ EVDriver mới được phép hủy đặt chỗ");

                // 3️. Lấy thông tin booking theo bookingId, bao gồm trạm sạc và danh sách trụ sạc
                var booking = await _unitOfWork.BookingRepository.GetByIdAsync(
                    predicate: b => b.Id == bookingId && !b.IsDeleted,
                    include: b => b
                        .Include(x => x.ChargingStationNavigation)
                        .ThenInclude(cs => cs.ChargingPosts),
                    asNoTracking: false
                );
                if (booking == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy thông tin booking");

                // 4️. Kiểm tra quyền sở hữu: người dùng chỉ được hủy booking do chính mình đặt
                if (booking.BookedBy != userId)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Bạn không có quyền hủy booking này");

                // 5️. Kiểm tra trạng thái booking: chỉ được hủy khi đang ở trạng thái "Scheduled"
                if (!booking.Status.Equals("Scheduled", StringComparison.OrdinalIgnoreCase))
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Chỉ có thể hủy khi booking đang ở trạng thái Scheduled");

                // 6️. Kiểm tra thời gian: không được hủy nếu đã đến hoặc qua thời điểm bắt đầu sạc
                if (DateTime.UtcNow >= booking.StartTime)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Không thể hủy sau thời điểm bắt đầu sạc");

                // 7️. Cập nhật trạng thái booking thành "Cancelled" và ghi nhận thời gian cập nhật
                booking.Status = "Cancelled";
                booking.UpdatedAt = DateTime.UtcNow;

                // 8️. Giải phóng trụ sạc nếu có trụ đang ở trạng thái "Reserved"
                var reservedPost = booking.ChargingStationNavigation.ChargingPosts
                    .FirstOrDefault(p => p.Status == "Reserved");
                if (reservedPost != null)
                {
                    reservedPost.Status = "Available";
                    reservedPost.UpdatedAt = DateTime.UtcNow;
                }

                // 9️. Lưu thay đổi vào cơ sở dữ liệu
                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                {
                    var response = booking.Adapt<BookingViewDto>();
                    return new ServiceResult(Const.SUCCESS_UPDATE_CODE, "Hủy đặt chỗ thành công", response);
                }

                // Trường hợp lưu thất bại
                return new ServiceResult(Const.FAIL_UPDATE_CODE, "Không thể hủy đặt chỗ, vui lòng thử lại");
            }
            catch (Exception ex)
            {
                // Xử lý ngoại lệ và trả về lỗi hệ thống
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }


        public Task LockAccountsWithTooManyNoShows() => throw new NotImplementedException();
    
        public Task AutoCancelExpiredBookings() => throw new NotImplementedException();
        public Task AutoReassignBookingsForErrorStations() => throw new NotImplementedException();

    }
}
