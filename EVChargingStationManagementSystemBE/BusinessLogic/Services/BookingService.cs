using BusinessLogic.Base;
using BusinessLogic.IServices;
using Common;
using Common.DTOs.BookingDto;
using Common.Enum.ChargingSession;
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

        // Tạo booking mới (EndTime mặc định +2h)
        public async Task<IServiceResult> CreateBooking(BookingCreateDto dto, Guid userId)
        {
            try
            {
                // Lấy thông tin người dùng
                var user = await _unitOfWork.UserAccountRepository.GetByIdAsync(
                    u => u.Id == userId && !u.IsDeleted);
                if (user == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy tài khoản người dùng");

                // Chỉ cho phép EVDriver đặt chỗ
                var roles = await _userManager.GetRolesAsync(user);
                if (!roles.Contains("EVDriver", StringComparer.OrdinalIgnoreCase))
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Chỉ EVDriver mới được phép đặt chỗ");

                // Lấy hồ sơ EVDriver (kèm danh sách xe)
                var evDriver = await _unitOfWork.EVDriverRepository.GetByIdAsync(
                    e => e.AccountId == userId && !e.IsDeleted,
                    include: e => e.Include(x => x.UserVehicles)
                                   .ThenInclude(uv => uv.VehicleModel)
                );
                if (evDriver == null)
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Người dùng chưa có hồ sơ EVDriver");

                // Lấy xe đầu tiên của EVDriver
                var vehicle = evDriver.UserVehicles
                    .Select(uv => uv.VehicleModel)
                    .FirstOrDefault(v => v != null && !v.IsDeleted);

                if (vehicle == null)
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Hồ sơ EVDriver chưa có xe hợp lệ");

                // Chỉ hỗ trợ xe EV hoặc Plug-in Hybrid
                if (!vehicle.VehicleType.Equals("EV", StringComparison.OrdinalIgnoreCase) &&
                    !vehicle.VehicleType.Equals("Plug-in Hybrid", StringComparison.OrdinalIgnoreCase))
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Loại xe không được hỗ trợ");

                // Thời gian bắt đầu phải cách hiện tại ít nhất 15 phút
                if (dto.StartTime < DateTime.UtcNow.AddMinutes(15))
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Thời gian bắt đầu phải cách hiện tại ít nhất 15 phút");

                // Kiểm tra người dùng có booking đang hoạt động không
                var activeBookings = await _unitOfWork.BookingRepository.GetAllAsync(
                    b => b.BookedBy == userId && (b.Status == "Scheduled" || b.Status == "InProgress"));
                if (activeBookings.Any())
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Bạn đã có booking đang hoạt động");

                // Không cho đặt lại cùng trạm trong 30 phút
                var recentBooking = await _unitOfWork.BookingRepository.GetAllAsync(
                    b => b.BookedBy == userId &&
                         b.StationId == dto.StationId &&
                         b.ActualEndTime.HasValue &&
                         b.ActualEndTime.Value > DateTime.UtcNow.AddMinutes(-30));
                if (recentBooking.Any())
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Không thể đặt liên tiếp tại cùng trạm trong 30 phút");

                // Lấy trạm sạc
                var station = await _unitOfWork.ChargingStationRepository.GetByIdAsync(
                    s => s.Id == dto.StationId && !s.IsDeleted,
                    include: s => s.Include(p => p.ChargingPosts));
                if (station == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy trạm sạc");

                // Trạm đang lỗi thì không cho đặt
                if (station.Status.Equals("Error", StringComparison.OrdinalIgnoreCase))
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Trạm sạc đang gặp sự cố");

                // Lấy trụ khả dụng đầu tiên trong trạm
                var availablePost = station.ChargingPosts
                    .Where(p => p.Status == "Available")
                    .OrderBy(p => p.CreatedAt)
                    .FirstOrDefault();
                if (availablePost == null)
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Không có trụ sạc khả dụng tại trạm này");

                // Tạo đối tượng booking
                var booking = dto.Adapt<Booking>();
                booking.Id = Guid.NewGuid();
                booking.BookedBy = userId;
                booking.Status = "Scheduled";
                booking.CreatedAt = DateTime.UtcNow;
                booking.UpdatedAt = DateTime.UtcNow;
                booking.EndTime = dto.StartTime.AddHours(2);
                booking.StationId = dto.StationId;

                // Đánh dấu trụ đã được giữ
                availablePost.Status = "Reserved";
                availablePost.UpdatedAt = DateTime.UtcNow;

                // Lưu booking
                await _unitOfWork.BookingRepository.CreateAsync(booking);
                var result = await _unitOfWork.SaveChangesAsync();

                if (result > 0)
                {
                    var response = booking.Adapt<BookingViewDto>();
                    return new ServiceResult(Const.SUCCESS_CREATE_CODE, "Đặt chỗ thành công", response);
                }

                return new ServiceResult(Const.FAIL_CREATE_CODE, "Không thể tạo đặt chỗ");
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        // Lấy chi tiết 1 booking cụ thể
        public async Task<IServiceResult> GetBookingDetail(Guid bookingId)
        {
            try
            {
                var booking = await _unitOfWork.BookingRepository.GetByIdAsync(
                    b => b.Id == bookingId && !b.IsDeleted,
                    include: b => b
                        .Include(x => x.BookedByNavigation)
                        .Include(x => x.ChargingStationNavigation)
                        .Include(x => x.ChargingStationNavigation.ChargingPosts)
                );

                if (booking == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy thông tin booking");

                var response = booking.Adapt<BookingViewDto>();
                return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, response);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        // Lấy danh sách tất cả booking (hoặc chỉ booking của 1 user)
        public async Task<IServiceResult> GetBookingList(Guid? userId = null)
        {
            try
            {
                var bookings = await _unitOfWork.BookingRepository.GetAllAsync(
                    b => !b.IsDeleted && (userId == null || b.BookedBy == userId),
                    include: b => b
                        .Include(x => x.ChargingStationNavigation)
                        .Include(x => x.BookedByNavigation),
                    orderBy: q => q.OrderByDescending(b => b.CreatedAt)
                );

                if (bookings == null || bookings.Count == 0)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy booking nào");

                var response = bookings.Adapt<List<BookingViewDto>>();
                return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, response);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        // Check-in cho booking (cập nhật trạng thái sang InProgress + tính thời gian sạc)
        public async Task<IServiceResult> CheckInBooking(Guid bookingId, Guid userId)
        {
            try
            {
                // Kiểm tra tài khoản EVDriver
                var user = await _unitOfWork.UserAccountRepository.GetByIdAsync(u => u.Id == userId && !u.IsDeleted);
                if (user == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy người dùng");

                var roles = await _userManager.GetRolesAsync(user);
                if (!roles.Contains("EVDriver", StringComparer.OrdinalIgnoreCase))
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Chỉ EVDriver mới có thể check-in");

                // Lấy booking + trạm + trụ
                var booking = await _unitOfWork.BookingRepository.GetByIdAsync(
                    b => b.Id == bookingId && !b.IsDeleted,
                    include: b => b
                        .Include(x => x.ChargingStationNavigation)
                        .ThenInclude(cs => cs.ChargingPosts)
                        .ThenInclude(p => p.Connectors)
                );
                if (booking == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy thông tin booking");

                if (booking.BookedBy != userId)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Không có quyền check-in booking này");

                if (!booking.Status.Equals("Scheduled", StringComparison.OrdinalIgnoreCase))
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Booking không ở trạng thái chờ check-in");

                // Lấy thời gian check-in cho phép
                var checkinConfig = await _unitOfWork.SystemConfigurationRepository.GetByIdAsync(
                    c => !c.IsDeleted && c.Name == "CHECKIN_ALLOW_MINUTES");
                int checkinAllowance = (int)(checkinConfig?.MinValue ?? 15);
                var now = DateTime.UtcNow;

                if (now < booking.StartTime.AddMinutes(-checkinAllowance) ||
                    now > booking.StartTime.AddMinutes(checkinAllowance))
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Không thể check-in ngoài thời gian cho phép");

                // Lấy hồ sơ EVDriver + xe
                var evDriver = await _unitOfWork.EVDriverRepository.GetByIdAsync(
                    e => e.AccountId == userId && !e.IsDeleted,
                    include: e => e
                        .Include(x => x.UserVehicles)
                        .ThenInclude(uv => uv.VehicleModel)
                );
                if (evDriver == null)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Không tìm thấy hồ sơ EVDriver");

                var vehicle = evDriver.UserVehicles
                    .Select(uv => uv.VehicleModel)
                    .FirstOrDefault(v => v != null && !v.IsDeleted);
                if (vehicle == null)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Hồ sơ chưa có xe hợp lệ");

                // Lấy trụ Reserved
                var post = booking.ChargingStationNavigation.ChargingPosts
                    .FirstOrDefault(p => p.Status == "Reserved" && !p.IsDeleted);
                if (post == null)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Không tìm thấy trụ được giữ");

                // Lấy connector đầu tiên
                var connector = post.Connectors.FirstOrDefault(c => !c.IsDeleted);
                if (connector == null)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Không có connector hợp lệ");

                // Tính công suất, dung lượng pin, thời gian sạc
                double chargerPower = post.MaxPowerKw;
                double batteryCapacity = Convert.ToDouble(vehicle.BatteryCapacityKWh);
                double currentBattery = booking.CurrentBattery ?? 0;
                double targetBattery = booking.TargetBattery ?? 100;

                if (targetBattery <= currentBattery)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Mức pin mục tiêu phải lớn hơn mức hiện tại");

                double energyNeeded = ((targetBattery - currentBattery) / 100.0) * batteryCapacity;
                double estimatedHours = energyNeeded / chargerPower;

                // Cập nhật trạng thái booking và trụ
                booking.Status = "InProgress";
                booking.ActualStartTime = now;
                booking.EndTime = now.AddHours(estimatedHours);
                booking.EstimatedEnergyKWh = energyNeeded;
                post.Status = "Charging";

                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                {
                    var response = booking.Adapt<BookingViewDto>();
                    response.EstimatedEnergyKWh = energyNeeded;
                    return new ServiceResult(Const.SUCCESS_UPDATE_CODE,
                        $"Check-in thành công. Dự kiến sạc {energyNeeded:F2} kWh trong {estimatedHours:F2} giờ.",
                        response);
                }

                return new ServiceResult(Const.FAIL_UPDATE_CODE, "Check-in thất bại");
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        // Hoàn tất booking sau khi phiên sạc đã xong
        public async Task<IServiceResult> CompleteBooking(Guid bookingId)
        {
            try
            {
                var booking = await _unitOfWork.BookingRepository.GetByIdAsync(
                    b => b.Id == bookingId && !b.IsDeleted,
                    include: b => b
                        .Include(x => x.ChargingStationNavigation)
                        .ThenInclude(cs => cs.ChargingPosts)
                );
                if (booking == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy booking");

                // Tìm session hoàn tất tương ứng
                var session = await _unitOfWork.ChargingSessionRepository.GetByIdAsync(
                    s => !s.IsDeleted &&
                         s.UserId == booking.BookedBy &&
                         s.ChargingPostId == booking.StationId &&
                         s.Status == ChargingSessionStatus.Completed.ToString());
                if (session == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy session hoàn tất");

                // Đồng bộ dữ liệu session → booking
                booking.Status = "Completed";
                booking.ActualEnergyKWh = (double?)session.EnergyDeliveredKWh;
                booking.ActualStartTime = session.StartTime;
                booking.ActualEndTime = session.EndTime;
                booking.UpdatedAt = DateTime.Now;

                // Giải phóng trụ
                var activePost = booking.ChargingStationNavigation.ChargingPosts
                    .FirstOrDefault(p => p.Status == "Charging" || p.Status == "Reserved");
                if (activePost != null)
                {
                    activePost.Status = "Available";
                    activePost.UpdatedAt = DateTime.Now;
                }

                var result = await _unitOfWork.SaveChangesAsync();
                if (result > 0)
                {
                    var response = booking.Adapt<BookingViewDto>();
                    return new ServiceResult(Const.SUCCESS_UPDATE_CODE, "Hoàn tất booking thành công", response);
                }

                return new ServiceResult(Const.FAIL_UPDATE_CODE, "Không thể cập nhật booking");
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        // Hủy booking nếu chưa tới thời gian bắt đầu
        public async Task<IServiceResult> CancelBooking(Guid bookingId, Guid userId)
        {
            try
            {
                // Lấy thông tin user đang thực hiện yêu cầu
                var user = await _unitOfWork.UserAccountRepository.GetByIdAsync(u => u.Id == userId && !u.IsDeleted);
                if (user == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy người dùng");

                // Chỉ cho phép người có vai trò EVDriver được hủy booking
                var roles = await _userManager.GetRolesAsync(user);
                if (!roles.Any(r => r.Equals("EVDriver", StringComparison.OrdinalIgnoreCase)))
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Chỉ EVDriver được hủy booking");

                // Lấy booking cần hủy (kèm thông tin trạm và danh sách trụ sạc)
                var booking = await _unitOfWork.BookingRepository.GetByIdAsync(
                    b => b.Id == bookingId && !b.IsDeleted,
                    include: b => b.Include(x => x.ChargingStationNavigation)
                                  .ThenInclude(cs => cs.ChargingPosts)
                );
                if (booking == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy booking");

                // Kiểm tra quyền: chỉ người tạo booking mới được hủy
                if (booking.BookedBy != userId)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Không có quyền hủy booking này");

                // Chỉ được hủy khi booking đang ở trạng thái Scheduled
                if (!booking.Status.Equals("Scheduled", StringComparison.OrdinalIgnoreCase))
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Chỉ được hủy khi booking đang Scheduled");

                // Không cho hủy nếu đã tới hoặc quá thời gian bắt đầu
                if (DateTime.UtcNow >= booking.StartTime)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Không thể hủy sau thời điểm bắt đầu");

                // Cập nhật trạng thái booking → Cancelled
                booking.Status = "Cancelled";
                booking.UpdatedAt = DateTime.UtcNow;

                // Tìm trụ sạc đang ở trạng thái Reserved để giải phóng lại
                var reservedPost = booking.ChargingStationNavigation.ChargingPosts
                    .FirstOrDefault(p => p.Status == "Reserved");
                if (reservedPost != null)
                {
                    reservedPost.Status = "Available";
                    reservedPost.UpdatedAt = DateTime.UtcNow;
                }

                // Lưu thay đổi vào database
                var result = await _unitOfWork.SaveChangesAsync();

                // Nếu lưu thành công → trả về kết quả kèm dữ liệu booking vừa cập nhật
                if (result > 0)
                {
                    var response = booking.Adapt<BookingViewDto>();
                    return new ServiceResult(Const.SUCCESS_UPDATE_CODE, "Hủy booking thành công", response);
                }

                // Nếu không có thay đổi nào được lưu
                return new ServiceResult(Const.FAIL_UPDATE_CODE, "Không thể hủy booking");
            }
            catch (Exception ex)
            {
                // Bắt lỗi ngoại lệ hệ thống
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }


        // Tự động khóa tài khoản EVDriver nếu no-show >= 3 lần/tháng
        public async Task LockAccountsWithTooManyNoShows()
        {
            var threshold = 3;
            var since = DateTime.UtcNow.AddMonths(-1);

            var evDrivers = await _unitOfWork.EVDriverRepository.GetAllAsync(
                e => !e.IsDeleted,
                include: e => e.Include(x => x.UserAccount)
            );

            foreach (var ev in evDrivers)
            {
                var noShows = await _unitOfWork.BookingRepository.GetAllAsync(
                    b => b.BookedBy == ev.AccountId &&
                         b.Status == "NoShow" &&
                         b.CreatedAt >= since
                );

                if (noShows.Count >= threshold)
                {
                    ev.Status = "Locked";
                    ev.UpdatedAt = DateTime.UtcNow;
                }
            }

            await _unitOfWork.SaveChangesAsync();
        }

        // Tự động hủy các booking quá thời gian check-in cho phép
        // Chú ý: phương thức này sẽ xử lý những booking có trạng thái "Scheduled" mà
        // hiện tại (UTC) đã vượt quá StartTime + CHECKIN_ALLOW_MINUTES.
        // CHECKIN_ALLOW_MINUTES lấy từ SystemConfiguration (nếu không có → mặc định 15 phút).
        public async Task AutoCancelExpiredBookings()
        {
            // Lấy thời điểm hiện tại (dùng UTC cho thống nhất trên server)
            var now = DateTime.UtcNow;

            // Lấy cấu hình CHECKIN_ALLOW_MINUTES từ DB (nếu không tồn tại thì mặc định 15)
            // Đây là khoảng thời gian cho phép người dùng check-in trước/sau StartTime.
            var config = await _unitOfWork.SystemConfigurationRepository.GetByIdAsync(
                c => !c.IsDeleted && c.Name == "CHECKIN_ALLOW_MINUTES");
            int allowance = (int)(config?.MinValue ?? 15); // if null -> default 15 minutes

            // Lấy tất cả booking có trạng thái "Scheduled" mà thời điểm hiện tại đã vượt quá StartTime + allowance
            // Kèm theo include để load thông tin ChargingStation và danh sách ChargingPosts
            // Vì khi hủy cần thao tác trên các trụ đã bị Reserved trong trạm tương ứng.
            var expiredBookings = await _unitOfWork.BookingRepository.GetAllAsync(
                b => !b.IsDeleted &&
                     b.Status == "Scheduled" &&
                     now > b.StartTime.AddMinutes(allowance),
                include: b => b.Include(x => x.ChargingStationNavigation)
                               .ThenInclude(cs => cs.ChargingPosts)
            );

            // Duyệt từng booking quá hạn
            foreach (var booking in expiredBookings)
            {
                // Cập nhật trạng thái booking → "Cancelled"
                // Ghi lại thời điểm cập nhật bằng now (UTC)
                booking.Status = "Cancelled";
                booking.UpdatedAt = now;

                // Nếu có trụ nào trong danh sách trụ của trạm đang ở trạng thái "Reserved",
                // thì giải phóng trụ đó (trở về "Available") vì người đặt không đến (no-show)
                foreach (var post in booking.ChargingStationNavigation.ChargingPosts
                             .Where(p => p.Status == "Reserved"))
                {
                    post.Status = "Available";
                    post.UpdatedAt = now;
                }

                // Lưu ý: không gọi SaveChangesAsync() trong vòng foreach để tránh nhiều lần commit nhỏ.
                // Ta sẽ lưu chung sau khi xử lý xong tất cả expiredBookings để giảm số lần gọi DB.
            }

            // Lưu mọi thay đổi (cập nhật booking + thay đổi trạng thái trụ) vào DB 1 lần
            // Nếu có deadlock / concurrency, UnitOfWork hoặc DbContext phải được cấu hình retry/transaction phù hợp.
            await _unitOfWork.SaveChangesAsync();
            // - Phương thức này "chỉ" tác động lên booking đã ở trạng thái Scheduled và đã quá StartTime + allowance.
            // - Nếu muốn đảm bảo idempotency: chạy lại nhiều lần cũng không gây lỗi vì booking đã chuyển sang "Cancelled".

            // - Sử dụng UTC để tránh sai lệch timezone giữa server và client.
        }

        // Tự động xử lý các booking thuộc trạm bị lỗi
        // Tự động xử lý các booking thuộc trạm bị lỗi
        // - Mục đích: Khi một trạm sạc bị lỗi (Status = "Error"), tất cả booking "Scheduled" tại đó
        //   sẽ được chuyển sang trạm khả dụng khác. Nếu không có trạm khả dụng, booking sẽ bị hủy.
        // - Chạy định kỳ bởi scheduler (ví dụ: background service hoặc cron job).
        // Tự động xử lý lại các booking thuộc các trạm sạc đang gặp lỗi
        public async Task AutoReassignBookingsForErrorStations()
        {
            //  Lấy tất cả các trạm sạc có trạng thái "Error" (đang bị lỗi) và chưa bị xóa
            var errorStations = await _unitOfWork.ChargingStationRepository.GetAllAsync(
                s => s.Status == "Error" && !s.IsDeleted,
                include: s => s.Include(x => x.ChargingPosts)
            );

            // 🔹 Nếu không có trạm nào bị lỗi thì không cần xử lý tiếp
            if (errorStations == null || !errorStations.Any())
                return;

            // 🔹 Cache (tải sẵn) danh sách trạm sạc đang khả dụng
            //     Mục đích: tránh việc truy vấn database nhiều lần trong vòng lặp
            var availableStations = (await _unitOfWork.ChargingStationRepository.GetAllAsync(
                s => s.Status == "Available" && !s.IsDeleted,
                include: s => s.Include(p => p.ChargingPosts)
            )).ToList();

            //  Ghi nhận thời điểm hiện tại để tái sử dụng cho các bản ghi cập nhật
            var now = DateTime.UtcNow;

            //  Duyệt từng trạm sạc đang bị lỗi
            foreach (var station in errorStations)
            {
                //  Lấy toàn bộ booking thuộc trạm này có trạng thái "Scheduled" (đang chờ sạc)
                var bookings = await _unitOfWork.BookingRepository.GetAllAsync(
                    b => b.StationId == station.Id && b.Status == "Scheduled"
                );

                //  Duyệt từng booking cần xử lý
                foreach (var booking in bookings)
                {
                    //  Tìm một trạm thay thế có ít nhất 1 post đang ở trạng thái "Available"
                    //     => Ưu tiên trạm sẵn sàng phục vụ
                    var alternativeStation = availableStations.FirstOrDefault(
                        s => s.ChargingPosts.Any(p => p.Status == "Available")
                    );

                    if (alternativeStation != null)
                    {
                        //  Tìm thấy trạm thay thế phù hợp
                        //    → Cập nhật lại StationId của booking
                        booking.StationId = alternativeStation.Id;
                        booking.UpdatedAt = now;

                        //  Chọn một post đang Available trong trạm thay thế và đánh dấu nó là Reserved
                        var availablePost = alternativeStation.ChargingPosts
                            .FirstOrDefault(p => p.Status == "Available");

                        if (availablePost != null)
                        {
                            availablePost.Status = "Reserved";   // Post được giữ chỗ cho booking này
                            availablePost.UpdatedAt = now;
                        }
                    }
                    else
                    {
                        //  Không tìm thấy trạm thay thế nào phù hợp
                        //    → Hủy booking để tránh khách hàng chờ vô ích
                        booking.Status = "Cancelled";
                        booking.UpdatedAt = now;
                    }
                }
            }

            //  Lưu toàn bộ thay đổi (booking + trạm + post) xuống cơ sở dữ liệu
            await _unitOfWork.SaveChangesAsync();
        }

    
    }
}