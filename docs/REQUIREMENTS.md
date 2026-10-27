# Requirements and Verification Traceability

Status vocabulary adheres to project audit standards: `Integrated and verified`, `Implemented in backend`, `Implemented in SQL`, `Implemented in frontend`, `Partially implemented`, `Planned`, `Not implemented`.

Test evidence is drawn from the 115 passing Pytest backend tests, Vite production builds, live PostgreSQL 16 queries, and manual smoke test walkthroughs. See [TESTING.md](./TESTING.md).

---

## 1. Functional Requirements

| ID | Requirement | Roles | Status | Responsible Source | Database Structure | Test Evidence |
|---|---|---|---|---|---|---|
| **FR-AUTH-001** | User authentication with email and password | ALL | **Integrated and verified** | `backend/app/routers/auth.py`, `frontend/src/pages/auth/LoginPage.jsx` | `users.password_hash` | Pytest `test_auth.py` (bcrypt verification, token issuance) |
| **FR-AUTH-002** | Student signup with email OTP verification and password creation | STUDENT | **Integrated and verified** | `backend/app/routers/auth.py`, `frontend/src/pages/auth/SignupPage.jsx` | `email_otps`, `fn_generate_otp`, `fn_verify_otp` | Pytest `test_auth.py`, Mailpit integration |
| **FR-AUTH-003** | Real credential verification and JWT access token issuance | ALL | **Integrated and verified** | `backend/app/core/security.py`, `backend/app/routers/auth.py` | `users` | Pytest `test_auth.py` (HS256 JWT, claims verification) |
| **FR-AUTH-004** | Role-guarded client routes | ALL | **Implemented in frontend** | `frontend/src/components/common/RoleProtectedRoute.jsx` | None (Client-side UX routing) | Vite build, manual route access checks |
| **FR-AUTH-005** | Server-enforced role-based access control (RBAC) | ALL | **Integrated and verified** | `backend/app/core/dependencies.py` (`require_roles`) | `users.role` | Pytest `test_edge_cases_security.py` (403 on role mismatch) |
| **FR-AUTH-006** | Profile credentials role isolation (Admin/Staff institutional, Student academic) | ALL | **Integrated and verified** | `backend/app/schemas/user.py`, `frontend/src/pages/dashboard/ProfilePage.jsx` | `users`, `students` | Smoke test: Admin profile omits CGPA/backlogs; Student profile displays academic fields |
| **FR-STU-001** | Student directory with filters and search | ADMIN, STAFF | **Integrated and verified** | `backend/app/routers/students.py`, `frontend/src/pages/dashboard/StudentsPage.jsx` | `students`, `v_student_status` | Pytest `test_students.py` |
| **FR-STU-002** | Student profile and technical skills management | STUDENT, STAFF, ADMIN | **Integrated and verified** | `backend/app/routers/students.py`, `frontend/src/pages/dashboard/ProfilePage.jsx` | `students`, `student_skills` | Pytest `test_students.py` |
| **FR-STU-003** | Placement cell CGPA verification | ADMIN, STAFF | **Integrated and verified** | `backend/app/routers/students.py` (`/verify-cgpa`), `StudentsPage.jsx` | `students.cgpa_verified`, `sp_verify_student_cgpa` | Pytest `test_students.py` |
| **FR-STU-004** | Promote selected students to next round in bulk | ADMIN, STAFF | **Implemented in SQL** | `sql/init/04_procedures.sql` (`sp_bulk_update_status`) | `applications`, `sp_bulk_update_status` | SQL procedure verification in `06_seed.sql` |
| **FR-STU-005** | Staff and user account management | ADMIN | **Partially implemented** | `backend/app/routers/students.py`, `frontend/src/pages/dashboard/UserManagementPage.jsx` | `users` | Backend CRUD operational; UI transitional |
| **FR-CMP-001** | Company registration and HR contact management | ADMIN, STAFF | **Integrated and verified** | `backend/app/routers/companies.py`, `frontend/src/pages/dashboard/CompaniesPage.jsx` | `companies`, `company_contacts` | Pytest `test_companies.py` |
| **FR-JOB-001** | Create and manage job recruitment drives with cutoffs and packages | ADMIN, STAFF | **Integrated and verified** | `backend/app/routers/jobs.py`, `frontend/src/pages/dashboard/JobsPage.jsx` | `jobs`, `job_skills`, `job_departments` | Pytest `test_jobs.py` |
| **FR-JOB-002** | Student job drive browsing with eligibility matching | STUDENT | **Integrated and verified** | `backend/app/routers/jobs.py`, `frontend/src/pages/dashboard/StudentJobDrives.jsx` | `fn_is_eligible`, `fn_match_score` | Pytest `test_jobs.py` |
| **FR-ELG-001** | Dynamic eligibility evaluation (CGPA, backlogs, department, skills) | ALL | **Integrated and verified** | `backend/app/crud/crud_job.py`, `sql/init/03_functions.sql` | `fn_is_eligible`, `fn_eligibility_check` | Pytest `test_jobs.py`, trigger tests |
| **FR-ELG-002** | Drive eligible-student cohort evaluation | ADMIN, STAFF | **Integrated and verified** | `backend/app/routers/jobs.py` (`/eligible-students`), `StaffEligibleStudentsPage.jsx` | `fn_eligible_students` | Pytest `test_jobs.py` |
| **FR-APP-001** | Apply to an eligible drive | STUDENT | **Integrated and verified** | `backend/app/routers/applications.py`, `JobsPage.jsx` | `applications`, `trg_applications_validate_insert` | Pytest `test_applications.py`, live trigger tests |
| **FR-APP-002** | Application status workflow with state machine validation | ADMIN, STAFF | **Integrated and verified** | `backend/app/routers/applications.py`, `sql/init/05_triggers.sql` | `trg_applications_validate_status` | Pytest `test_applications.py` |
| **FR-APP-003** | Student tracks own applications with round count and drive metadata | STUDENT | **Integrated and verified** | `backend/app/routers/applications.py` (`/mine`), `StudentMyApplications.jsx` | `applications`, `interviews`, `jobs` | Pytest `test_applications.py`, smoke test HTTP 200 payload |
| **FR-APP-004** | Student withdraws application | STUDENT | **Implemented in SQL** | `sql/init/04_procedures.sql` (`sp_withdraw_application`) | `applications.status = 'WITHDRAWN'` | SQL procedure verification |
| **FR-INT-001** | Schedule, update, and record interview rounds | ADMIN, STAFF | **Implemented in backend** | `backend/app/routers/interviews.py`, `sql/init/04_procedures.sql` | `interviews`, `sp_schedule_interview` | Pytest `test_interviews.py` (UI transitional) |
| **FR-INT-002** | Student views interview schedule with meeting link | STUDENT | **Implemented in backend** | `backend/app/routers/interviews.py`, `frontend/src/pages/dashboard/StudentInterviewsPage.jsx` | `interviews.meeting_link` | Pytest `test_interviews.py` |
| **FR-OFR-001** | Release offers upon selection with CTC breakdown | ADMIN, STAFF | **Implemented in backend** | `backend/app/routers/offers.py`, `sql/init/05_triggers.sql` | `offers`, `trg_applications_create_offer` | Pytest `test_offers.py` |
| **FR-OFR-002** | Student accepts or declines an offer | STUDENT | **Integrated and verified** | `backend/app/routers/offers.py` (`/mine`, `/accept`), `StudentMyPlacement.jsx` | `offers`, `sp_respond_to_offer` | Pytest `test_offers.py`, smoke test |
| **FR-OFR-003** | Placement tier upgrade policy enforcement | ALL | **Integrated and verified** | `backend/app/crud/crud_offer.py`, `sql/init/03_functions.sql` | `fn_policy_allows`, `trg_applications_create_offer` | Pytest `test_offers.py`, SQL trigger rollback on invalid upgrade |
| **FR-OFR-004** | Offer letter PDF generation | STUDENT | **Implemented in frontend** | `frontend/src/utils/offerPdfGenerator.js` | None (Client-side jsPDF) | Manual download verification |
| **FR-PLC-001** | Confirmed student placement roster and export | ADMIN, STAFF | **Integrated and verified** | `backend/app/routers/placements.py`, `frontend/src/pages/dashboard/PlacementsPage.jsx` | `placements`, `placement_summary` | Pytest `test_placements.py` |
| **FR-NTF-001** | In-app notifications with read status | ALL | **Integrated and verified** | `backend/app/routers/notifications.py`, `NotificationsPage.jsx` | `notifications` | Pytest `test_notifications.py` (HTTP 200 for all roles) |
| **FR-NTF-002** | Bell popover with internal scrolling and toasts | ALL | **Integrated and verified** | `frontend/src/layouts/DashboardLayout.jsx`, `ToastContext.jsx` | None | Browser smoke test |
| **FR-MSG-001** | Demo multi-party messaging | ALL | **Implemented in prototype** | `frontend/src/components/ui/DemoInboxModal.jsx` | None | Client simulation only (WebSocket API planned) |
| **FR-ANL-001** | Placement analytics (rates, department stats, packages, funnel) | ADMIN, STAFF | **Integrated and verified** | `backend/app/routers/analytics.py`, `AdminOverview.jsx`, `AnalyticsPage.jsx` | `mv_placement_kpis`, `v_department_stats`, `v_company_selections` | Pytest `test_analytics.py`, live SQL view execution |
| **FR-POL-001** | Placement policies management | ADMIN | **Implemented in SQL** | `sql/init/03_functions.sql` (`fn_policy_allows`), `PlacementPoliciesPage.jsx` | Trigger invariants | SQL execution in `06_seed.sql` (UI transitional) |
| **FR-API-001** | Backend service and database health endpoints | ALL | **Integrated and verified** | `backend/app/routers/health.py` | PostgreSQL connection pool | Pytest `test_health.py`, `curl /api/v1/health/db` |
| **FR-API-002** | Comprehensive RESTful backend API | ALL | **Integrated and verified** | 11 FastAPI routers in `backend/app/routers/` | All 17 tables | 115 passing tests across all routers |

---

## 2. Non-Functional Requirements

| ID | Requirement | Status | Responsible Implementation | Verified Evidence |
|---|---|---|---|---|
| **NFR-SEC-001** | Secure password hashing (bcrypt) and credential protection | **Integrated and verified** | `passlib` bcrypt context in backend; `pgcrypto` in database seed | Pytest `test_auth.py`; plaintext passwords never stored |
| **NFR-SEC-002** | Server-side role authorization on every protected API endpoint | **Integrated and verified** | `require_roles` FastAPI dependency | Pytest `test_edge_cases_security.py` |
| **NFR-SEC-003** | Pydantic v2 input validation and sanitization at API boundaries | **Integrated and verified** | Pydantic schemas in `backend/app/schemas/` | HTTP 422 on invalid types, lengths, or values |
| **NFR-SEC-004** | Environment secrets separation and gitignore compliance | **Integrated and verified** | `app/core/config.py`, `.env.docker`, `.gitignore` | No secrets committed to repository |
| **NFR-DAT-001** | Relational integrity via foreign keys, CHECK constraints, and indexes | **Integrated and verified** | PostgreSQL 16 `sql/init/01_ddl.sql` | 17 tables, 24 FKs verified in live database |
| **NFR-DAT-002** | Multi-step transactional atomicity (e.g. offer creation on selection) | **Integrated and verified** | PostgreSQL triggers (`trg_applications_create_offer`, etc.) | Tested live; automatic rollback on violation |
| **NFR-UX-001** | Responsive dashboard layout with glassmorphic cards and micro-animations | **Integrated and verified** | Tailwind CSS + custom component tokens in `frontend/src/` | Vite build verified (41.26s, 0 errors) |
| **NFR-UX-002** | Notification popover and toasts confined to viewport | **Integrated and verified** | `DashboardLayout.jsx`, `ToastContext.jsx` | Manual browser check |
| **NFR-PERF-001** | Fast local API response times (< 300 ms) | **Integrated and verified** | FastAPI async handlers + SQLAlchemy async connection pool | Average local latency < 45 ms |
| **NFR-MNT-001** | Clean layered backend architecture (Routers -> Schemas -> CRUD -> Models) | **Integrated and verified** | Modular packages in `backend/app/` | Source inspection, zero cyclic dependencies |
| **NFR-MNT-002** | Automated unit and integration test suite | **Integrated and verified** | Pytest test suite in `backend/tests/` | 115 passing tests (100% pass rate) |
| **NFR-OPS-001** | One-command multi-container environment with live hot reload | **Integrated and verified** | `docker-compose.yml` (frontend, backend, db, mailpit, pgadmin) | All 4 services running healthy |
