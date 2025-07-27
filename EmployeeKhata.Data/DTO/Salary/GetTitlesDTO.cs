using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmployeeKhata.Data.DTO.Salary
{
    public class GetTitlesDTO
    {
        public string Title { get; set; }
        public int MinSalaryAmount { get; set; }
        public int MaxSalaryAmount { get; set; }
    }
}
