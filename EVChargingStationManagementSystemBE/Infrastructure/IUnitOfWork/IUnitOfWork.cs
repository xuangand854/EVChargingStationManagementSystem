using Infrastructure.IRepositories;

namespace Infrastructure.IUnitOfWork
{
    public interface IUnitOfWork : IDisposable
    {
        Task<int> SaveChangesAsync();
        ISCStaffRepository SCStaffRepository { get; }
        IVehicleModelRepository VehicleModelRepository { get; }        
        IChargingStationRepository ChargingStationRepository { get; }
        IEVDriverRepository EVDriverRepository { get; }
        IChargingPostRepository ChargingPostRepository { get; }
        IUserAccountRepository UserAccountRepository { get; }
    }
}
