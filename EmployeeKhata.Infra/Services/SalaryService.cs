using EmployeeKhata.Data.DTO.Salary;
using EmployeeKhata.Data.Entities;
using EmployeeKhata.Infra.Db;
using EmployeeKhata.Infra.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmployeeKhata.Infra.Services
{
    public class SalaryService : ISalaryService
    {
        private readonly DBContext _dbContext;
        public SalaryService(DBContext dbContext)
        {
            _dbContext = dbContext;
        }
        public List<GetTitlesDTO> GetAllTitles()
        {
            var salaries = _dbContext.Salaries.GroupBy(x=> x.Title).Select(x=> new GetTitlesDTO()
            {
                Title = x.Key,
                MaxSalaryAmount = x.Max(s=>s.SalaryAmount),
                MinSalaryAmount = x.Min(s=>s.SalaryAmount)
            }).ToList();

            return salaries;
        }
    }
}
