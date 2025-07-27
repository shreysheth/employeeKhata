using EmployeeKhata.Data.DTO.Employee;
using EmployeeKhata.Data.DTO._Common;
using EmployeeKhata.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmployeeKhata.Infra.Interfaces
{
    public interface IEmployeeService
    {
        public List<EmployeeOpsDTO> GetAllEmployees();
        public Task<AddEmployeeOutputDTO> AddEmployee(AddEmployeeDTO employee);
    }
}
