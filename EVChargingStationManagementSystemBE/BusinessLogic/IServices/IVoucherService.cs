using BusinessLogic.Base;
using Common.DTOs.VoucherDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.IServices
{
    public interface IVoucherService
    {
        // ===== ADMIN CRUD =====
        Task<IServiceResult> GetAvailableVouchers();
        Task<IServiceResult> CreateVoucher(VoucherCreateDto dto);
        Task<IServiceResult> UpdateVoucher(VoucherUpdateDto dto, Guid voucherId);
        Task<IServiceResult> DeleteVoucher(Guid voucherId);

        // ===== USER FLOW =====
        Task<IServiceResult> RedeemVoucher(Guid evDriverId, Guid voucherId);
        Task<IServiceResult> UseVoucher(Guid userVoucherId, Guid sessionId);

        // ===== BACKGROUND JOB =====
        Task<IServiceResult> ExpireVoucher(Guid userVoucherId);
        Task<int> ExpireAllExpiredVouchers();
    }
}