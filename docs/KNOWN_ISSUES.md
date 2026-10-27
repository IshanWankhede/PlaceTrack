# Known Issues

Register of verified problems and historical resolved findings.
Verification status values:
- *Verified by source inspection* (code read and confirmed across files)
- *Verified by automated tests* (executed via pytest or vite build)
- *Verified live in runtime* (executed against running Docker containers)

Severity: High / Medium / Low.

---

## 1. Open Issues

| ID | Sev | Issue | Affected files | Impact | Recommended fix | Verification |
|---|---|---|---|---|---|---|
| KI-003 | Medium | `ROLE_PERMISSIONS` in `AuthContext.jsx` defines legacy `canManage*` flags that UI pages do not read directly. Route protection in `App.jsx` handles frontend routing, while server-side FastAPI dependencies enforce actual API permissions. | `frontend/src/context/AuthContext.jsx`, `frontend/src/App.jsx` | Dead/redundant client permission flags. | Clean up unused client flags; rely directly on JWT `role` and backend RBAC. | Verified by source inspection |
| KI-004 | Low | Route/sidebar alignment: ADMIN role is allowed on `/dashboard/eligible-students`, `/interviews`, `/results` via route definitions, but the primary admin sidebar focuses on executive analytics and user oversight. | `frontend/src/layouts/DashboardLayout.jsx` | Operations pages reachable by direct URL for Admin. | Standardize whether Admin sidebar should include operational drive links. | Verified by source inspection |
| KI-006 | Medium | Policies page (`PlacementPoliciesPage.jsx`) edits client state; database triggers (`trg_applications_validate_insert`, `sp_respond_to_offer`) enforce hardcoded institutional defaults. | `frontend/src/pages/dashboard/PlacementPoliciesPage.jsx`, `sql/init/05_triggers.sql` | UI policy edits do not dynamically mutate database procedure constants. | Add a database `placement_policies` table read by stored procedures. | Verified by source inspection |
| KI-011 | Low | Legacy transitional pages carry duplicate camelCase and snake_case field access. | `frontend/src/pages/dashboard/StaffInterviewsPage.jsx`, `StaffResultsSelectionPage.jsx` | Increases cognitive load when inspecting transitional components. | Standardize all transitional pages to strict backend snake_case schemas. | Verified by source inspection |
| KI-015 | Low | Client-side CSV export in `StudentsPage.jsx` does not escape embedded quotes in names. | `frontend/src/pages/dashboard/StudentsPage.jsx` | Potential format issue if student name contains double quotes. | Use backend streaming `/api/v1/students/export.csv` instead of browser-built strings. | Verified by source inspection |
| KI-024 | Medium | Secondary staff operational screens (`StaffInterviewsPage`, `StaffResultsSelectionPage`, `UserManagementPage`) are partially migrated, currently relying on prototype mockApi state while corresponding backend endpoints exist. | `frontend/src/pages/dashboard/StaffInterviewsPage.jsx`, `StaffResultsSelectionPage.jsx`, `UserManagementPage.jsx` | Changes made on these three screens are not yet persisted to PostgreSQL. | Complete the swap to `applicationsService`, `interviewsService`, and `authService` endpoints. | Verified by source inspection |
| KI-025 | Low | In-app messaging modal (`DemoInboxModal.jsx`) is a client-side prototype demonstration without backing PostgreSQL tables or REST endpoints. | `frontend/src/components/ui/DemoInboxModal.jsx` | Messages do not persist across database sessions. | If messaging is kept in scope, create `conversations` and `messages` tables; otherwise deprecate modal. | Verified by source inspection |

---

## 2. Resolved Issues

The following issues were reported in earlier review iterations and have now been **fully resolved and verified**:

| ID | Issue | Resolution & Evidence | Verification |
|---|---|---|---|
| KI-001 | Sign-in does not check credentials; visitors could assume any role without authentication. | **Resolved**: Implemented real bcrypt password hashing, `POST /api/v1/auth/login`, and JWT access token issuance in `backend/app/routers/auth.py`. Integrated into `frontend/src/pages/AuthPage.jsx`. | Verified by automated tests (10 auth tests pass) & runtime execution |
| KI-002 | No server-side authorization; route guards ran only in browser. | **Resolved**: Implemented FastAPI dependency `require_roles("ADMIN", "STAFF")` and student ownership checking across all routers in `backend/app/core/deps.py`. | Verified by automated tests (403/401 tests pass) |
| KI-005 | Application submission did not enforce eligibility or deadlines on server. | **Resolved**: Enforced server-side via PostgreSQL trigger `trg_applications_validate_insert` and `backend/app/routers/applications.py`. Ineligible or duplicate submissions reject with HTTP 422/409. | Verified by automated tests (`test_applications_interviews.py`) |
| KI-007 | Status vocabularies differed between prototype and SQL. | **Resolved**: Unified on SQL source of truth (`APPLIED`, `SHORTLISTED`, `INTERVIEW`, `SELECTED`, `REJECTED`, `WITHDRAWN`). Enriched `MyApplicationOut` and `OfferOut` to provide matching schema aliases. | Verified by database query & automated tests |
| KI-008 | Two eligibility algorithms disagreed (client formula vs SQL). | **Resolved**: SQL function `fn_is_eligible` and `fn_eligibility_check` are exposed via `/api/v1/jobs/{id}/eligibility` and `/jobs/{id}/eligible-students`. | Verified by automated tests |
| KI-009 | Analytics were hard-coded in mockApi. | **Resolved**: Implemented real materialized view `mv_placement_kpis`, `v_department_stats`, `v_company_selections` queried via `/api/v1/analytics/*` and displayed in `AdminOverview.jsx`. | Verified by automated tests & runtime execution |
| KI-010 | Offer linkage used company name string instead of foreign key ID. | **Resolved**: Database uses foreign key `offers.application_id` and `offers.job_id`, queried via JOIN in CRUD operations. | Verified by automated tests |
| KI-019 | No integration existed between frontend and backend. | **Resolved**: Core flows (`AuthPage`, `StudentOverview`, `AdminOverview`, `StudentMyApplications`, `StudentMyPlacement`, `NotificationsPage`, `ProfilePage`) are fully integrated via Axios `api.js` to FastAPI backend. | Verified by runtime execution |
| KI-020 | Nothing had been executed in review environment. | **Resolved**: Full multi-container stack (`placetrack-frontend`, `placetrack-backend`, `placetrack-db`, `placetrack-mailpit`) running live in Docker Compose; 115 tests executed and passing. | Verified live in runtime |
| KI-021 | Demo OTP was a client constant. | **Resolved**: Implemented real 6-digit cryptographic OTP generation via `fn_generate_otp`, storage in `email_otps`, verification via `fn_verify_otp`, and local SMTP dispatch to Mailpit. | Verified by runtime execution & API tests |
| KI-022 | No automated tests existed. | **Resolved**: Comprehensive test suite of **115 automated tests** in `backend/tests/` covering auth, jobs, applications, interviews, offers, placements, analytics, security, and edge cases. 100% passing. | Verified by pytest test suite |
| R-008 | ProfilePage displayed student academic fields (CGPA 8.5, backlogs) for Admin/Staff. | **Resolved**: Role-isolated `ProfilePage.jsx` into Student Academic Block vs Admin/Staff Institutional Credentials Block (System Role, Official Title, Office Unit). | Verified in frontend code & production build |
| R-009 | Admin/Staff visiting notifications received HTTP 403. | **Resolved**: Updated `/api/v1/notifications` to allow non-student access, gracefully returning `[]` without error. | Verified by automated test & runtime check |

