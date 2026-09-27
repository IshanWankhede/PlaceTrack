# Architecture Document — Placement Management & Analytics System

## 1. System Architecture Overview

```
┌──────────────────────────┐
│       React Frontend     │
│                          │
│  Dashboard               │
│  Students                │
│  Companies               │
│  Jobs                    │
│  Applications            │
│  Interviews              │
│  Placements              │
│  Analytics               │
└────────────┬─────────────┘
             │
       REST API / JSON
             │
             ▼
┌──────────────────────────┐
│      FastAPI Backend     │
│                          │
│  API Routes              │
│  Authentication          │
│  Validation              │
│  Business Logic          │
│  Analytics Queries       │
└────────────┬─────────────┘
             │
       SQLAlchemy ORM
             │
             ▼
┌──────────────────────────┐
│       PostgreSQL         │
│                          │
│ Departments              │
│ Students                 │
│ Skills / Student_Skills  │
│ Companies                │
│ Jobs / Job_Skills        │
│ Applications             │
│ Interviews               │
│ Placements               │
└──────────────────────────┘
```

Three-tier architecture:
- **Presentation Layer** — React SPA consuming a REST/JSON API
- **Application Layer** — FastAPI handling routing, auth, validation, and business logic (eligibility engine, analytics)
- **Data Layer** — PostgreSQL, accessed via SQLAlchemy ORM, with views/triggers for derived data and automation

---

## 2. Layered Backend Design

```
Router  →  Schema (Pydantic validation)  →  CRUD layer  →  SQLAlchemy Model  →  PostgreSQL
                        │
                        ▼
                 Services layer
        (eligibility.py, placement.py, analytics.py)
```

- **Routers**: thin — parse requests, call services/CRUD, return responses
- **Schemas**: Pydantic models for request/response validation, decoupled from ORM models
- **CRUD**: pure data-access functions per resource
- **Services**: business logic that spans multiple tables (eligibility checks, placement automation, analytics aggregation)
- **Models**: SQLAlchemy ORM classes mapped 1:1 to DB tables

---

## 3. Build Phases

### **Phase 1 — Foundation**
- Set up repo structure (frontend/backend split)
- PostgreSQL schema: `departments`, `students`, `skills`, `student_skills`
- FastAPI project skeleton: `config.py`, `database.py`, base models
- Auth (JWT login for placement-cell admins/staff)
- Basic CRUD APIs for Students
- React skeleton: routing, layouts, Login page, Dashboard shell

### **Phase 2 — Companies, Jobs & Skills Matching**
- `companies`, `jobs`, `job_skills` tables
- CRUD APIs for Companies and Jobs
- Job posting UI (create/edit/list)
- **Eligibility Engine v1**: CGPA + department + required-skills check
- "Eligible Students" endpoint per job

### **Phase 3 — Applications & Interviews**
- `applications` table with status lifecycle
- Student-facing "Apply" flow (only shown if eligible)
- `interviews` table — multi-round tracking (Technical, Aptitude, HR, etc.)
- Status update APIs + UI (Kanban-style or table view with `StatusBadge`)

### **Phase 4 — Placements & Automation**
- `placements` table
- **DB Trigger**: `application.status = 'SELECTED'` → auto-insert into `placements`
- Placement confirmation UI
- `placement_summary` view (student, department, company, role, package, date)

### **Phase 5 — Analytics & Dashboard**
- Analytics service layer: placement rate, average package by department, company selection counts, top package, above-average CGPA
- `/api/v1/analytics/*` endpoints backed by SQL views/aggregate queries
- React Analytics page with charts (bar/line/pie)
- Dashboard summary cards (`StatCard`)

### **Phase 6 — Hardening & Polish**
- Indexes on frequently filtered/joined columns (`student_id`, `job_id`, `company_id`, `status`)
- Transactions around multi-step writes (e.g., application status change + placement creation)
- Input validation edge cases, error handling, loading states
- Test suite (`pytest`) for students, jobs, applications
- Optional: Dockerize (frontend, backend, db services)

---

## 4. Eligibility Engine (Core Logic)

```
Student
   ↓
Check CGPA ≥ job.minimum_cgpa
   ↓
Check Department matches (if job restricts by department)
   ↓
Check all job.required_skills ⊆ student.skills
   ↓
Eligible ✅ / Not Eligible ❌
```

This logic lives in `app/services/eligibility.py` and is reused by:
- `GET /api/v1/jobs/{id}/eligible-students`
- The "Apply Now" gate shown in the student-facing Jobs UI

---

## 5. Analytics Data Flow

```
PostgreSQL (views/aggregate queries)
        │
        ▼
FastAPI /api/v1/analytics/*  (JSON)
        │
        ▼
React Analytics Dashboard (charts)
```

Principle: **aggregation happens in SQL**, not in React. The frontend only renders pre-computed JSON.

---

## 6. Deployment Architecture (Optional / Later Stage)

```
docker-compose.yml
├── frontend  → React (served via Vite build / nginx)
├── backend   → FastAPI (uvicorn/gunicorn)
└── db        → PostgreSQL (persistent volume)
```

Environment variables (`.env`) manage DB credentials, JWT secret, and API base URL across environments (local/staging/prod).

---

## 7. Key Architectural Decisions

| Decision | Rationale |
|---|---|
| Separate `schemas/` from `models/` | Decouples API contracts from DB structure; avoids leaking ORM internals |
| Business logic in `services/`, not routers | Keeps routers thin, logic testable and reusable |
| Trigger for placement creation | Guarantees consistency — placement record can never be forgotten after selection |
| Views for analytics (`placement_summary`) | Avoids duplicating join logic across multiple queries |
| Composite PKs for junction tables | Enforces uniqueness of (student, skill) and (job, skill) pairs at the DB level |
| Docker optional until later | Keeps local dev loop fast during early iteration |
