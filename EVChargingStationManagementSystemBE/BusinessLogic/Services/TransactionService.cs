using BusinessLogic.Base;
using BusinessLogic.IServices;
using Common;
using Common.DTOs.TransactionDto;
using Infrastructure.IUnitOfWork;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogic.Services
{
    public class TransactionService(IUnitOfWork unitOfWork) : ITransactionService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;

        public async Task<IServiceResult> GetList()
        {

            try
            {
                var transaction = await _unitOfWork.TransactionRepository.GetAllAsync(
                    predicate: v => !v.IsDeleted,
                    orderBy: q => q.OrderByDescending(v => v.CreatedAt)
                    );
                if (transaction == null || transaction.Count == 0)
                    return new ServiceResult(
                        Const.WARNING_NO_DATA_CODE,
                        "Không tìm thấy lịch sử giao dịch nào");

                else
                {
                    var response = transaction.Adapt<List<TransactionViewListDto>>();
                    return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, response);
                }
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<IServiceResult> GetList(Guid paidBy)
        {

            try
            {
                var transaction = await _unitOfWork.TransactionRepository.GetAllAsync(
                    predicate: v => !v.IsDeleted && v.PaidBy == paidBy,
                    orderBy: q => q.OrderByDescending(v => v.CreatedAt)
                    );
                if (transaction == null || transaction.Count == 0)
                    return new ServiceResult(
                        Const.WARNING_NO_DATA_CODE,
                        "Không tìm thấy lịch sử giao dịch nào");

                else
                {
                    var response = transaction.Adapt<List<TransactionViewListDto>>();
                    return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, response);
                }
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<IServiceResult> GetById(Guid transactionId)
        {

            try
            {
                var transaction = await _unitOfWork.TransactionRepository.GetByIdAsync(
                    predicate: v => !v.IsDeleted && v.Id == transactionId,
                    include: c => c.Include(cs => cs.Payment)
                    );
                if (transaction == null)
                    return new ServiceResult(
                        Const.WARNING_NO_DATA_CODE,
                        "Không tìm thấy lịch sử giao dịch nào"
                    );

                else
                {
                    var response = transaction.Adapt<TransactionViewDetailDto>();
                    return new ServiceResult(Const.SUCCESS_READ_CODE, Const.SUCCESS_READ_MSG, response);
                }
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

    }
}
