using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Repositories.Models;

namespace Repositories.ModelsConfig
{
    public class TransactionConfig : IEntityTypeConfiguration<Transaction>
    {
        public void Configure(EntityTypeBuilder<Transaction> builder)
        {
            builder.ToTable("Transaction");
            builder.HasOne(t => t.RecordedByNavigation)
                   .WithMany(ua => ua.TransactionsRecorded)
                   .HasForeignKey(sc => sc.RecordedBy)
                   .OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(t => t.PaidByNavigation)
                .WithMany(ua => ua.TransactionsPaid)
                .HasForeignKey(sc => sc.PaidBy)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
