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
using Common.Enum.Booking;

namespace BusinessLogic.Services
{
    public class BookingService(IUnitOfWork unitOfWork, UserManager<UserAccount> userManager) : IBookingService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly UserManager<UserAccount> _userManager = userManager;

        // Tạo booking mới (EndTime mặc định +2h)

        public async Task<IServiceResult> CreateBooking(BookingCreatedDto dto, Guid userId)
        {
            try
            {
                // --- BR12: Kiểm tra tài khoản EVDriver ---
                var user = await _unitOfWork.UserAccountRepository.GetByIdAsync(
                    u => u.Id == userId && !u.IsDeleted);
                if (user == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy tài khoản người dùng.");

                var roles = await _userManager.GetRolesAsync(user);
                if (!roles.Contains("EVDriver", StringComparer.OrdinalIgnoreCase))
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Chỉ EVDriver mới được phép đặt chỗ.");

                // --- BR04: Lấy EVDriver profile + xe ---
                var evDriver = await _unitOfWork.EVDriverRepository.GetByIdAsync(
                    e => e.AccountId == userId && !e.IsDeleted,
                    include: e => e.Include(x => x.UserVehicles).ThenInclude(v => v.VehicleModel));
                if (evDriver == null)
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Người dùng chưa có hồ sơ EVDriver.");

                var vehicle = evDriver.UserVehicles
                    .Select(uv => uv.VehicleModel)
                    .FirstOrDefault(v => v.Id == dto.VehicleId && !v.IsDeleted);
                if (vehicle == null)
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Phương tiện không hợp lệ hoặc không thuộc người dùng.");

                // --- BR08: Kiểm tra loại xe ---
                var validVehicle = await _unitOfWork.VehicleModelRepository.GetByIdAsync(
                    v => v.Id == vehicle.Id && !v.IsDeleted);
                if (validVehicle == null)
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Xe không tồn tại trong hệ thống.");

                // --- BR06: StartTime >= Now + 15min ---
                if (dto.StartTime < DateTime.Now.AddMinutes(15))
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Thời gian bắt đầu phải cách hiện tại ≥ 15 phút.");

                // --- BR05: Kiểm tra booking đang hoạt động ---
                var active = await _unitOfWork.BookingRepository.GetAllAsync(
                    b => b.BookedBy == userId &&
                         (b.Status == "Scheduled" || b.Status == "InProgress") &&
                         !b.IsDeleted);
                if (active.Any())
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Bạn đã có booking đang hoạt động.");

                // --- BR07: Không đặt liên tiếp tại cùng trạm trong 30 phút ---
                var recent = await _unitOfWork.BookingRepository.GetAllAsync(
                    b => b.BookedBy == userId &&
                         b.StationId == dto.StationId &&
                         b.ActualEndTime.HasValue &&
                         b.ActualEndTime.Value > DateTime.Now.AddMinutes(-30));
                if (recent.Any())
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Không thể đặt liên tiếp tại cùng trạm trong 30 phút.");

                // --- Kiểm tra trạm sạc ---
                var station = await _unitOfWork.ChargingStationRepository.GetByIdAsync(
                    s => s.Id == dto.StationId && !s.IsDeleted,
                    include: s => s.Include(x => x.ChargingPosts));
                if (station == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy trạm sạc.");
                if (station.Status.Equals("Error", StringComparison.OrdinalIgnoreCase))
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Trạm sạc đang gặp sự cố.");

                // --- BR09: EndTime mặc định = StartTime + 90 phút ---
                var booking = dto.Adapt<Booking>();
                booking.Id = Guid.NewGuid();
                booking.BookedBy = userId;
                booking.Status = "Scheduled";
                booking.EndTime = dto.StartTime.AddMinutes(90);
                booking.CreatedAt = DateTime.UtcNow;
                booking.UpdatedAt = DateTime.UtcNow;

                await _unitOfWork.BookingRepository.CreateAsync(booking);
                var result = await _unitOfWork.SaveChangesAsync();

                if (result > 0)
                {
                    var response = booking.Adapt<BookingViewDto>();
                    return new ServiceResult(Const.SUCCESS_CREATE_CODE, Const.SUCCESS_CREATE_MSG, response);
                }

                return new ServiceResult(Const.FAIL_CREATE_CODE, Const.FAIL_CREATE_MSG);
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
        public async Task<IServiceResult> CheckInBooking(BookingCheckInDto dto, Guid userId)
        {
            try
            {
                var booking = await _unitOfWork.BookingRepository.GetByIdAsync(
                    b => b.Id == dto.BookingId && b.BookedBy == userId && !b.IsDeleted,
                    asNoTracking: false);

                if (booking == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy booking hoặc không thuộc quyền sở hữu.");

                if (booking.Status != BookingStatus.Scheduled.ToString())
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Booking không ở trạng thái Scheduled.");

                // Cho phép check-in trong vòng ±15 phút
                if (DateTime.UtcNow < booking.StartTime.AddMinutes(-15))
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Chưa đến thời gian check-in cho phép.");

                booking.Status = BookingStatus.InProgress.ToString();
                booking.ActualStartTime = dto.ActualStartTime ?? DateTime.UtcNow;
                booking.CurrentBattery = dto.CurrentBattery;
                booking.TargetBattery = dto.TargetBattery;
                booking.UpdatedAt = DateTime.UtcNow;

                await _unitOfWork.SaveChangesAsync();

                return new ServiceResult(Const.SUCCESS_UPDATE_CODE, "Check-in thành công", booking.Adapt<BookingViewDto>());
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }


        //    // Hoàn tất booking sau khi phiên sạc đã xong
        //    public async Task<IServiceResult> CompleteBooking(Guid bookingId)
        //    {
        //        try
        //        {
        //            // 1️⃣ Lấy thông tin Booking
        //            var booking = await _unitOfWork.BookingRepository.GetByIdAsync(
        //                predicate: b => !b.IsDeleted && b.Id == bookingId,
        //                include: q => q.Include(b => b.BookedByNavigation)
        //                               .Include(b => b.ChargingStationNavigation),
        //                asNoTracking: false
        //            );

        //            if (booking == null)
        //                return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy đặt chỗ nào.");

        //            if (booking.Status.Equals("Completed"))
        //                return new ServiceResult(Const.FAIL_UPDATE_CODE, "Đặt chỗ này đã hoàn tất trước đó.");

        //            // 2️⃣ Tìm phiên sạc tương ứng (nếu có)
        //            var session = await _unitOfWork.ChargingSessionRepository.GetByIdAsync(
        //                predicate: s => !s.IsDeleted && s.BookingId == booking.Id,
        //                asNoTracking: false
        //            );

        //            if (session == null)
        //                return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy phiên sạc tương ứng.");

        //            if (!session.Status.Equals("Completed"))
        //                return new ServiceResult(Const.FAIL_UPDATE_CODE, "Phiên sạc vẫn chưa hoàn tất, không thể hoàn tất booking.");

        //            // 3️⃣ Cập nhật thông tin booking từ session
        //            booking.Status = "Completed";
        //            booking.ActualStartTime = session.StartTime;
        //            booking.ActualEndTime = session.EndTime;
        //            booking.ActualEnergyKWh = session.EnergyDeliveredKWh;
        //            booking.UpdatedAt = DateTime.Now;

        //            _unitOfWork.BookingRepository.Update(booking);

        //            // 4️⃣ Cập nhật lại trạng thái trụ và cổng (nếu cần)
        //            var connector = await _unitOfWork.ConnectorRepository.GetByIdAsync(
        //                predicate: c => !c.IsDeleted && c.Id == session.ConnectorId,
        //                asNoTracking: false
        //            );
        //            if (connector != null)
        //            {
        //                connector.Status = "Available";
        //                connector.IsLocked = false;
        //                connector.UpdatedAt = DateTime.Now;
        //            }

        //            var post = await _unitOfWork.ChargingPostRepository.GetByIdAsync(
        //                predicate: p => !p.IsDeleted && p.Id == session.ChargingPostId,
        //                asNoTracking: false
        //            );
        //            if (post != null)
        //            {
        //                post.Status = "Available";
        //                post.UpdatedAt = DateTime.Now;
        //            }

        //            await _unitOfWork.SaveChangesAsync();

        //            // 5️ Chuẩn bị DTO trả về
        //            var response = booking.Adapt<BookingViewDto>();
        //            return new ServiceResult(Const.SUCCESS_UPDATE_CODE, "Hoàn tất đặt chỗ thành công!", response);
        //        }
        //        catch (Exception ex)
        //        {
        //            return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
        //        }
        //    }
        //}


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