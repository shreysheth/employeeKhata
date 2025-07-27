using EmployeeKhata.Data.DTO._Common;
using EmployeeKhata.Data.DTO.Employee;
using EmployeeKhata.Data.Entities;
using EmployeeKhata.Infra.Db;
using EmployeeKhata.Infra.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace EmployeeKhata.Infra.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly DBContext _dbContext;
        public EmployeeService(DBContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<AddEmployeeOutputDTO> AddEmployee(AddEmployeeDTO employee)
        {
            if(employee == null) throw new ArgumentNullException(nameof(employee));

            string query = "EXEC AddEmployee @EmployeeName, @SSN, @DOB, @Address, @City, @State, @Zip, @Phone, @JoinDate, @Title, @SalaryAmount, @NewEmployeeID OUTPUT, @Message OUTPUT";
            SqlParameter paramNewEmployeeID = new SqlParameter("@NewEmployeeId", System.Data.SqlDbType.Int) { Direction = System.Data.ParameterDirection.Output};
            SqlParameter paramMessage = new SqlParameter("@Message", System.Data.SqlDbType.VarChar, 255) { Direction = System.Data.ParameterDirection.Output};
            
            await _dbContext.Database.ExecuteSqlRawAsync(
                query, 
                new SqlParameter("@EmployeeName", employee.EmployeeName),
                new SqlParameter("@SSN", employee.SSN),
                new SqlParameter("@DOB", employee.DOB),
                new SqlParameter("@Address", employee.Address),
                new SqlParameter("@City", employee.City),
                new SqlParameter("@State", employee.State),
                new SqlParameter("@Zip", employee.Zip),
                new SqlParameter("@Phone", employee.Phone),
                new SqlParameter("@JoinDate", employee.JoinDate),
                new SqlParameter("@Title", employee.Title),
                new SqlParameter("@SalaryAmount", employee.SalaryAmount),
                paramNewEmployeeID,
                paramMessage
            );

            AddEmployeeOutputDTO newEmployeeOutput = new AddEmployeeOutputDTO()
            {
                Message = paramMessage.Value == DBNull.Value ? "" : (string)paramMessage.Value,
                NewEmployeeID = paramNewEmployeeID.Value == DBNull.Value ? 0 : (int)paramNewEmployeeID.Value
            };
            return newEmployeeOutput;           
        }

        public List<EmployeeOpsDTO> GetAllEmployees()
        {
            List<EmployeeOpsDTO> employees = _dbContext.Employees.Join(_dbContext.Salaries, employee => employee.EmployeeId, salary=>salary.EmployeeId, (employee, salary)=> new EmployeeOpsDTO()
            {
                EmployeeName = employee.EmployeeName,
                SSN = employee.SSN,
                DOB = employee.DOB,
                Address = employee.Address,
                City = employee.City,
                State = employee.State,
                Zip = employee.Zip,
                Phone = employee.Phone,
                JoinDate = employee.JoinDate,
                ExitDate = employee.ExitDate,
                Title = salary.Title,
                SalaryAmount = salary.SalaryAmount
            }).ToList();

            return employees;
        }
    }
}
