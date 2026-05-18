# FABRIC Platform v2.0 — .NET Stack

Evaluation & Annotation Platform · ASP.NET Core + Angular + PostgreSQL

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 17 |
| Backend | ASP.NET Core 8 |
| Database | PostgreSQL 14+ (Entity Framework Core) |
| Language | TypeScript (frontend) / C# (backend) |
| Deploy | Railway (Nixpacks) |

## Project Structure

```
fabric/
├── backend/          # ASP.NET Core 8 API
│   └── Fabric.API/
├── frontend/         # Angular 17 SPA
├── railway.json      # Railway monorepo config
└── README.md
```

## Local Development

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- PostgreSQL 14+

### Backend
```bash
cd backend/Fabric.API
cp appsettings.example.json appsettings.Development.json
# Edit connection string + API keys
dotnet ef database update
dotnet run
# API running at http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
cp src/environments/environment.example.ts src/environments/environment.ts
npm start
# App running at http://localhost:4200
```

## Railway Deployment

1. Push to GitHub
2. In Railway: **New Project → Deploy from GitHub repo**
3. Railway auto-detects both services via `railway.json`
4. Add environment variables (see below)
5. Deploy

### Required Environment Variables

#### Backend service
```
DATABASE_URL=postgresql://user:pass@host:5432/fabric
JWT_SECRET=your-secret-min-32-chars
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
ASPNETCORE_ENVIRONMENT=Production
```

#### Frontend service
```
API_URL=https://your-backend.railway.app
```

## API Endpoints

| Domain | Base Path |
|--------|-----------|
| Customer portal | `/api/customer/` |
| Internal platform | `/api/internal/` |
| Admin | `/api/admin/` |
| General | `/api/` |

## User Roles
`Admin` · `Manager` · `Reviewer` · `Annotator` · `Customer`
