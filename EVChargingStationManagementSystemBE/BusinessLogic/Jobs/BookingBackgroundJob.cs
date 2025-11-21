using BusinessLogic.IServices;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace BusinessLogic.Jobs
{
    public class BookingBackgroundJob : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<BookingBackgroundJob> _logger;
        private readonly TimeSpan _interval = TimeSpan.FromSeconds(15);

        private readonly SemaphoreSlim _lockNoShows = new(1, 1);
        private readonly SemaphoreSlim _lockCancelExpired = new(1, 1);
        private readonly SemaphoreSlim _lockReserveConnector = new(1, 1);
        private readonly SemaphoreSlim _lockCompleteBooking = new(1, 1);

        public BookingBackgroundJob(IServiceScopeFactory scopeFactory, ILogger<BookingBackgroundJob> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("[BookingBackgroundJob] Service started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = _scopeFactory.CreateScope();
                var bookingService = scope.ServiceProvider.GetRequiredService<IBookingService>();

                // --- Xử lý từng job riêng biệt ---
                await RunJobSafely(
                    _lockNoShows,
                    () => bookingService.LockAccountsWithTooManyNoShows(),
                    "LockAccountsWithTooManyNoShows"
                );

                await RunJobSafely(
                    _lockCancelExpired,
                    () => bookingService.AutoCancelExpiredBookings(),
                    "AutoCancelExpiredBookings"
                );

                await RunJobSafely(
                    _lockReserveConnector,
                    () => bookingService.AutoReserveConnectorBeforeStart(),
                    "AutoReserveConnectorBeforeStart"
                );

                await RunJobSafely(
                    _lockCompleteBooking,
                    () => bookingService.AutoCompleteBookingsAsync(),
                    "AutoCompleteBookingsAsync"
                );

                // Delay giữa các vòng
                await Task.Delay(_interval, stoppingToken);
            }

            _logger.LogInformation("[BookingBackgroundJob] Service stopped.");
        }

        private async Task RunJobSafely(SemaphoreSlim semaphore, Func<Task> job, string jobName)
        {
            await semaphore.WaitAsync();
            try
            {
                await job();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"[BookingBackgroundJob] Lỗi khi chạy job {jobName}: {ex.Message}");
            }
            finally
            {
                semaphore.Release();
            }
        }
    }
}
