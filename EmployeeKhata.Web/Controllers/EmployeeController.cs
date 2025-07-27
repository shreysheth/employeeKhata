using EmployeeKhata.Data.DTO._Common;
using EmployeeKhata.Data.DTO.Employee;
using EmployeeKhata.Infra.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeKhata.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;
        public EmployeeController(IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        [HttpGet("/employees")]
        public IActionResult GetAllEmployees()
        {
            try
            {
                List<EmployeeOpsDTO> employees = _employeeService.GetAllEmployees();
                if (employees == null || employees.Count == 0) 
                { 
                    return NotFound(new ApiResponse<EmployeeOpsDTO>() { Data = null, Message = "No Employee found in the database", Success=true});
                }
                return Ok(new ApiResponse<List<EmployeeOpsDTO>>() { Data = employees, Message = "Employee list generated successfully", Success=true});
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<EmployeeOpsDTO>() { Data = null, Success = false, Message = $"Error generating employee list: {ex.Message}"});
            }
        }

        [HttpPost("/add-employee")]
        public async Task<IActionResult> AddEmployee(AddEmployeeDTO employee)
        {
            try
            {
                AddEmployeeOutputDTO newEmployee = await _employeeService.AddEmployee(employee);
                if (newEmployee.NewEmployeeID <= 0)
                {
                    return BadRequest(new ApiResponse<AddEmployeeOutputDTO>() { Data = null, Message = newEmployee.Message, Success = false });
                }
                return Ok(new ApiResponse<AddEmployeeOutputDTO>() { Data = newEmployee, Message = "Employee added successfully", Success = true });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<AddEmployeeOutputDTO>() { Data = null, Message = $"Error adding employee: {ex.Message}", Success = false });
                throw;
            }
        }
    }
}
