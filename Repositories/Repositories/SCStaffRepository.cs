using Repositories.Base;
using Repositories.Data;
using Repositories.IRepositories;
using Repositories.Models;

namespace Repositories.Repositories
{
    public class SCStaffRepository(EVCSMSContext context) : GenericRepository<SCStaff>(context), ISCStaffRepository
    {
    }
}
