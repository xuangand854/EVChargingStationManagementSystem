using Services.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.IServices
{
    public interface ISCStaffService
    {
        Task <IServiceResult> GetById(Guid id);

    }
}
