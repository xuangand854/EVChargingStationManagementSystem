using BusinessLogic.Base;
using Common.DTOs.AccountDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.IServices
{
    public  interface IAccountService
    {
          Task<IServiceResult> CreateStaffAccount(StaffAccountCreateDto request);
    }
}
