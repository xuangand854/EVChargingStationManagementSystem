﻿using Common.Enum.Transaction;

namespace Common.DTOs.TransactionDto
{
    public class TransactionViewDetailDto
    {
        public Guid Id { get; set; }
        public string ReferenceCode { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public TransactionTypeEnum TransactionType { get; set; } = TransactionTypeEnum.Unknown;
        public TransactionStatus Status { get; set; } = TransactionStatus.Unknown;
        public string Note { get; set; } = string.Empty;
        public DateTime InitiatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public Guid? PaidBy { get; set; }
        public Guid? RecordedBy { get; set; }
        public Guid? PaymentId { get; set; }
    }
}
