using BusinessLogic.IServices;
using Infrastructure.IUnitOfWork;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.Services
{
    public class CheckInCodeService(IUnitOfWork unitOfWork) : ICheckInCodeService
    {
        readonly IUnitOfWork _unitOfWork = unitOfWork;
        static readonly Random _random = new();

        public async Task<string> GenerateUniqueCodeAsync()
        {
            string code;
            bool exists;

            do
            {
                code = _random.Next(1000, 10000).ToString();

                exists = (await _unitOfWork.BookingRepository.GetAllAsync(
                    b => b.CheckInCode == code
                )).Any();

            } while (exists);

            return code;
        }
    }
}