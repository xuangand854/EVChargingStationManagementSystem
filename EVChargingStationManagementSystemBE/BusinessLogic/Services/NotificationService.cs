using Azure;
using BusinessLogic.Base;
using BusinessLogic.IServices;
using Common;
using Common.DTOs.NotificationDto;
using Infrastructure.IUnitOfWork;
using Mapster;
using Microsoft.EntityFrameworkCore;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace BusinessLogic.Services
{
    public class NotificationService(IUnitOfWork unitOfWork) : INotificationService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;

        
    }
}
