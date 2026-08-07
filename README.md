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

## Next Feature Priority

1. Payment gateway (checkout currently enrolls without charge)
2. Lesson module (standalone) if curriculum outgrows JSON on course
3. Notifications / reports
