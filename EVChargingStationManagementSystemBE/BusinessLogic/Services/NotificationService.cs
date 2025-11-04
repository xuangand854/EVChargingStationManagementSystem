using BusinessLogic.IServices;
using Infrastructure.IUnitOfWork;
using Infrastructure.Models;

namespace BusinessLogic.Services
{
    public class NotificationService(IUnitOfWork unitOfWork) : INotificationService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;

        public async Task<Notification> NotifyStaffOffLinePaymentRecord(
        Guid recipientId, Guid senderId, string content)
        {
            var title = "Đã có người dùng chọn phương thức thanh toán offline";
            var message = $"";

            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                Title = title,
                Message = message,
                Type = "OffLinePayment",
                CreatedAt = DateTime.Now
            };

            if (senderId != Guid.Empty)
                notification.CreatedBy = senderId;

            await _unitOfWork.NotificationRepository.CreateAsync(notification);

            var recipient = new NotificationRecipient
            {
                Id = Guid.NewGuid(),
                NotificationId = notification.Id,
                RecipientId = recipientId,
                IsRead = false,
                ReadAt = null
            };

            await _unitOfWork.NotificationRecipientRepository.CreateAsync(recipient);

            await _unitOfWork.SaveChangesAsync();

            return notification;
        }

        // Thông báo cho staff khi admin thay đổi profile của staff

        // 
    }
}
