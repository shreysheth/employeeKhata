using EmployeeKhata.Data.DTO.Salary;
using EmployeeKhata.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmployeeKhata.Infra.Interfaces
{
    public interface ISalaryService
    {
        public List<GetTitlesDTO> GetAllTitles();
    }
}
