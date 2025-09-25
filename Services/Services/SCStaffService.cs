using Common;
using Common.DTOs.ProfileStaffDto;
using Mapster;
using Microsoft.EntityFrameworkCore;
using Repositories.IUnitOfWork;
using ServiceLayer.Base;
using Services.Base;
using Services.IServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Services
{
    public class SCStaffService(IUnitOfWork unitOfWork) : ISCStaffService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        public  async Task<IServiceResult> GetById(Guid StaffId)
        {
            var staff = await _unitOfWork.SCStaffRepository.GetByIdAsync(
                predicate: s => s.Id == StaffId,
                include : s => s.Include(s => s.UserAccountNavigation),
                asNoTracking: true// lấy ra để xem là true và create giống thế 
                );
            if (staff == null)
            {
                return new ServiceResult
                    (
                       Const.FAIL_READ_CODE, "Can not find staff"
                    );
            }
            else
            {
                var staffDto = new StaffViewDto();
                staff.Adapt(staffDto);
                return new ServiceResult
                 (
                    Const.SUCCESS_READ_CODE,
                    Const.SUCCESS_READ_MSG,
                    staffDto
                 );

            }
            }
    }
}
