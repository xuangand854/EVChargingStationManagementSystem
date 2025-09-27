using Repositories.Base;
using Repositories.Data;
using Repositories.IRepositories;
using Repositories.Models;

namespace Repositories.Repositories
{
    public class VehicleModelRepository (EVCSMSContext context) : GenericRepository<VehicleModel>(context), IVehicleModelRepository
    {
    }
}
