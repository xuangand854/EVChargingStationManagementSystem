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
        public IUserAccountRepository UserAccountRepository { get; }
        IChargingPostRepository ChargingPostRepository { get; }
    }
}
