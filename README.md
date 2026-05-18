# FABRIC Platform

**Stack**: Angular 17 · ASP.NET Core 8 · PostgreSQL · TypeScript / C#

---

## البنية

```
fabric-dotnet/
├── backend/               ← ASP.NET Core 8 Web API
│   ├── src/
│   │   ├── Controllers/   Auth, Users, Projects, Tasks, Admin, Customer
│   │   ├── Data/          AppDbContext + DbSeeder
│   │   ├── Models/        جميع النماذج
│   │   ├── Services/      Auth, User, Project, Task, Customer
│   │   ├── DTOs/          Request/Response objects
│   │   └── Program.cs
│   ├── Dockerfile
│   └── railway.json
│
├── frontend/              ← Angular 17
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/      Auth, API, Guards, Interceptors
│   │   │   ├── shared/    AppLayout (HUMAIN theme)
│   │   │   └── features/  Auth, Dashboard, Projects, Admin, Customer
│   │   └── styles/        tokens.css (HUMAIN) + globals.css
│   ├── Dockerfile
│   └── railway.json
│
├── docker-compose.yml
└── README.md
```

---

## تشغيل محلي

```bash
docker compose up --build
```

- Frontend:  http://localhost
- Backend:   http://localhost:8080
- Swagger:   http://localhost:8080/swagger

**Login افتراضي**: admin@fabric.ai / Admin@123

---

## رفع على GitHub + Railway

### 1 — GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

---

### 2 — Railway: قاعدة البيانات

1. اذهب إلى [railway.app](https://railway.app) وسجل دخول
2. **New Project** ← **Deploy from GitHub repo** ← اختر الريبو
3. في المشروع اضغط **+ New** ← **Database** ← **Add PostgreSQL**
4. Railway يسوي قاعدة البيانات تلقائياً وتلاقي متغير `DATABASE_URL` جاهز

---

### 3 — Railway: Backend

1. في نفس المشروع اضغط **+ New** ← **GitHub Repo**
2. اختر نفس الريبو
3. في إعدادات الـ service حط **Root Directory**: `backend`
4. اذهب لـ **Variables** وأضف:

```
JWT_SECRET          = (شغّل: openssl rand -hex 32)
ALLOWED_ORIGINS     = https://YOUR-FRONTEND.up.railway.app
ASPNETCORE_URLS     = http://+:8080
```

> `DATABASE_URL` يجي تلقائي من PostgreSQL plugin — ما تحتاج تحطه يدوياً

5. Railway يقرأ `railway.json` ← يبني الـ Dockerfile ← يشغل migrations تلقائياً عند البدء

---

### 4 — Railway: Frontend

1. **+ New** ← **GitHub Repo** ← نفس الريبو
2. **Root Directory**: `frontend`
3. ما تحتاج أي متغيرات — nginx يوجه `/api` للـ backend تلقائياً

---

### 5 — ربط Frontend بـ Backend

بعد ما يتعمل الـ backend service، خذ الـ URL حقه (مثل `https://backend-xxx.up.railway.app`)

اذهب لـ frontend service ← **Variables** وأضف:
```
BACKEND_URL = https://backend-xxx.up.railway.app
```

---

## API Routes

| Method | Route | الوصف |
|---|---|---|
| POST | `/api/auth/login` | تسجيل دخول |
| POST | `/api/auth/customer/login` | دخول العميل |
| GET  | `/api/auth/me` | المستخدم الحالي |
| GET  | `/api/users` | قائمة المستخدمين |
| POST | `/api/users` | إنشاء مستخدم |
| GET  | `/api/projects` | قائمة المشاريع |
| POST | `/api/projects` | إنشاء مشروع |
| GET  | `/api/projects/:id/tasks` | مهام المشروع |
| POST | `/api/projects/:id/tasks/:id/annotate` | تسليم annotation |
| GET  | `/api/admin/overview` | إحصائيات |
| GET  | `/api/admin/customers` | قائمة العملاء |
| GET  | `/api/customer/projects` | مشاريع العميل |

---

## Design System

الثيم كامل في `frontend/src/styles/tokens.css`

```css
--humain-brand: #009688
--humain-glass-bg: rgba(255,255,255,0.85)
--humain-shadow-brand: 0 2px 12px rgba(0,150,136,0.314)
```

Classes جاهزة: `.glass` `.card` `.btn-brand` `.pill-success` `.pill-warning` `.pill-error`
