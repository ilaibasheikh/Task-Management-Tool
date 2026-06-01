# Task Management Tool

A fullstack task management system built with ASP.NET Core, React, Entity Framework Core, SQL Server, Serilog, xUnit, and SonarQube-ready configuration.

## Features

- User registration and login with ASP.NET Core Identity.
- JWT authentication and role-based authorization.
- Seeded roles: `Admin` and `User`.
- Seeded admin account: `admin@tasktool.local` / `Admin123!`.
- Task CRUD with title, description, status, priority, category, due date, and assigned user.
- User-specific task access for regular users.
- Admin-wide task visibility and assignment support.
- Dashboard counts for pending, in-progress, and completed tasks.
- Search and filter support for task lists.
- Global exception handling with consistent JSON errors.
- Serilog request, activity, and exception logging.
- EF Core SQL Server schema through migrations.
- xUnit service tests with EF Core InMemory.
- React frontend screens for auth, dashboard, task list, task detail, task create/edit, and profile.
- SonarQube project configuration for C# and JavaScript/TypeScript analysis.

## Project Structure

```text
Task Management Tool/
├─ BackEnd/
│  ├─ TaskManagement.Api/        ASP.NET Core Web API
│  └─ TaskManagement.Tests/      xUnit tests
├─ FrontEnd/                     React + Vite + TypeScript app
├─ TaskManagementTool.sln
├─ sonar-project.properties
└─ README.md
```

## Prerequisites

- .NET SDK 9.0 or newer
- SQL Server or SQL Server LocalDB
- Node.js 20 or newer
- npm
- Git
- Optional: SonarQube server and SonarScanner for .NET

## Backend Setup

From the repository root:

```powershell
dotnet restore TaskManagementTool.sln
```

Update the SQL Server connection string in:

```text
BackEnd/TaskManagement.Api/appsettings.json
```

Default development connection:

```json
"DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=TaskManagementToolDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
```

Create the database:

```powershell
dotnet tool install --global dotnet-ef
dotnet ef database update --project BackEnd/TaskManagement.Api
```

The initial migration is already included. Create a new migration only after changing the EF model.

Run the API:

```powershell
dotnet run --project BackEnd/TaskManagement.Api
```

The API runs on the ports configured in:

```text
BackEnd/TaskManagement.Api/Properties/launchSettings.json
```

Default HTTP URL:

```text
http://localhost:5226
```

## Frontend Setup

From `FrontEnd`:

```powershell
npm install
```

Create a local environment file:

```powershell
copy .env.example .env
```

Run the React app:

```powershell
npm run dev
```

Default frontend URL:

```text
http://localhost:5173
```

## Authentication

Registration creates regular users with the `User` role.

The backend seeds an admin account on startup:

```text
Email: admin@tasktool.local
Password: Admin123!
```

Admins can view all tasks and assign tasks to other users by user id. Regular users can only view and manage tasks assigned to themselves.

## API Endpoints

Authentication:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

Tasks:

```text
GET    /api/tasks
GET    /api/tasks/counts
GET    /api/tasks/{id}
POST   /api/tasks
PUT    /api/tasks/{id}
DELETE /api/tasks/{id}
```

Task filter query parameters:

```text
search
status
priority
category
```

Status values:

```text
0 = Pending
1 = InProgress
2 = Completed
```

Priority values:

```text
0 = Low
1 = Medium
2 = High
3 = Critical
```

## Logging

Serilog is configured in `Program.cs` and `appsettings.json`.

Logs are written to:

```text
BackEnd/TaskManagement.Api/Logs/task-management-YYYYMMDD.log
```

The API logs:

- HTTP request activity.
- User registration and login.
- Task create, update, and delete events.
- Unhandled exceptions.

## Exception Handling

`ExceptionHandlingMiddleware` catches API exceptions and unhandled exceptions.

Expected errors return meaningful JSON messages. Unexpected errors are logged with Serilog and return a safe generic message to the client.

## Testing

Run backend tests:

```powershell
dotnet test TaskManagementTool.sln
```

Run tests with coverage for SonarQube:

```powershell
dotnet test TaskManagementTool.sln --collect:"XPlat Code Coverage" -- DataCollectionRunSettings.DataCollectors.DataCollector.Configuration.Format=opencover
```

Frontend quality checks:

```powershell
cd FrontEnd
npm run lint
npm run build
```

## SonarQube

Start or connect to a SonarQube server, then run:

```powershell
dotnet tool install --global dotnet-sonarscanner
dotnet sonarscanner begin /k:"task-management-tool" /d:sonar.host.url="http://localhost:9000" /d:sonar.token="<SONAR_TOKEN>"
dotnet build TaskManagementTool.sln
dotnet test TaskManagementTool.sln --collect:"XPlat Code Coverage" -- DataCollectionRunSettings.DataCollectors.DataCollector.Configuration.Format=opencover
dotnet sonarscanner end /d:sonar.token="<SONAR_TOKEN>"
```

The repository also includes `sonar-project.properties` for scanner-based JavaScript/TypeScript analysis configuration.

## Git Workflow

Recommended workflow:

```powershell
git checkout -b feature/task-management-api
git status
git add .
git commit -m "Initialize task management fullstack app"
```

Use feature branches for new work, pull requests for review, and small commits that group related backend, frontend, and test changes.


