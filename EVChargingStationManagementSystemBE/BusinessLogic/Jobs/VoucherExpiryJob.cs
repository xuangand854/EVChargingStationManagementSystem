using Infrastructure.IUnitOfWork;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace BusinessLogic.Jobs
{
    public class VoucherExpiryJob : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<VoucherExpiryJob> _logger;
        private readonly TimeSpan _interval = TimeSpan.FromHours(1);

        public VoucherExpiryJob(IServiceScopeFactory scopeFactory, ILogger<VoucherExpiryJob> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = _scopeFactory.CreateScope();
                var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                await ExpireVouchers(unitOfWork);

                await Task.Delay(_interval, stoppingToken);
            }
        }

        private async Task ExpireVouchers(IUnitOfWork unitOfWork)
        {
            var now = DateTime.Now;
            var expiredVouchers = await unitOfWork.UserVoucherRepository.GetQueryable()
                .Where(uv => uv.Status != "Used" && uv.ExpiryDate < now)
                .ToListAsync();

            foreach (var uv in expiredVouchers)
            {
                uv.Status = "Expired";
                uv.UpdatedAt = now;
            }

            if (expiredVouchers.Count > 0)
                _logger.LogInformation("[VoucherExpiryJob] Đã hết hạn {count} voucher lúc {time}", expiredVouchers.Count, now);
            else
                _logger.LogInformation("[VoucherExpiryJob] Không có voucher nào hết hạn lúc {time}", now);

            await unitOfWork.SaveChangesAsync();
        }
    }
}
