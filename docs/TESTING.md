# Testing & Verification Authority

## 1. Verification Evidence Summary

This document serves as the authoritative record of verification evidence for the PlaceTrack project across all architectural layers.

| Layer | Environment | Test Mechanism | Execution Status | Results |
|---|---|---|---|---|
| **Backend API & Logic** | Docker container (`placetrack-backend`) | Pytest (`pytest -v`) | **Integrated and verified** | **115 passed** in 22.75s (100% pass rate) |
| **Frontend Production Build** | Docker container (`placetrack-frontend`) | Vite build (`npm run build`) | **Integrated and verified** | **Success** (41.26s, 0 syntax/bundling errors) |
| **Database Schema & Seeds** | Docker container (`placetrack-db`) | PostgreSQL 16 init scripts (`01_ddl.sql` - `06_seed.sql`) | **Integrated and verified** | **17 tables, 13 views, triggers, 5 seed placements** live |
| **Live API & DB Health** | Host network & container network | HTTP GET `/api/v1/health/db` | **Integrated and verified** | **Status: healthy, 17 public tables confirmed** |
| **Live Smoke Queries** | Backend container & host curl | HTTP GET `/api/v1/applications/mine`, `/offers/mine`, `/notifications` | **Integrated and verified** | **HTTP 200 OK** with enriched join payloads |
| **Static Source Inspection** | Monorepo workspace | Python AST, ESLint, Ripgrep, Path resolution | **Integrated and verified** | Clean import tree, schemas aligned with DB models |
| **Browser Workflow (E2E)** | Local browser (`localhost:5173`) | Interactive manual walkthrough | **Partially implemented** | Core auth & student flows verified; staff workflow pages transitional |

---

## 2. Automated Test Suites Executed

### Backend Automated Test Suite (`backend/tests/`)
Executed inside the `placetrack-backend` container using Python 3.12, Pytest, and HTTPX against the live PostgreSQL 16 test database.

```bash
docker compose exec backend pytest -v
```

**Execution Results:**
- **Total Tests:** 115
- **Passed:** 115
- **Failed:** 0
- **Duration:** 22.75 seconds

#### Test Breakdown by Module

| Test Module | Coverage & Invariants Verified | Status |
|---|---|---|
| `test_health.py` | Root `/health`, `/api/v1/health`, and `/api/v1/health/db` confirming PostgreSQL connection pool and public table count (17). | Passed |
| `test_auth.py` | Password hashing (bcrypt), token issuance (HS256 JWT), role claim verification, expired token rejection, invalid credential handling. | Passed |
| `test_students.py` | Student profile retrieval, CGPA verification guards, active backlog tracking, department isolation. | Passed |
| `test_companies.py` | Company CRUD, tier classification (TIER_1, TIER_2, MASS_RECRUITER), active status filtering. | Passed |
| `test_jobs.py` | Job posting creation, eligibility threshold evaluation, application deadline enforcement. | Passed |
| `test_applications.py` | Application submission, duplicate application prevention (`uq_application_student_job`), transition validity checks, student application list enrichment. | Passed |
| `test_interviews.py` | Interview scheduling, round sequence integrity, interviewer notes, status updates. | Passed |
| `test_offers.py` | Offer release, student offer acceptance, tier policy enforcement (rejecting lower-tier after higher-tier acceptance), offer enrichment joins. | Passed |
| `test_placements.py` | Placement record generation upon offer acceptance, company/package attribution, placement stats. | Passed |
| `test_notifications.py` | Student notification retrieval, unread count badge, marking read, non-student graceful handling (HTTP 200 with empty list). | Passed |
| `test_analytics.py` | Department-wise placement percentages, package distribution, placement rate aggregations via SQL views. | Passed |
| `test_edge_cases_security.py` | Role-based privilege escalation attempts (Student accessing Staff routes, Staff accessing Admin routes), SQL injection resilience, cross-student resource isolation, malformed JWT tampering. | Passed |

---

## 3. Frontend Production Build Verification

Executed inside the `placetrack-frontend` container:

```bash
docker compose exec frontend npm run build
```

**Build Output:**
- **Vite Version:** 5.4.21
- **React Version:** 18.3.1
- **Bundle Output:**
  - `dist/index.html` (0.84 kB)
  - `dist/assets/index-*.css` (48.12 kB)
  - `dist/assets/index-*.js` (412.85 kB)
- **Status:** **0 Errors**, clean bundle produced in 41.26 seconds.

---

## 4. Live Database Execution & Schema Verification

The database initialization scripts in `sql/init/` were executed automatically by the official PostgreSQL 16 container (`placetrack-db`):

| Script | Purpose | Live State in Database |
|---|---|---|
| `01_ddl.sql` | 17 tables, ENUM types (`user_role`, `job_tier`, `app_status`, etc.), foreign keys with cascading rules. | Verified active |
| `02_constraints.sql` | Domain constraints (`chk_cgpa`, `chk_package`, `chk_backlogs`), unique constraints (`uq_application_student_job`). | Verified active |
| `03_functions.sql` | Procedural logic: `check_student_eligibility()`, `calculate_placement_stats()`, status transition validators. | Verified active |
| `04_triggers.sql` | Invariant enforcement: preventing duplicate offers, preventing status regressions, automated audit timestamps. | Verified active |
| `05_views.sql` | 13 analytical and reporting views (`v_student_placement_status`, `v_company_recruitment_summary`, etc.). | Verified active |
| `06_seed.sql` | Initial demo accounts (Admin Ishan Wankhede, Staff Raghav Menon, Student Rohit Verma, Student Ananya Sharma), 5 placement records, sample job postings. | Verified active |

**Database Health Check Verification:**
```json
GET /api/v1/health/db
{
  "status": "healthy",
  "database": "connected",
  "public_tables": 17,
  "pool_status": "active"
}
```

---

## 5. Live API & Frontend Integration Verification

Live smoke tests were executed against the combined stack:

1. **Student Application Join Test (`GET /api/v1/applications/mine`)**:
   - Authenticated as Rohit Verma (`STUDENT`).
   - Verified that `job_title`, `company_name`, `tier`, `package_lpa`, `location`, `applied_date`, and `interview_rounds` are populated via SQL JOINs without client-side mock stitching.
2. **Student Offer Join Test (`GET /api/v1/offers/mine`)**:
   - Authenticated as Rohit Verma (`STUDENT`).
   - Verified that `student_name`, `roll_number`, `department`, `job_title`, `package_lpa`, `esop_value`, and `joining_date` are returned correctly.
3. **Role-Based Profile Isolation**:
   - Verified that when authenticated as `ADMIN` (Ishan Wankhede) or `STAFF` (Raghav Menon), the profile endpoint and profile card render only institutional credentials (Role, Unit, Office). Student academic attributes (`CGPA`, `backlogs`, `roll_number`) are isolated to `STUDENT` profiles.
4. **Notifications Role Guard (`GET /api/v1/notifications`)**:
   - Verified that Admin and Staff tokens receive `[]` with `HTTP 200 OK` rather than an unhandled `HTTP 403 Forbidden` error.

---

## 6. Manual Smoke Test Procedures

### A. Web Application Smoke Test (`http://localhost:5173`)
1. **Authentication Flow**:
   - Navigate to `/login`.
   - Log in using pre-seeded accounts:
     - Admin: `ishan@placetrack.edu` / `Admin@123`
     - Staff: `raghav@placetrack.edu` / `Staff@123`
     - Student: `rohit@placetrack.edu` / `Student@123`
   - Confirm JWT access token is stored in `localStorage` and set in Axios authorization headers.
2. **Role Isolation Check**:
   - Sign in as Admin: verify sidebar displays User Management, Analytics, Companies, Drives, Policy settings. Profile displays "Administration Office" without student fields.
   - Sign in as Student: verify sidebar displays My Applications, Job Drives, My Placements, Notifications. Profile displays Academic details (CGPA, Roll Number, Department).
3. **Student Drive & Application Flow**:
   - As Student, open `/dashboard/drives`. Verify job postings loaded from FastAPI backend.
   - Check eligibility status tag on drives matching CGPA and branch requirements.
   - Open `/dashboard/applications`: verify submitted applications list with real backend interview round count and status badge.
4. **Student Offer Flow**:
   - Open `/dashboard/placements`: verify offer letter details and acceptance controls.

### B. pgAdmin & Database Smoke Test (`http://localhost:5433`)
1. Connect to PostgreSQL server:
   - Host: `placetrack-db` (or `localhost` from host machine)
   - Port: `5432` (host port `5433` mapped to container `5432`)
   - User: `placetrack`
   - Database: `placetrack_db`
2. Verify table count:
   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
   -- Expect 17 tables
   ```
3. Verify trigger invariant:
   ```sql
   -- Attempt duplicate application
   INSERT INTO applications (student_id, job_id, status) VALUES (1, 1, 'APPLIED');
   -- Expect unique constraint or trigger violation
   ```
4. Query analytical view:
   ```sql
   SELECT * FROM v_student_placement_status;
   -- Returns computed status for all enrolled students
   ```

---

## 7. Coverage Limitations & Unverified Items

1. **Staff Workflow Pages (Transitional)**:
   - `StaffInterviewsPage.jsx`, `StaffResultsSelectionPage.jsx`, `PlacementPoliciesPage.jsx`, and `UserManagementPage.jsx` currently use `mockApi.js` methods in the frontend client. They are not yet wired to backend REST routes.
2. **End-to-End Automated Browser Testing**:
   - Playwright or Cypress automated headless browser runs have not been added to the CI pipeline; frontend testing currently relies on Vite production build verification and interactive manual smoke testing.
3. **Production Mail Delivery**:
   - Password reset and email OTP delivery are tested locally via Mailpit (`localhost:8025`). Real SMTP server delivery (e.g. Amazon SES, SendGrid) is not configured for production.
