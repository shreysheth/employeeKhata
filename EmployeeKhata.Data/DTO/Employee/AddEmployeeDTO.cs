using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmployeeKhata.Data.DTO.Employee
{
    public class AddEmployeeDTO
    {
        public string EmployeeName { get; set; }
        public string SSN { get; set; }
        public DateTime DOB { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Zip { get; set; }
        public string Phone { get; set; }
        public DateTime JoinDate { get; set; }
        public string Title { get; set; }
        public int SalaryAmount { get; set; }
    }
}
