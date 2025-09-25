using Repositories.Base;
using Repositories.Data;
using Repositories.IRepository;
using Repositories.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Repository
{
    public class SCStaffRepository : GenericRepository<SCStaff>, ISCStaffRepository
    {
        public SCStaffRepository(EVCSMSContext context) : base(context)
        {
        }
    }
}
