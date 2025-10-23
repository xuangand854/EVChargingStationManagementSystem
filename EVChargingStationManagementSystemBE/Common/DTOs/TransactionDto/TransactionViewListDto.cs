using Common.Enum.Transaction;

namespace Common.DTOs.TransactionDto
{
    public class TransactionViewListDto
    {
        public Guid Id { get; set; }
        public string ReferenceCode { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public TransactionTypeEnum TransactionType { get; set; } = TransactionTypeEnum.Unknown;
        public TransactionStatus Status { get; set; } = TransactionStatus.Unknown;
    }
}
