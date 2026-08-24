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
| Payment gateway | Enabled (Stripe + demo fallback) |

## Production

| Layer | URL |
|-------|-----|
| Frontend | https://edulms-school.vercel.app |
| Backend API | https://edulms-api.onrender.com |
| API base (`v1`) | https://edulms-api.onrender.com/api/v1 |
| Login | https://edulms-school.vercel.app/login |

Demo accounts (password for all: `Password123!`):

| Email | Password | Role |
|-------|----------|------|
| `admin@demo-academy.test` | `Password123!` | Company admin |
| `instructor@demo-academy.test` | `Password123!` | Instructor |
| `student@demo-academy.test` | `Password123!` | Student |
| `superadmin@lms.test` | `Password123!` | Super admin |

> **Free-tier notes**
> - **Render** (API): may cold-start (~30–60s) on the first request after idle — wakes automatically.
> - **Supabase** (DB): may **pause** after ~1 week of inactivity — does **not** auto-wake. Resume manually (steps below). Symptoms: login fails / “ไม่สามารถโหลดคอร์สได้” / API `QueryException`.

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
| Backend | [Render](https://edulms-api.onrender.com) | Docker service `edulms-api`, rootDir `backend/` |
| Source | [GitHub](https://github.com/Thanitasjc/edulms-school) | `Thanitasjc` |
| Database | Supabase Postgres | `thanitabackup01@gmail.com` → Project Settings → Database |

### Vercel env (frontend)

```
NEXT_PUBLIC_API_URL=https://edulms-api.onrender.com/api/v1
NEXT_PUBLIC_APP_URL=https://edulms-school.vercel.app
```

Browsers use same-origin `/api-proxy/v1` (Next rewrite → Render) to avoid mobile CORS issues.

### Supabase project (created)

| Field | Value |
|-------|--------|
| Org | [thanitabackup01@gmail.com's Org](https://supabase.com/dashboard/org/yfbmelkpvgnoytubayse) |
| Project | `edulms` |
| Ref | `ynktwqalscgmbxbqboyz` |
| API URL | `https://ynktwqalscgmbxbqboyz.supabase.co` |
| Region | Southeast Asia (Singapore) `ap-southeast-1` |
| Status | Healthy |

Dashboard: https://supabase.com/dashboard/project/ynktwqalscgmbxbqboyz

### Resume paused Supabase (เมื่อเว็บเข้าไม่ได้)

Free projects pause when idle. Login and courses will fail until you resume.

1. Sign in to Supabase with `thanitabackup01@gmail.com`
2. Open project **edulms**:  
   https://supabase.com/dashboard/project/ynktwqalscgmbxbqboyz
3. If you see **“Project edulms is paused”**, click **Resume project**
4. Confirm with **Resume** in the dialog
5. Wait until status shows restored / healthy (~1–2 minutes) — look for **“Restoration complete!”**
6. Retry the site: https://edulms-school.vercel.app/login  
   (If Render was also asleep, the first API call may take ~30–60s.)

To avoid pauses: upgrade the project to **Pro**, or open the dashboard / use the site regularly.

### Supabase → Laravel `.env`

Use **Session pooler** if your network is IPv4-only (common on Windows):

```
DB_CONNECTION=pgsql
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres.ynktwqalscgmbxbqboyz
DB_PASSWORD=<paste-from-Connect-modal>
DB_SSLMODE=require
FRONTEND_URL=https://edulms-school.vercel.app
CORS_ALLOWED_ORIGINS=https://edulms-school.vercel.app
```

Or Direct host: `db.ynktwqalscgmbxbqboyz.supabase.co` (IPv6).

Then on the API host: `php artisan migrate --seed`.

### Payment (Stripe)

Checkout creates a payment session for paid courses. Free courses still enroll instantly.

```
PAYMENT_DRIVER=stripe
PAYMENT_CURRENCY=thb
FRONTEND_URL=https://edulms-school.vercel.app
STRIPE_SECRET=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Webhook endpoint: `POST /api/v1/payments/webhook/stripe`  
If `STRIPE_SECRET` is empty, the API falls back to a **demo pay page** at `/checkout/pay/{uuid}` (no real charge).

## Next Feature Priority

1. Lesson module / notifications / reports
2. Payment admin UI / refunds / receipts
