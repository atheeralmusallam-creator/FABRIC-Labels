# FABRIC Platform — .NET Stack

> AI-Assisted Human Evaluation Platform  
> **Stack**: Angular 17 · ASP.NET Core 8 · SQL Server · TypeScript/C#

---

## Architecture

```
fabric-dotnet/
├── backend/          ← ASP.NET Core 8 Web API
│   ├── src/
│   │   ├── Controllers/     Auth, Users, Projects, Tasks, Admin, Customer
│   │   ├── Data/            AppDbContext + DbSeeder
│   │   ├── Models/          All domain models
│   │   ├── Services/        Auth, User, Project, Task, Customer
│   │   ├── DTOs/            Request/Response objects
│   │   ├── Program.cs       Entry point (DI, JWT, CORS, EF)
│   │   └── appsettings.json Config (override via env vars in Railway)
│   ├── Dockerfile
│   └── railway.json
│
├── frontend/         ← Angular 17 (standalone components + signals)
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/        Auth service, API service, Guards, Interceptors
│   │   │   ├── shared/      AppLayout (sidebar with HUMAIN theme)
│   │   │   └── features/    Auth, Dashboard, Projects, Admin, Customer
│   │   ├── environments/
│   │   └── styles/          tokens.css (HUMAIN design system) + globals.css
│   ├── Dockerfile
│   └── railway.json
│
├── docker-compose.yml   ← Full local dev (SQL Server + backend + frontend)
└── README.md
```

---

## Local Development

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8)
- [Node.js 20+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Option A — Docker Compose (easiest)

```bash
git clone https://github.com/YOUR_ORG/fabric-platform.git
cd fabric-platform
docker compose up --build
```

- Frontend: http://localhost
- Backend API: http://localhost:8080
- Swagger: http://localhost:8080/swagger

### Option B — Manual

**1. Start SQL Server (Docker)**
```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=Dev@Password123" \
  -p 1433:1433 mcr.microsoft.com/mssql/server:2022-latest
```

**2. Backend**
```bash
cd backend/src
dotnet run
# API starts at http://localhost:8080
# Auto-runs migrations + seeds admin@fabric.ai / Admin@123
```

**3. Frontend**
```bash
cd frontend
npm install
npm start
# http://localhost:4200  (proxies /api → :8080)
```

---

## Deploy to Railway

### 1 — Push to GitHub
```bash
git init && git add . && git commit -m "Initial .NET stack"
git remote add origin https://github.com/YOUR_ORG/fabric-platform.git
git push -u origin main
```

### 2 — Add SQL Server plugin in Railway
New Project → + Database → SQL Server → copy connection string

### 3 — Deploy Backend
+ New → GitHub Repo → Root Directory: `backend`

Environment variables to set:

| Variable | Value |
|---|---|
| `ConnectionStrings__DefaultConnection` | *(Railway SQL Server conn string)* |
| `JWT_SECRET` | `openssl rand -hex 32` |
| `ALLOWED_ORIGINS` | `https://YOUR-FRONTEND.up.railway.app` |
| `ASPNETCORE_URLS` | `http://+:8080` |
| `OPENAI_API_KEY` | optional |
| `ANTHROPIC_API_KEY` | optional |

Railway reads `railway.json` → builds Dockerfile → runs EF migrations on start.

### 4 — Deploy Frontend
+ New → GitHub Repo → Root Directory: `frontend`

No extra env vars needed — nginx proxies `/api` to the backend service automatically.

---

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Internal login |
| POST | `/api/auth/customer/login` | Customer login |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/change-password` | Change password |
| GET | `/api/users` | List users |
| POST | `/api/users` | Create user |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id/tasks` | List tasks |
| POST | `/api/projects/:id/tasks/:id/annotate` | Submit annotation |
| GET | `/api/admin/overview` | Platform stats |
| GET | `/api/admin/customers` | List customers |
| GET | `/api/customer/projects` | Customer projects |
| POST | `/api/customer/projects/:id/upload` | Upload file |

Swagger available at `/swagger` in development.

---

## Design System (HUMAIN tokens)

All colors/shadows/glass come from `frontend/src/styles/tokens.css`.  
Key tokens:
- `--humain-brand: #009688`
- `--humain-glass-bg: rgba(255,255,255,0.85)`
- `--humain-shadow-brand: 0 2px 12px rgba(0,150,136,0.314)`

Global classes: `.glass` `.card` `.btn-brand` `.pill-success` `.pill-warning` `.pill-error`

---

## Migration Map (old → new)

| Before | After |
|---|---|
| `prisma/schema.prisma` | `Models/Models.cs` + EF Core |
| `app/api/**/route.ts` | `Controllers/*.cs` |
| `hooks/use-*` | Angular services + signals |
| Next.js pages | Angular standalone components |
| Tailwind + tokens.css | tokens.css + globals.css |
| Vercel/Railway Next | Railway Docker (nginx + ASP.NET Core) |
