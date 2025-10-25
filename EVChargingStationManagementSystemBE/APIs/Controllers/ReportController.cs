using BusinessLogic.IServices;
using Common;
using Common.DTOs.ReportDto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportController(IReportService reportService)
        {
            _reportService = reportService;
        }

        //  LẤY DANH SÁCH BÁO CÁO 
        // GET: api/report (Admin, Staff)
        [HttpGet]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetAllReports()
        {
            var result = await _reportService.GetAllAsync();

            if (result.Status == Const.SUCCESS_READ_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        // ===================== LẤY CHI TIẾT BÁO CÁO =====================
        // GET: api/report/{id} (Admin, Staff)
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetReportById([FromRoute] Guid id)
        {
            var result = await _reportService.GetByIdAsync(id);

            if (result.Status == Const.SUCCESS_READ_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        // ===================== TẠO BÁO CÁO MỚI =====================
        // POST: api/report (EVDriver)
        [HttpPost]
        [Authorize(Roles = "EVDriver")]
        public async Task<IActionResult> CreateReport([FromBody] ReportCreateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _reportService.CreateAsync(dto);

            if (result.Status == Const.SUCCESS_CREATE_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.FAIL_CREATE_CODE)
                return Conflict(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        // ===================== CẬP NHẬT BÁO CÁO =====================
        // PUT: api/report/{id} (Admin, Staff)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> UpdateReport([FromRoute] Guid id, [FromBody] ReportUpdateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _reportService.UpdateAsync(id, dto);

            if (result.Status == Const.SUCCESS_UPDATE_CODE)
                return Ok(new { data = result.Data, message = result.Message });

            if (result.Status == Const.FAIL_UPDATE_CODE)
                return Conflict(new { message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }

        // ===================== XÓA (SOFT DELETE) BÁO CÁO =====================
        // DELETE: api/report/{id} (Admin)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteReport([FromRoute] Guid id)
        {
            var result = await _reportService.DeleteAsync(id);

            if (result.Status == Const.SUCCESS_DELETE_CODE)
                return Ok(new { message = result.Message });

            if (result.Status == Const.WARNING_NO_DATA_CODE)
                return NotFound(new { message = result.Message });

            if (result.Status == Const.FAIL_DELETE_CODE)
                return Conflict(new { message = result.Message });

            return StatusCode(500, new { message = result.Message });
        }
    }
}
