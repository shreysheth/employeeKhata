using EmployeeKhata.Data.DTO.Salary;
using EmployeeKhata.Data.DTO._Common;
using EmployeeKhata.Infra.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeKhata.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalaryController : ControllerBase
    {
        private readonly ISalaryService _salaryService;

        public SalaryController(ISalaryService salaryService)
        {
            _salaryService = salaryService;
        }

        [HttpGet("/titles")]
        public IActionResult GetTitles()
        {
            try
            {
                List<GetTitlesDTO> titles = _salaryService.GetAllTitles();
                if (titles == null || titles.Count == 0) return NotFound(new ApiResponse<GetTitlesDTO>() { Data=null, Message="No titles found in the database.", Success=true});
                return Ok(new ApiResponse<List<GetTitlesDTO>>() { Data=titles, Message="Title list generated successfully", Success=true});
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<GetTitlesDTO>() { Data = null, Message = $"Error generating title list: {ex.Message}", Success = false });
            }
        }
    }
}
