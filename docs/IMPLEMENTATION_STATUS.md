# Implementation Status

Single source of truth for project maturity. Every row names a status, the evidence and what blocks the next level.

## Status legend

| Status | Meaning |
|---|---|
| **Integrated and verified** | Feature is wired end-to-end (Frontend <-> FastAPI <-> PostgreSQL) and verified via automated tests and runtime execution. |
| **Implemented in backend** | Complete FastAPI route, Pydantic schema, and SQLAlchemy CRUD implemented and verified by automated backend tests. |
| **Implemented in SQL** | Executed and active in PostgreSQL 16 container (`01_ddl.sql` through `06_seed.sql`). |
| **Implemented in prototype** | Active in `frontend/` UI components (or reference in `prototype/`). |
| **Partially implemented** | Core functionality works; specific edge cases or sub-features remain in transition. |
| **Planned** | Documented architectural target for future phases. |
| **Not implemented** | Functionality is not built. |

## Layers at a glance

| Layer | Location | State |
|---|---|---|
| Active React Frontend | `frontend/` | **Integrated and verified** on core flows (Auth, Student & Admin Overviews, Applications, Offers, Placements, Notifications, Profile). Secondary staff management screens in transition. |
| FastAPI REST API | `backend/` | **Integrated and verified**: 11 routers, Pydantic v2 schemas, SQLAlchemy 2 models, JWT HS256 auth, 115 passing tests. |
| PostgreSQL Database | `sql/init/` | **Integrated and verified**: 17 tables, 7 views (1 materialized), triggers, procedures, seed data executed and running live in container. |
| Local Docker Compose Stack | `docker-compose.yml` | **Integrated and verified**: 4 containers (`db`, `backend`, `frontend`, `mailpit`) healthy and operational. |
| Historical Prototype | `prototype/` | **Implemented in prototype**: Standalone AI Studio export retained for design reference. |

## Feature matrix

| ID | Feature | Status | Evidence (paths) | Notes / Next step |
|---|---|---|---|---|
| F-01 | Landing page (3D hero, GSAP, Lenis) | Integrated and verified | `frontend/src/pages/LandingPage.jsx`, `components/three/*` | Verified in browser and production build |
| F-02 | Real JWT Sign in & Session | Integrated and verified | `frontend/src/pages/AuthPage.jsx`, `backend/app/routers/auth.py` | Bcrypt password check, JWT HS256 token issuance |
| F-03 | Student sign up, OTP step, forgot password | Integrated and verified | `AuthPage.jsx`, `authService.js`, `backend/app/routers/auth.py`, Mailpit | Real 6-digit OTP via `fn_generate_otp` & Mailpit SMTP |
| F-04 | Role-separated session management | Integrated and verified | `frontend/src/context/AuthContext.jsx`, `backend/app/core/deps.py` | Real user claims, `require_roles`, no client demo account switching in production |
| F-05 | Route-level role guards | Integrated and verified | `frontend/src/App.jsx` `RoleProtectedRoute` | Validates against JWT role; blocks unauthorized routes |
| F-06 | Server-side RBAC & ownership | Integrated and verified | `backend/app/core/deps.py`, `routers/*.py` | `require_roles("ADMIN", "STAFF")`, student row ownership checks |
| F-07 | Shared dashboard shell (sidebar, header, profile) | Integrated and verified | `frontend/src/layouts/DashboardLayout.jsx` | Dynamic role-specific sidebar (Admin, Staff, Student) |
| F-08 | Notification bell + popover | Integrated and verified | `DashboardLayout.jsx`, `notificationsService.js` | Real unread badge count from `/api/v1/notifications` |
| F-09 | Global toast notifications | Integrated and verified | `frontend/src/context/ToastContext.jsx` | Fixed bottom-right feedback on API actions |
| F-10 | Role-scoped notifications with read state | Integrated and verified | `NotificationsPage.jsx`, `backend/app/routers/notifications.py` | Real read-all endpoint (`sp_mark_notifications_read`), empty list for non-students |
| F-11 | Demo Inbox messaging | Implemented in prototype | `components/ui/DemoInboxModal.jsx` | Client-side simulation; no backing database tables |
| F-12 | Student directory, CGPA verification, skills, export | Implemented in backend | `backend/app/routers/students.py`, `StudentsPage.jsx` | Backend endpoints verified with tests; UI wiring in progress |
| F-13 | Staff/user account management | Implemented in backend | `backend/app/routers/auth.py`, `UserManagementPage.jsx` | Backend user creation & auth verified; UI wiring in progress |
| F-14 | Companies (create, edit, contacts, delete) | Implemented in backend | `backend/app/routers/companies.py`, `CompaniesPage.jsx` | Backend CRUD endpoints verified with 51 tests |
| F-15 | Job drives (create, edit, archive, close-expired) | Implemented in backend | `backend/app/routers/jobs.py`, `JobsPage.jsx` | Backend job CRUD and stored procedures verified |
| F-16 | Eligibility evaluation engine | Integrated and verified | `backend/app/services/eligibility.py`, SQL `fn_is_eligible` | Evaluates CGPA, backlogs, department, and skills |
| F-17 | Apply to job drive | Integrated and verified | `backend/app/routers/applications.py`, SQL `sp_apply_to_job` | Trigger validates open drive, deadline, and eligibility |
| F-18 | Application status workflow | Integrated and verified | `backend/app/routers/applications.py`, `sp_update_application_status` | Enforced by `trg_applications_validate_status` |
| F-19 | Interview scheduling & round tracking | Integrated and verified | `backend/app/routers/interviews.py`, `StudentMyApplications.jsx` | Stored procedures `sp_schedule_interview`, `sp_record_interview_result` |
| F-20 | Selection, offers, accept/decline | Integrated and verified | `backend/app/routers/offers.py`, `StudentMyPlacement.jsx` | Trigger `trg_applications_create_offer`, `sp_respond_to_offer` |
| F-21 | Single/dream-offer tier policy | Integrated and verified | SQL `fn_policy_allows`, `sp_respond_to_offer`, `offers.py` | Enforced at database level during offer response |
| F-22 | Offer letter PDF and ID badge | Integrated and verified | `frontend/src/utils/offerPdfGenerator.js` (jsPDF) | Generates dynamic client-side PDF and ID texture |
| F-23 | Placement policies editor | Partially implemented | `PlacementPoliciesPage.jsx` | Policy thresholds currently hardcoded in SQL functions; UI editor in transition |
| F-24 | Placement analytics dashboard | Integrated and verified | `backend/app/routers/analytics.py`, `AdminOverview.jsx` | Real KPIs from `mv_placement_kpis`, NIRF report CSV export |
| F-25 | Student application tracking portal | Integrated and verified | `StudentMyApplications.jsx`, `StudentMyPlacement.jsx`, `StudentOverview.jsx` | Direct real-time sync with database records |
| F-26 | Contact actions (call, email, bridge) | Integrated and verified | `ContactActionButtons.jsx`, `MeetingLinkButton.jsx` | Generates validated `tel:`, `mailto:`, and external URLs |
| F-27 | Backend health endpoints | Integrated and verified | `backend/app/routers/health.py`, `backend/tests/test_health.py` | `/health` and `/health/db` verified live |
| F-28 | Backend business REST API | Integrated and verified | `backend/app/routers/*.py` (11 routers) | Verified by 115 passing pytest test cases |
| F-29 | PostgreSQL schema & logic | Integrated and verified | `sql/init/01..06` | Executed live in PostgreSQL 16 container |
| F-30 | Docker Compose multi-service stack | Integrated and verified | `docker-compose.yml` | 4 services running live with health checks |
| F-31 | Automated tests | Integrated and verified | `backend/tests/` | 115 tests passing in 22s; frontend production build passes in 41s |
| F-32 | Documentation set | Integrated and verified | `README.md`, `PHASES.md`, `docs/*` | Reconciled with actual codebase ground truth |

