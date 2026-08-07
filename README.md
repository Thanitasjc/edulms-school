# EduLMS — Enterprise Learning Management System

Production-oriented modular LMS built as:

- **Backend:** Laravel 12 API (`backend/`)
- **Frontend:** Next.js 16 App Router (`frontend/`)

## Architecture

- Modular Monolith on Laravel (`modules/*`)
- Clean Architecture layers: Domain / Application / Infrastructure / Http
- Repository + Service patterns
- Multi-tenant via `company_id` + `X-Company-Id`
- Module enable/disable via Module Registry
- Auth: Laravel Sanctum
- Permissions: Spatie Laravel Permission
- Audit: Spatie Activity Log

## Modules

| Module | Status |
|--------|--------|
| Auth / Company / User / Role / Setting | Enabled |
| Course (+ reviews) | Enabled |
| Instructor | Enabled |
| Enrollment / Progress / My Learning | Enabled |
| CMS (Hero / Categories) | Enabled |
| Quiz | Enabled |
| Certificate | Enabled |
| Media (central upload library) | Enabled |
| CRM (Contact leads) | Enabled |
| Blog | Enabled |
| Lesson (standalone) / Knowledge / Notification / Report | Registered, disabled |
| Payment gateway | Deferred |

## Quick Start

### Backend

```bash
cd backend
composer install
cp .env.example .env   # if needed
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

API base: `http://127.0.0.1:8000/api/v1`

Seeded accounts (password `Password123!`):

| Email | Role |
|-------|------|
| `superadmin@lms.test` | Super admin |
| `admin@demo-academy.test` | Company admin |
| `instructor@demo-academy.test` | Instructor (course / quiz / media) |
| `student@demo-academy.test` | Student (public learning) |

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

App: `http://localhost:3000`

## API Examples

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@demo-academy.test",
  "password": "Password123!",
  "device_name": "web"
}
```

```http
GET /api/v1/bootstrap
Authorization: Bearer {token}
X-Company-Id: {companyId}
```

Useful public endpoints:

- `GET /api/v1/public/courses`
- `GET /api/v1/public/courses/{slug}/quizzes`
- `POST /api/v1/public/quizzes/{id}/attempts` (auth)
- `GET /api/v1/public/certificates/{code}`
- `POST /api/v1/public/leads`
- `GET /api/v1/public/blog`

## Frontend Structure

- `(public)` — catalog, course player, My Learning, quizzes, certificates, blog, contact
- `(auth)` — login / register
- `(app)` — admin shell (`/manage/*` for courses, instructors, enrollments, quizzes, certificates, media, leads, blog, CMS)

## Roles

- **company_admin** — full tenant admin permissions
- **instructor** — courses, quizzes, media, enrollments view, blog authoring
- **student** — learner on the public site (My Learning, take quizzes, certificates); no admin panel access

## Deploy

| Layer | Service | Account / notes |
|-------|---------|-----------------|
| Frontend | [Vercel](https://edulms-school.vercel.app) | `39479@sjc.ac.th` — project `edulms-school`, root `frontend/` |
| Source | [GitHub](https://github.com/Thanitasjc/edulms-school) | `Thanitasjc` |
| Database | Supabase Postgres | Use account `thanitabackup01@gmail.com` → Project Settings → Database |
| API | Laravel host (not Vercel) | Point `DB_*` at Supabase; set `FRONTEND_URL` + CORS to the Vercel domain |

### Vercel env (frontend)

```
NEXT_PUBLIC_API_URL=https://YOUR-API-HOST/api/v1
NEXT_PUBLIC_APP_URL=https://edulms-school.vercel.app
```

### Supabase → Laravel `.env`

```
DB_CONNECTION=pgsql
DB_HOST=db.<PROJECT_REF>.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=<DATABASE_PASSWORD>
DB_SSLMODE=require
FRONTEND_URL=https://edulms-school.vercel.app
CORS_ALLOWED_ORIGINS=https://edulms-school.vercel.app
```

Then on the API host: `php artisan migrate --seed`.

## Next Feature Priority

1. Host Laravel API + connect Supabase Postgres
2. Payment gateway (checkout currently enrolls without charge)
3. Lesson module (standalone) if curriculum outgrows JSON on course
4. Notifications / reports
