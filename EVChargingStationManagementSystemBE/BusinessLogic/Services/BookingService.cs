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
using Common.Enum.Connector;
using BusinessLogic.Base;

namespace BusinessLogic.Services
{
    public class BookingService(IUnitOfWork unitOfWork, UserManager<UserAccount> userManager, ICheckInCodeService checkInCodeService) : IBookingService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly UserManager<UserAccount> _userManager = userManager;
        private readonly ICheckInCodeService _checkInCodeService = checkInCodeService;


        // Tạo booking mới (EndTime mặc định +1h30)

        public async Task<IServiceResult> CreateBooking(BookingCreatedDto dto, Guid userId)
        {

            try
            {
                // --- BR12: Kiểm tra tài khoản EVDriver ---
                var user = await _unitOfWork.UserAccountRepository.GetByIdAsync(
                    predicate : 
                    u => u.Id == userId && !u.IsDeleted);
                if (user == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy tài khoản người dùng.");
                if (!user.EmailConfirmed)
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Tài khoản chưa được xác thực .");
                var roles = await _userManager.GetRolesAsync(user);
                if (!roles.Contains("EVDriver", StringComparer.OrdinalIgnoreCase))
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Chỉ EVDriver mới được phép đặt chỗ.");

                // --- BR04: Lấy EVDriver profile + xe ---
                var evDriver = await _unitOfWork.EVDriverRepository.GetByIdAsync(
                    e => e.AccountId == userId && !e.IsDeleted,
                    include: e => e.Include(x => x.UserVehicles).ThenInclude(v => v.VehicleModel));
                if (evDriver == null)
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Người dùng chưa có hồ sơ EVDriver.");
                if (!evDriver.Status.Equals("Active"))
                {
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Tài khoản của bạn đã bị khóa  ");
                }
                var vehicle = evDriver.UserVehicles
                    .Select(uv => uv.VehicleModel)
                    .FirstOrDefault(v => v.Id == dto.VehicleId && !v.IsDeleted);
                if (vehicle == null)
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Phương tiện không hợp lệ hoặc không thuộc người dùng.");

                // --- BR08: Kiểm tra loại xe ---
                var validVehicle = await _unitOfWork.VehicleModelRepository.GetByIdAsync(
                    v => v.Id == vehicle.Id && !v.IsDeleted);
                if (validVehicle == null)
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Xe không tồn tại trong hệ thống.");// --- BR06: StartTime >= Now + 5min ---
                if (dto.StartTime < DateTime.Now.AddMinutes(5))
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Thời gian bắt đầu phải cách hiện tại ≥ 5 phút.");

                // --- BR05: Kiểm tra booking đang hoạt động ---
                var active = await _unitOfWork.BookingRepository.GetAllAsync(
                    b => b.BookedBy == userId &&
                         (b.Status == "Scheduled" || b.Status == "InProgress") &&
                         !b.IsDeleted);
                if (active.Any())
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Bạn đã có booking đang hoạt động.");

                //// --- BR07: Không đặt liên tiếp tại cùng trạm trong 30 phút ---
                //var recent = await _unitOfWork.BookingRepository.GetAllAsync(
                //    b => b.BookedBy == userId &&
                //         b.StationId == dto.StationId &&
                //         b.ActualEndTime.HasValue &&
                //         b.ActualEndTime.Value > DateTime.Now.AddMinutes(-30));
                //if (recent.Any())
                //    return new ServiceResult(Const.FAIL_CREATE_CODE, "Không thể đặt liên tiếp tại cùng trạm trong 30 phút.");

                // --- Kiểm tra trạm sạc ---
                var station = await _unitOfWork.ChargingStationRepository.GetByIdAsync(
                    s => s.Id == dto.StationId && !s.IsDeleted,
                    include: s => s.Include(x => x.ChargingPosts));
                if (station == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy trạm sạc.");
                if (station.Status.Equals("Maintenance", StringComparison.OrdinalIgnoreCase) ||
          station.Status.Equals("Inactive", StringComparison.OrdinalIgnoreCase))
                {
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Trạm sạc không khả dụng.");
                }


                // --- BR09: EndTime mặc định = StartTime + 90 phút ---
                var booking = dto.Adapt<Booking>();
                booking.Id = Guid.NewGuid();
                booking.BookedBy = userId;
                booking.Status = "Scheduled";
                booking.EndTime = dto.StartTime.AddMinutes(90);
                booking.CreatedAt = DateTime.Now;
                booking.UpdatedAt = DateTime.Now;
                //  Sinh mã check-in 4 số duy nhất qua service
                booking.CheckInCode = await _checkInCodeService.GenerateUniqueCodeAsync();
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

        public async Task<IServiceResult> CheckInBooking(BookingCheckInDto request)
        {
            try
            {
                //  1. Tìm booking theo mã CheckInCode + userId
                var bookings = await _unitOfWork.BookingRepository.GetAllAsync(
                 b => b.CheckInCode == request.CheckInCode &&
                 !b.IsDeleted,
                include: b => b.Include(x => x.ConnectorNavigation),
                asNoTracking: false

);

                var booking = bookings.FirstOrDefault();


                if (booking == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy booking.");

                //  2. Kiểm tra trạng thái
                if (!booking.Status.Equals(BookingStatus.Scheduled.ToString(), StringComparison.OrdinalIgnoreCase) &&
                    !booking.Status.Equals(BookingStatus.Reserved.ToString(), StringComparison.OrdinalIgnoreCase))
                {
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Booking không ở trạng thái 'Scheduled' hoặc 'Reserved'.");
                }

                //  3. Kiểm tra mã check-in hợp lệ
                if (string.IsNullOrWhiteSpace(request.CheckInCode) ||
                    !string.Equals(booking.CheckInCode, request.CheckInCode, StringComparison.Ordinal))
                {
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Mã check-in không hợp lệ.");
                }

                //  4. Kiểm tra thời gian check-in
                var now = DateTime.Now;
                if (now < booking.StartTime.AddMinutes(-15) || now > booking.EndTime)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Không thể check-in ngoài thời gian cho phép.");

                //  5. Mở khóa connector (nếu có gắn)
                if (booking.ConnectorNavigation != null)
                {
                    booking.ConnectorNavigation.IsLocked = false;
                    booking.ConnectorNavigation.Status = ConnectorStatus.Available.ToString(); // hoặc "Active"
                }

                //  6. Cập nhật booking sang "InProgress"
                booking.Status = BookingStatus.InProgress.ToString();
                booking.ActualStartTime = now;
                booking.UpdatedAt = now;

                var result = await _unitOfWork.SaveChangesAsync();

                if (result > 0)
                {
                    var response = booking.Adapt<BookingViewDto>(); return new ServiceResult(Const.SUCCESS_UPDATE_CODE, "Check-in thành công, trụ đã được mở khóa.", response);
                }

                return new ServiceResult(Const.FAIL_UPDATE_CODE, "Không thể hoàn tất check-in.");
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }


        // Check-in cho booking (cập nhật trạng thái sang InProgress + tính thời gian sạc)





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
        //                predicate: c => !c.IsDeleted && c.Id == session.ConnectorId,//                asNoTracking: false
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

        public async Task<IServiceResult> CompleteBookingAsync(Guid bookingId)
        {
            try
            {
                var booking = await _unitOfWork.BookingRepository.GetByIdAsync(
                    predicate: b => !b.IsDeleted && b.Id == bookingId,
                    include: b => b.Include(x => x.ConnectorNavigation)
                                   .ThenInclude(c => c.ChargingPost)
                                   .ThenInclude(p => p.ChargingStationNavigation),
                    asNoTracking: false
                );

                if (booking == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy booking");

                var session = await _unitOfWork.ChargingSessionRepository.GetByIdAsync(
                    predicate: s => s.BookingId == booking.Id && !s.IsDeleted,
                    asNoTracking: false
                );

                if (session == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy phiên sạc tương ứng");

                // Kiểm tra đã thanh toán (payment) — nếu bạn lưu trạng thái Paid trên ChargingSession
                if (!session.Status.Equals(ChargingSessionStatus.Paid.ToString(), StringComparison.OrdinalIgnoreCase))
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Chưa thanh toán xong, không thể hoàn tất booking");

                var connector = booking.ConnectorNavigation;
                if (connector != null)
                {
                    connector.IsLocked = false;
                    connector.IsPluggedIn = false;
                    connector.Status = ConnectorStatus.Available.ToString();
                    connector.UpdatedAt = DateTime.Now;
                }

                booking.Status = BookingStatus.Completed.ToString();
                booking.ActualEndTime = DateTime.Now;
                booking.UpdatedAt = DateTime.Now;

                session.Status = ChargingSessionStatus.Paid.ToString();
                session.EndTime = DateTime.Now;
                session.UpdatedAt = DateTime.Now;

                var station = connector?.ChargingPost?.ChargingStationNavigation;
                if (station != null && connector != null)
                {
                    if (connector.ChargingPost.VehicleTypeSupported == "Car")
                        station.AvailableCarConnectors++;
                    else
                        station.AvailableBikeConnectors++;

                    station.UpdatedAt = DateTime.Now;
                }

                await _unitOfWork.SaveChangesAsync();
                return new ServiceResult(Const.SUCCESS_UPDATE_CODE, "Hoàn tất booking thành công");
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<IServiceResult> CancelBooking(Guid bookingId, Guid userId)
        {
            try
            {
                var user = await _unitOfWork.UserAccountRepository.GetByIdAsync(u => u.Id == userId && !u.IsDeleted);
                if (user == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy người dùng");

                var roles = await _userManager.GetRolesAsync(user);
                if (!roles.Any(r => r.Equals("EVDriver", StringComparison.OrdinalIgnoreCase)))
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Chỉ EVDriver được hủy booking");

                var booking = await _unitOfWork.BookingRepository.GetByIdAsync(
                    b => b.Id == bookingId && !b.IsDeleted,
                    include: b => b.Include(x => x.ChargingStationNavigation)
                                  .ThenInclude(cs => cs.ChargingPosts),
                    asNoTracking: false
                );
                if (booking == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy booking");

                if (booking.BookedBy != userId)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Không có quyền hủy booking này");

                if (!booking.Status.Equals("Scheduled", StringComparison.OrdinalIgnoreCase))
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Chỉ được hủy khi booking đang Scheduled"); if (DateTime.Now >= booking.StartTime)
                    return new ServiceResult(Const.FAIL_UPDATE_CODE, "Không thể hủy sau thời điểm bắt đầu");

                // Cập nhật trạng thái booking
                booking.Status = "Cancelled";
                booking.UpdatedAt = DateTime.Now;

                var reservedPost = booking.ChargingStationNavigation.ChargingPosts
                    .FirstOrDefault(p => p.Status == "Reserved");
                if (reservedPost != null)
                {
                    reservedPost.Status = "Available";
                    reservedPost.UpdatedAt = DateTime.Now;
                }

                // Không cần gọi Update hay Entry — EF sẽ tự theo dõi
                var result = await _unitOfWork.SaveChangesAsync();

                if (result > 0)
                {
                    var response = booking.Adapt<BookingViewDto>();
                    return new ServiceResult(Const.SUCCESS_UPDATE_CODE, "Hủy booking thành công", response);
                }

                return new ServiceResult(Const.FAIL_UPDATE_CODE, "Không thể hủy booking");
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
                        .Include(x => x.ConnectorNavigation)               
                            .ThenInclude(c => c.ChargingPost),              
                    asNoTracking: false
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
         .Include(x => x.BookedByNavigation)
         .Include(x => x.ConnectorNavigation)
             .ThenInclude(c => c.ChargingPost),
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



        // Tự động khóa tài khoản EVDriver nếu no-show >= 3 lần/tháng
        public async Task LockAccountsWithTooManyNoShows()
        {
            var threshold = 3;
            var since = DateTime.Now.AddMonths(-1);

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
                    ev.UpdatedAt = DateTime.Now;
                }
            }

            await _unitOfWork.SaveChangesAsync();
        }

        // Tự động hủy các booking quá thời gian check-in cho phép
        // Chú ý: phương thức này sẽ xử lý những booking có trạng thái "Scheduled" mà
        // hiện tại  đã vượt quá StartTime + CHECKIN_ALLOW_MINUTES.
        // CHECKIN_ALLOW_MINUTES lấy từ SystemConfiguration (nếu không có → mặc định 15 phút).
        public async Task AutoCancelExpiredBookings()
        {
            var now = DateTime.Now;

            // Lấy cấu hình CHECKIN_ALLOW_MINUTES từ DB, default = 15 phút
            var config = await _unitOfWork.SystemConfigurationRepository.GetByIdAsync(
                c => !c.IsDeleted && c.Name == "CHECKIN_ALLOW_MINUTES");
            int allowance = (int)(config?.MinValue ?? 15);

            // Lấy tất cả booking Scheduled mà đã quá thời gian cho phép check-in hoặc đã kết thúc
            var expiredBookings = await _unitOfWork.BookingRepository.GetAllAsync(
                b => !b.IsDeleted &&
                     b.Status == "Scheduled" &&
                     (now > b.StartTime.AddMinutes(allowance) || now > b.EndTime),
                include: b => b.Include(x => x.ChargingStationNavigation)
                               .ThenInclude(cs => cs.ChargingPosts)
                                   .ThenInclude(p => p.Connectors),
                                       asNoTracking: false
            );

            foreach (var booking in expiredBookings)
            {
                // Hủy booking
                booking.Status = "Cancelled";
                booking.UpdatedAt = now;

                var station = booking.ChargingStationNavigation;
                if (station != null)
                {
                    foreach (var post in station.ChargingPosts)
                    {
                        foreach (var connector in post.Connectors ?? Enumerable.Empty<Connector>())
                        {
                            // Nếu connector đang bị lock/reserved vì booking này -> unlock và set lại Available
                            if (connector.IsLocked && booking.ConnectorId == connector.Id)
                            {
                                connector.IsLocked = false;
                                connector.Status = "Available";
                                connector.UpdatedAt = now;
                            }
                        }
                    }
                }
            }

            await _unitOfWork.SaveChangesAsync();
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
                s => s.Status == "Error" && !s.IsDeleted, include: s => s.Include(x => x.ChargingPosts)
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
            var now = DateTime.Now;

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
            }//  Lưu toàn bộ thay đổi (booking + trạm + post) xuống cơ sở dữ liệu
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task AutoReserveConnectorBeforeStart()
        {
            var now = DateTime.Now;

            // Lấy danh sách booking Scheduled mà StartTime cách now <= 5 phút
            var upcomingBookings = await _unitOfWork.BookingRepository.GetAllAsync(
                predicate: b => !b.IsDeleted &&
                         b.Status == "Scheduled" &&
                         b.StartTime <= now.AddMinutes(5) &&
                         b.StartTime > now,
                include: b => b.Include(x => x.ChargingStationNavigation)
                               .ThenInclude(s => s.ChargingPosts)
                                   .ThenInclude(p => p.Connectors)
                               .Include(x => x.ConnectorNavigation) // 👈 include connector đã gắn
                                   .ThenInclude(c => c.ChargingPost),
                asNoTracking: false
            );

            foreach (var booking in upcomingBookings)
            {
                // Nếu booking chưa có connector thì mới chọn
                if (booking.ConnectorId == null)
                {
                    var connector = booking.ChargingStationNavigation.ChargingPosts
                        .SelectMany(p => p.Connectors)
                        .FirstOrDefault(c => c.Status == ConnectorStatus.Available.ToString());

                    if (connector != null)
                    {
                        connector.Status = ConnectorStatus.Reserved.ToString();
                        connector.IsLocked = true;
                        connector.UpdatedAt = now;

                        booking.ConnectorId = connector.Id; 
                        booking.UpdatedAt = now;
                    }
                }
                else
                {
                    // Nếu đã có connector thì giữ nguyên, không chọn lại
                    var connector = booking.ConnectorNavigation;
                    if (connector != null && connector.IsLocked == false)
                    {
                        connector.Status = ConnectorStatus.Reserved.ToString();
                        connector.IsLocked = true;
                        connector.UpdatedAt = now;
                    }
                }
            }

            await _unitOfWork.SaveChangesAsync();
        }

        public Task AutoCompleteBookingsAsync()
        {
            throw new NotImplementedException();
        }

        public Task AutoProcessAllBookingsAsync()
        {
            throw new NotImplementedException();
        }
    }

}