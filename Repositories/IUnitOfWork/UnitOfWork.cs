using Repositories.Data;
using Repositories.IRepository;
using Repositories.Repository;

namespace Repositories.IUnitOfWork
{
    public class UnitOfWork : IUnitOfWork
    {
        private ISCStaffRepository? sCStaffRepository;
        private readonly EVCSMSContext context;

      

       public ISCStaffRepository SCStaffRepository
        {
get
            {
                return sCStaffRepository ??= new SCStaffRepository(context);
            }
        }

        public UnitOfWork()
            => context ??= new EVCSMSContext();

        public async Task<int> SaveChangesAsync()
        {
            foreach (var entry in context.ChangeTracker.Entries())
            {
                Console.WriteLine($"{entry.Entity.GetType().Name} - {entry.State}");
                foreach (var prop in entry.Properties)
                {
                    if (prop.IsModified)
                    {
                        Console.WriteLine($"   {prop.Metadata.Name}: {prop.OriginalValue} -> {prop.CurrentValue}");
                    }
                }
            }

            return await context.SaveChangesAsync();
        }

        // Thêm method Dispose để implement IDisposable
        public void Dispose() => context?.Dispose();
    }
}