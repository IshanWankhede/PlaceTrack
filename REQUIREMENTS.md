# Requirements Specification
## Placement Management & Analytics System

---

## 1. Functional Requirements

### FR-1: Authentication & Access
- FR-1.1: System shall support login for placement staff/admin via email + password (JWT issued on success).
- FR-1.2: Protected API routes shall reject requests without a valid JWT (401 Unauthorized).
- FR-1.3: (Future) Role-based access — Admin vs. Staff.

### FR-2: Department Management
- FR-2.1: System shall allow CRUD operations on departments (name, unique code).

### FR-3: Student Management
- FR-3.1: System shall allow creating a student with roll number, name, email, phone, CGPA, graduation year, and department.
- FR-3.2: Roll number and email shall be unique across students.
- FR-3.3: CGPA shall be validated between 0 and 10.
- FR-3.4: System shall allow assigning one or more skills to a student, each with a proficiency level.
- FR-3.5: System shall support listing, filtering (by department, CGPA range, graduation year), updating, and deleting students.

### FR-4: Skill Management
- FR-4.1: System shall maintain a master list of unique skills.
- FR-4.2: Skills shall be reusable across students and jobs (many-to-many).

### FR-5: Company Management
- FR-5.1: System shall allow CRUD operations on companies (name, industry, location, website, description).
- FR-5.2: Company name shall be unique.

### FR-6: Job Management
- FR-6.1: System shall allow creating a job linked to a company, with title, description, minimum CGPA, package, job type, location, application deadline, and status.
- FR-6.2: System shall allow associating required skills (with required proficiency level) to a job.
- FR-6.3: Job status shall be one of `OPEN` or `CLOSED`.
- FR-6.4: System shall support listing/filtering jobs (by company, status, minimum CGPA, job type).

### FR-7: Eligibility Engine
- FR-7.1: Given a job, the system shall compute the list of eligible students by checking:
  - Student CGPA ≥ job minimum CGPA
  - Student department matches job's allowed department(s), if restricted
  - Student possesses all required skills for the job
- FR-7.2: Given a student, the system shall compute the list of jobs they are eligible to apply to.
- FR-7.3: The student-facing Jobs view shall only expose an "Apply" action for eligible jobs.

### FR-8: Application Management
- FR-8.1: A student shall be able to apply to a job only if eligible (server-side enforced, not just UI-side).
- FR-8.2: A student shall not be able to apply to the same job more than once (unique constraint).
- FR-8.3: Application status shall follow the lifecycle: `APPLIED → SHORTLISTED → INTERVIEW → SELECTED | REJECTED`, with `WITHDRAWN` available from any non-terminal state.
- FR-8.4: Staff shall be able to update an application's status.
- FR-8.5: System shall record the application timestamp.

### FR-9: Interview Management
- FR-9.1: System shall allow creating multiple interview rounds per application (round number, type, scheduled time, result, remarks).
- FR-9.2: Round numbers shall be unique per application.
- FR-9.3: Result shall be one of `PENDING`, `CLEARED`, `REJECTED`.

### FR-10: Placement Management
- FR-10.1: When an application's status changes to `SELECTED`, the system shall automatically create a corresponding placement record (student, job, company, package, placement date) via a database trigger — no manual duplicate entry required.
- FR-10.2: Placement records shall be viewable and filterable by department, company, and package range.
- FR-10.3: (Configurable) A student shall have at most one placement record, unless multi-offer tracking is explicitly enabled (see PRD open questions).

### FR-11: Analytics
- FR-11.1: System shall expose an overview endpoint with total students, total placed, and overall placement rate.
- FR-11.2: System shall expose department-wise placement statistics (placed count, total count, rate, average package).
- FR-11.3: System shall expose company-wise selection counts, ranked descending.
- FR-11.4: System shall expose package distribution (min, max, average, median optional).
- FR-11.5: System shall expose the list of students with CGPA above the overall average.

---

## 2. Non-Functional Requirements

### NFR-1: Performance
- API responses for standard CRUD operations shall return within 300ms under normal load (local/staging).
- Analytics endpoints shall leverage indexed columns and SQL aggregation (not in-memory computation) to remain performant as data grows.

### NFR-2: Data Integrity
- All foreign key relationships shall be enforced at the database level.
- Status fields shall be constrained via CHECK constraints, not just application-level validation.
- Multi-step operations (e.g., status update triggering placement creation) shall be wrapped in a transaction.

### NFR-3: Security
- Passwords shall be hashed (e.g., bcrypt) — never stored in plaintext.
- JWT secrets and DB credentials shall be stored in environment variables, never committed to source control.
- Input validation shall occur at the API boundary (Pydantic schemas) before reaching the database.

### NFR-4: Usability
- The frontend shall be responsive (usable on both desktop and tablet widths).
- Status changes (application, interview, placement) shall be visually distinguishable (e.g., color-coded `StatusBadge`).
- Loading and empty states shall be handled explicitly in all list views.

### NFR-5: Maintainability
- Backend shall follow a layered structure: routers → schemas → services/CRUD → models, to keep concerns separated.
- Database schema changes shall be managed via Alembic migrations, not manual ALTER statements.
- Code shall include tests for core resources (students, jobs, applications) at minimum.

### NFR-6: Scalability (Reasonable for Scope)
- Schema shall be normalized to 3NF to avoid data duplication.
- Indexes shall be present on all foreign key columns and frequently filtered fields (e.g., `applications.status`).

### NFR-7: Portability
- The system shall be runnable locally without Docker for fast iteration during development.
- The system shall optionally run via `docker-compose` for consistent environment setup (frontend, backend, db as separate services).

### NFR-8: Auditability
- Key timestamps (`created_at`, `applied_at`, `placement_date`) shall be recorded automatically, not entered manually.

---

## 3. Constraints & Assumptions

- Single institution / single placement cell (no multi-tenancy in v1).
- Staff/admin users are trusted internal actors; students are the only "external" actor type in v1.
- English-only UI in v1.
- CGPA is on a 0–10 scale (adjust CHECK constraints if a different scale, e.g., 0–4 GPA, is required).

---

## 4. Acceptance Criteria (Sample — Eligibility Engine)

Given a job with `minimum_cgpa = 8.0` and required skills `[Python, SQL, Git]`:

| Student CGPA | Student Skills | Expected Result |
|---|---|---|
| 8.7 | Python, SQL, Git, React | ✅ Eligible |
| 7.9 | Python, SQL, Git | ❌ Not eligible (CGPA below threshold) |
| 8.5 | Python, SQL | ❌ Not eligible (missing Git) |
| 8.0 | Python, SQL, Git | ✅ Eligible (boundary CGPA inclusive) |

Given the above, `GET /api/v1/jobs/{id}/eligible-students` shall return exactly the students meeting all three conditions.
