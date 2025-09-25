using Repositories.IRepository;

namespace Repositories.IUnitOfWork
{
    public interface IUnitOfWork : IDisposable
    {
        Task<int> SaveChangesAsync();
    ISCStaffRepository SCStaffRepository { get; }
        
    }
}
