using Infrastructure.Data;
using Infrastructure.IRepositories;
using Infrastructure.Repositories;
using Infrastructure.Repositories.Infrastructure.Repositories;

namespace Infrastructure.IUnitOfWork
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly EVCSMSContext context;

        private ISCStaffRepository? sCStaffRepository;
        private IVehicleModelRepository? vehicleModelRepository;
        private IChargingStationRepository? chargingStationRepository;
        private IEVDriverRepository? evDriverRepository;
        private IUserAccountRepository? userAccountRepository;
        private IChargingPostRepository? chargingPostRepository;
        private IPaymentRepository? paymentRepository;
        private IChargingSessionRepository? chargingSessionRepository;
        private ISystemConfigurationRepository? systemConfigurationRepository;
        private IConnectorRepository? connectorRepository;
        private IBookingRepository? bookingRepository;
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

        public void Dispose()
        {
            context.Dispose();
            GC.SuppressFinalize(this);
        }

        public ISCStaffRepository SCStaffRepository
        {
            get
            {
                return sCStaffRepository ??= new SCStaffRepository(context);
            }
        }

        public IVehicleModelRepository VehicleModelRepository
        {
            get
            {
                return vehicleModelRepository ??= new VehicleModelRepository(context);
            }
        }
        public IEVDriverRepository EVDriverRepository
        {
            get
            {
                return evDriverRepository ??= new EVDriverRepository(context);
            }
        }
        public IChargingStationRepository ChargingStationRepository
        {
            get
            {
                return chargingStationRepository ??= new ChargingStationRepository(context);
            }
        }

        public IUserAccountRepository UserAccountRepository
        {
            get
            {
                return userAccountRepository ??= new UserAccountRepository(context);
            }
        }

        public IChargingPostRepository ChargingPostRepository
        {
            get
            {
                return chargingPostRepository ??= new ChargingPostRepository(context);
            }
        }
        public IPaymentRepository PaymentRepository
        {
            get
            {
                return paymentRepository ??= new PaymentRepository(context);
            }
        }
        public IChargingSessionRepository ChargingSessionRepository
        {
            get
            {
                return chargingSessionRepository ??= new ChargingSessionRepository(context);
            }
        }
        public ISystemConfigurationRepository SystemConfigurationRepository
        {
            get
            {
                return systemConfigurationRepository ??= new SystemConfigurationRepository(context);
            }
        }
        public IConnectorRepository ConnectorRepository
        {
            get
            {
                return connectorRepository ??= new ConnectorRepository(context);
            }
        }

        public IBookingRepository BookingRepository
        {
            get
            {
                return bookingRepository ??= new BookingRepository(context);
            }
        }
        }
}
