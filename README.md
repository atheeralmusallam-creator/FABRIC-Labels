# FABRIC Platform v2.0

## Structure
```
backend/   → ASP.NET Core 8  → Railway service: Dockerfile path = backend/Dockerfile
frontend/  → Angular 17      → Railway service: Dockerfile path = frontend/Dockerfile
```

## Railway setup
Each service: Settings → Builder → Dockerfile → set path above.

## Backend env variables
```
DATABASE_URL=postgresql://...
JWT_SECRET=min-32-chars
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
AllowedOrigins=https://your-frontend.railway.app
```
