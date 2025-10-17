using Infrastructure.Base;
using Infrastructure.Data;
using Infrastructure.IRepositories;
using Infrastructure.Models;

namespace Infrastructure.Repositories
{
    public class SystemConfigurationRepository(EVCSMSContext context) : GenericRepository<SystemConfiguration> (context), ISystemConfigurationRepository
    {
    }
}
