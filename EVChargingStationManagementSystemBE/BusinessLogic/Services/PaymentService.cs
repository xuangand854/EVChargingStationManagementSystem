using BusinessLogic.Base;
using BusinessLogic.IServices;
using Common;
using Common.Enum.ChargingSession;
using Common.Enum.Payment;
using Common.Enum.Transaction;
using Common.Helper;
using Infrastructure.IUnitOfWork;
using Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Web;

namespace BusinessLogic.Services
{
    public class PaymentService(IUnitOfWork unitOfWork, IConfiguration config) : IPaymentService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly IConfiguration _config = config;

        public async Task<IServiceResult> CreatePaymentURL(Guid sessionId)
        {
            try
            {
                var chargingSession = await _unitOfWork.ChargingSessionRepository.GetByIdAsync(sessionId);

                if (chargingSession.Status.Equals(ChargingSessionStatus.Paid.ToString()))
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Phiên sạc này đã được thanh toán rồi");

                var txnRef = PaymentHelper.GenerateTxnRef(sessionId);
                string encoded = HttpUtility.UrlEncode("GiaTienPhienSac");                

                var vat = await _unitOfWork.SystemConfigurationRepository.GetByIdAsync(
                    c => !c.IsDeleted && c.Name == "VAT"
                );

                decimal vatValue = 0;
                if (vat != null && _unitOfWork.SystemConfigurationRepository.Validate(vat))
                    vatValue = vat.MinValue ?? 0;

                var payment = new Payment
                {
                    ChargingSessionId = sessionId,
                    TxnRef = txnRef,
                    TaxRate = vatValue,
                    BeforeVatAmount = chargingSession.Cost
                };
                if (chargingSession.UserId != null || chargingSession.UserId != Guid.Empty)
                    payment.PaidBy = chargingSession.UserId;
                payment.Amount = payment.BeforeVatAmount * (1 + vatValue / 100);
                payment.CreatedAt = DateTime.Now;
                payment.UpdatedAt = DateTime.Now;


                var vnpParameters = PaymentHelper.CreateVnPayParameters(
                    _config["VnPay:TmnCode"],
                    (long)payment.Amount * 100,
                    txnRef,
                    encoded,
                    _config["VnPay:ReturnUrl"],
                    "127.0.0.1",
                    "vn");

                string url = PaymentHelper.CreateVnPayUrl(_config["VnPay:PaymentUrl"], vnpParameters, _config["VnPay:HashSecret"]);

                await _unitOfWork.PaymentRepository.CreateAsync(payment);
                var result = await _unitOfWork.SaveChangesAsync();

                if (result > 0)
                    return new ServiceResult(Const.SUCCESS_CREATE_CODE, "Tạo url thanh toán thành công", url);
                else
                    return new ServiceResult(Const.FAIL_CREATE_CODE, Const.FAIL_CREATE_MSG);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }

        }

        public async Task<string> ProcessVNPayIPN(Dictionary<string, string> queryParams)
        {
            try
            {
                // Lấy hash từ VNPay gửi đến
                var receivedHash = queryParams["vnp_SecureHash"];
                queryParams.Remove("vnp_SecureHash");
                queryParams.Remove("vnp_SecureHashType");

                // Tạo hash để kiểm tra
                string calculatedHash = PaymentHelper.CreateHmac512(_config["VnPay:HashSecret"], PaymentHelper.CreateDataString(queryParams));

                if (!receivedHash.Equals(calculatedHash, StringComparison.InvariantCultureIgnoreCase))
                    return JsonResponse("97", "Invalid signature");

                // Lấy thông tin giao dịch
                string txnRef = queryParams["vnp_TxnRef"];
                string responseCode = queryParams["vnp_ResponseCode"];
                string transactionStatus = queryParams["vnp_TransactionStatus"];
                string bankCode = queryParams.ContainsKey("vnp_BankCode") ? queryParams["vnp_BankCode"] : null;
                string cardType = queryParams.ContainsKey("vnp_CardType") ? queryParams["vnp_CardType"] : null;
                string transactionNo = queryParams.ContainsKey("vnp_TransactionNo") ? queryParams["vnp_TransactionNo"] : null;

                // Tìm payment tương ứng
                var payment = await _unitOfWork.PaymentRepository.GetByIdAsync(
                    predicate: p => p.TxnRef == txnRef,
                    asNoTracking: false
                );
                if (payment == null)
                    return JsonResponse("01", "Không tìm thấy đơn thanh toán");

                var chargingSession = await _unitOfWork.ChargingSessionRepository.GetByIdAsync(
                    predicate: p => p.Id == payment.ChargingSessionId,
                    asNoTracking: false
                );
                if (chargingSession == null)
                    return JsonResponse("01", "Không tìm thấy phiên sạc");

                var connector = await _unitOfWork.ConnectorRepository.GetByIdAsync(
                    predicate: p => p.Id == chargingSession.ConnectorId,
                    asNoTracking: false
                );
                if (connector == null)
                    return JsonResponse("01", "Không tìm thấy cổng sạc");

                if (bankCode != null)
                    payment.BankCode = bankCode;
                if (cardType != null)
                    payment.PaymentMethod = cardType;
                payment.UpdatedAt = DateTime.Now;

                // Cập nhật trạng thái thanh toán
                if (responseCode == "00" && transactionStatus == "00")
                {
                    payment.Status = PaymentStatus.Successed.ToString();

                    var transaction = new Transaction
                    {
                        Id = Guid.NewGuid(),
                        Amount = payment.Amount,
                        TransactionType = TransactionTypeEnum.OnlinePayment.ToString(),
                        Status = TransactionStatus.Completed.ToString(),
                        Note = $"VNPay Transaction: {transactionNo}",
                        InitiatedAt = payment.CreatedAt,
                        CompletedAt = DateTime.Now,
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now,
                        PaymentId = payment.Id
                    };
                    if (payment.PaidBy != null || payment.PaidBy != Guid.Empty)
                        transaction.PaidBy = payment.PaidBy;
                    transaction.ReferenceCode = PaymentHelper.GenerateReferenceCode(transaction.TransactionType);

                    chargingSession.Status = ChargingSessionStatus.Paid.ToString();
                    chargingSession.UpdatedAt = DateTime.Now;

                    connector.IsLocked = false;
                    connector.UpdatedAt = DateTime.Now;

                    await _unitOfWork.TransactionRepository.CreateAsync(transaction);
                    await _unitOfWork.SaveChangesAsync();

                    return JsonResponse("00", "Thanh toán thành công");
                }
                else
                {
                    payment.Status = PaymentStatus.Failed.ToString();

                    await _unitOfWork.SaveChangesAsync();

                    return JsonResponse("02", "Thanh toán thất bại");
                }
            }
            catch (Exception ex)
            {
                return JsonResponse("99", "Lỗi không xác định: " + ex.Message);
            }
        }

        // Api này sẽ được gửi cho staff khi tài xế chọn thanh  toán offline
        // Gửi cho staff đang quản lý trạm đó (Xử lý bên FE)
        public async Task<IServiceResult> CreatePaymentOfflineRecord(Guid sessionId)
        {
            try
            {
                var chargingSession = await _unitOfWork.ChargingSessionRepository.GetByIdAsync(sessionId);

                if (chargingSession.Status.Equals(ChargingSessionStatus.Paid.ToString()))
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Phiên sạc này đã được thanh toán rồi");

                var txnRef = PaymentHelper.GenerateTxnRef(sessionId);

                var vat = await _unitOfWork.SystemConfigurationRepository.GetByIdAsync(
                    c => !c.IsDeleted && c.Name == "VAT"
                );

                decimal vatValue = 0;
                if (vat != null && _unitOfWork.SystemConfigurationRepository.Validate(vat))
                    vatValue = vat.MinValue ?? 0;

                var payment = new Payment
                {
                    ChargingSessionId = sessionId,
                    TxnRef = txnRef,
                    TaxRate = vatValue,
                    BeforeVatAmount = chargingSession.Cost
                };
                if (chargingSession.UserId != null || chargingSession.UserId != Guid.Empty)
                    payment.PaidBy = chargingSession.UserId;
                payment.PaymentMethod = "OFFLINE";
                payment.Amount = payment.BeforeVatAmount * (1 + vatValue / 100);
                payment.Status = PaymentStatus.Initiated.ToString();
                payment.CreatedAt = DateTime.Now;
                payment.UpdatedAt = DateTime.Now;

                await _unitOfWork.PaymentRepository.CreateAsync(payment);

                //Gửi thông báo cho staff

                var result = await _unitOfWork.SaveChangesAsync();

                if (result > 0)
                    return new ServiceResult(Const.SUCCESS_CREATE_CODE, "Đã ghi nhận phương thức thanh toán tiền mặt, vui lòng đến quầy nhân viên để thanh toán");
                else
                    return new ServiceResult(Const.FAIL_CREATE_CODE, Const.FAIL_CREATE_MSG);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }

        }

        // Staff nhận tiền xong bấm api này
        public async Task<IServiceResult> UpdatePaymentOfflineRecord(Guid paymentId, Guid userId)
        {
            try
            {             

                var payment = await _unitOfWork.PaymentRepository.GetByIdAsync(
                    predicate: s => !s.IsDeleted && s.Id == paymentId,
                    asNoTracking: false
                );
                if (payment == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy đơn thanh toán");

                var chargingSession = await _unitOfWork.ChargingSessionRepository.GetByIdAsync(
                    s => !s.IsDeleted && s.Id == payment.ChargingSessionId);

                if (chargingSession == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy phiên sạc của đơn thanh toán này");

                var connector = await _unitOfWork.ConnectorRepository.GetByIdAsync(
                    predicate: s => !s.IsDeleted && s.Id == chargingSession.ConnectorId,
                    include: s => s.Include( s => s.ChargingPost).ThenInclude(s => s.ChargingStationNavigation),
                    asNoTracking: false
                );
                if (connector == null)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Không tìm thấy cổng sạc của phiên sạc này");

                if (connector.ChargingPost.ChargingStationNavigation.OperatorId != userId)
                    return new ServiceResult(Const.WARNING_NO_DATA_CODE, "Tài khoản này không phụ trách trạm này, vui lòng đăng nhập bằng tài khoản nhân viên khác");

                if (chargingSession.Status.Equals(ChargingSessionStatus.Paid.ToString()))
                    return new ServiceResult(Const.FAIL_CREATE_CODE, "Phiên sạc này đã được thanh toán rồi");
                
                payment.Status = PaymentStatus.Successed.ToString();
                payment.UpdatedAt = DateTime.Now;

                var transaction = new Transaction
                {
                    Id = Guid.NewGuid(),
                    Amount = payment.Amount,
                    TransactionType = TransactionTypeEnum.OfflinePayment.ToString(),
                    Status = TransactionStatus.Completed.ToString(),
                    Note = $"Offline Transaction",
                    InitiatedAt = payment.CreatedAt,
                    CompletedAt = DateTime.Now,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                    PaymentId = payment.Id
                };
                if (payment.PaidBy != null || payment.PaidBy != Guid.Empty)
                    transaction.PaidBy = payment.PaidBy;
                transaction.ReferenceCode = PaymentHelper.GenerateReferenceCode(transaction.TransactionType);

                chargingSession.Status = ChargingSessionStatus.Paid.ToString();
                chargingSession.UpdatedAt = DateTime.Now;

                connector.IsLocked = false;
                connector.UpdatedAt = DateTime.Now;

                await _unitOfWork.TransactionRepository.CreateAsync(transaction);
                var result = await _unitOfWork.SaveChangesAsync();

                if (result > 0)
                    return new ServiceResult(Const.SUCCESS_CREATE_CODE, "Ghi nhận giao dịch thành công");
                else
                    return new ServiceResult(Const.FAIL_CREATE_CODE, Const.FAIL_CREATE_MSG);
            }
            catch (Exception ex)
            {
                return new ServiceResult(Const.ERROR_EXCEPTION, ex.Message);
            }

        }

        private static string JsonResponse(string rspCode, string message)
        {
            return $"{{\"RspCode\":\"{rspCode}\",\"Message\":\"{message}\"}}";
        }

    }
}
