# SalaryHQ — Salary Management Tool

A full-stack salary management tool for HR managers. Manage 10,000+ employees, view salary insights by country and job title, and track organisation-wide payroll from a clean dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, shadcn/ui, TanStack Query, Recharts |
| Backend | Fastify, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 |
| Deployment | Docker Compose |

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for the Docker path)
- Node.js 22+ and npm 10+ (for local dev)

---

## Quick Start — Docker (recommended)

This runs the entire stack (Postgres + backend + frontend) with a single command.

**1. Clone the repo**

```bash
git clone https://github.com/Suyash991/salary-management.git
cd salary-management
```

**2. Start all services**

```bash
docker compose up --build -d
```

**3. Seed the database with 10,000 employees**

```bash
cd backend
npm install
npm run db:seed
```

**4. Open the app**

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| Swagger Docs | http://localhost:3001/docs |

**Stop everything**

```bash
docker compose down
```

---

## Local Development Setup

Run the backend and frontend separately for hot-reload during development.

### 1. Start Postgres via Docker

```bash
docker compose up postgres -d
```

> Postgres is exposed on port **5433** to avoid conflicts with any local Postgres instance.

### 2. Backend

```bash
cd backend
npm install
```

Create a `.env` file (already included as `.env.example`):

```env
DATABASE_URL="postgresql://salary_user:salary_pass@localhost:5433/salary_db"
PORT=3001
NODE_ENV=development
```

Run migrations and seed:

```bash
npm run db:migrate     # apply migrations
npm run db:seed        # seed 10,000 employees (~1s)
```

Start the dev server:

```bash
npm run dev
```

Backend runs at **http://localhost:3001**.

### 3. Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start the dev server:

```bash
npm run dev
```

Frontend runs at **http://localhost:3000**.

---

## Seed Script

The seed script generates 10,000 realistic employees using `first_names.txt` and `last_names.txt`. It uses batched inserts (500 records per batch) for performance — typically completes in ~1 second.

```bash
cd backend
npm run db:seed
```

The script is **idempotent** — re-running it clears existing data and re-seeds fresh.

---

## Running Tests

Unit tests use [Vitest](https://vitest.dev/) with mocked Prisma — no database required.

```bash
cd backend
npm test
```

Tests cover:
- Employee CRUD (list, get, create, update, delete)
- Pagination and filter logic
- Duplicate email detection
- All analytics endpoints (salary by country, by job title, dashboard)

---

## API Reference

Full interactive docs available at **http://localhost:3001/docs** (Swagger UI).

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/employees` | List employees (pagination, search, filters, sort) |
| POST | `/api/employees` | Create employee |
| GET | `/api/employees/:id` | Get employee by ID |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |
| GET | `/api/employees/meta/filters` | Get distinct countries, departments, job titles |
| GET | `/api/analytics/salary-by-country` | Min/avg/max salary per country |
| GET | `/api/analytics/salary-by-job-title` | Avg salary per job title (filterable by country) |
| GET | `/api/analytics/dashboard` | Overview metrics for the dashboard |

---

## Project Structure

```
salary-management/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   ├── seed.ts             # Seed script (10k employees)
│   │   ├── migrations/         # SQL migration history
│   │   ├── first_names.txt
│   │   └── last_names.txt
│   ├── src/
│   │   ├── index.ts            # Fastify server entry
│   │   ├── routes/
│   │   │   ├── employees.ts    # CRUD routes
│   │   │   └── analytics.ts    # Insights routes
│   │   └── utils/prisma.ts     # Prisma singleton
│   └── tests/                  # Vitest unit tests
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx            # Dashboard
│   │   ├── employees/page.tsx  # Employee management
│   │   └── analytics/page.tsx  # Salary insights
│   ├── components/
│   │   ├── employees/          # Table, Form, Filters, Pagination
│   │   ├── analytics/          # Charts and tables
│   │   └── layout/             # Sidebar
│   └── lib/
│       ├── api.ts              # Axios API client
│       ├── types.ts            # Shared TypeScript types
│       └── format.ts           # Currency and date formatters
│
└── docker-compose.yml
```
