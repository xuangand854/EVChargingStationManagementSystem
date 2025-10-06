using Infrastructure.Base;
using Infrastructure.Data;
using Infrastructure.IRepositories;
using Infrastructure.Models;

namespace Infrastructure.Repositories
{
    public class EVDriverRepository(EVCSMSContext context)
        : GenericRepository<EVDriver>(context), IEVDriverRepository
    {
    }
}
