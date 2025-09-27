using Repositories.IRepositories;

namespace Repositories.IUnitOfWork
{
    public interface IUnitOfWork : IDisposable
    {
        Task<int> SaveChangesAsync();
        ISCStaffRepository SCStaffRepository { get; }
        IVehicleModelRepository VehicleModelRepository { get; }

    }
}
