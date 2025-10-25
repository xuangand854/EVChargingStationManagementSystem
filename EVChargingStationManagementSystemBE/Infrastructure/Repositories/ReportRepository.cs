﻿using Infrastructure.Base;
using Infrastructure.Data;
using Infrastructure.IRepositories;
using Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
   public class ReportRepository(EVCSMSContext context) : GenericRepository<Report>(context), IReportRepository
    {
    }
}
