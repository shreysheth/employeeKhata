# Employee Khata

A modular .NET Core 8 web application for managing employee data with a clean separation of concerns. It includes API, frontend, and SQL database integration.

## 🗂️ Project Structure

```

EmployeeKhata/
│
├── EmployeeKhata.Data/       # Model classes and DTOs
├── EmployeeKhata.Infra/      # EF Core logic and services
├── EmployeeKhata.Web/        # Web API controllers
│
├── EmployeeKhata.Frontend/   # index.html + script.js (API consumer)
├── EmployeeKhata.SQL/        # SQL Server DB creation scripts
│
├── .gitignore

````

## ⚙️ Tech Stack

- **.NET Core 8**
- **Entity Framework Core**
- **SQL Server**
- **Vanilla JavaScript and HTML (Frontend)**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/shreysheth/employeeKhata.git
cd employeeKhata
````

### 2. Open the Solution

* Launch **Visual Studio 2022+**
* Open the `.sln` file (should be located inside `EmployeeKhata.Web/` or root)

### 3. Setup the Database

* Open the `.sql` file from `EmployeeKhata.SQL/` in **SQL Server Management Studio (SSMS)**
* Run it to create and seed the database

### 4. Configure Connection String

In `appsettings.json` (under `EmployeeKhata.Web`), replace with your SQL Server details:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER;Database=EmployeeKhataDB;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=True"
}
```

### 5. Run the Application

* Set `EmployeeKhata.Web` as the startup project
* Hit **F5** or run via CLI:

```bash
cd EmployeeKhata.Web
dotnet run
```

### 6. Use the Frontend

* Navigate to `EmployeeKhata.Frontend/`
* Open `index.html` in your browser
* It will call the backend APIs using JavaScript

## 📝 Notes

* Make sure backend is running before opening `index.html`
* Update CORS in `Program.cs` if testing from different origins

## 📫 Contact / Contribute

Pull requests and issues are welcome!
⭐ the repo if you find it helpful.
