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
        Task<IServiceResult> GetAvailableVouchers();

        Task<IServiceResult> CreateVoucher(VoucherCreateDto dto);

        /// <summary>
        /// Cập nhật voucher đã tồn tại.
        /// </summary>
        Task<IServiceResult> UpdateVoucher(VoucherUpdateDto dto, Guid voucherId);

        Task<IServiceResult> RedeemVoucher(Guid evDriverId, Guid voucherId);

        Task<IServiceResult> UseVoucher(Guid userVoucherId, Guid stationId);

        Task<IServiceResult> ExpireVoucher(Guid userVoucherId);
    }
}