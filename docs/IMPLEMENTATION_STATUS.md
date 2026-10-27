# Implementation Status

Single source of truth for project maturity. Every row names a status, the evidence and what blocks the next level.

## Status legend

| Status | Meaning |
|---|---|
| **Implemented (static review)** | Code exists and was reviewed by reading it and by scripted import/API cross-checks. It was **not executed**: no build, test run or browser session has been performed in the review environment. Nothing in this project is currently "Implemented and verified by execution". |
| **Simulated in frontend** | Works only against the in-browser mock (`prototype/src/services/mockApi.js`, `localStorage`). No server, no database. |
| **Partially implemented** | Some of the behaviour exists; gaps are listed. |
| **Written, not executed** | SQL or backend code exists but was never run against PostgreSQL / uvicorn here. |
| **Planned** | Documented design only. |
| **Missing** | Required by the scope but absent. |

## Layers at a glance

| Layer | Location | State |
|---|---|---|
| React prototype (AI Studio export) | `prototype/` | Simulated in frontend; the only complete user interface |
| Docker frontend skeleton | `frontend/` | Setup page that calls `/health` and `/health/db` only |
| FastAPI backend | `backend/` | Skeleton: health endpoints, settings, DB session. No auth, models, schemas, CRUD or business routers |
| PostgreSQL schema and logic | `sql/init/` | Written, not executed: 17 tables, 7 views, 23 functions, 14 procedures, 9 triggers |
| Prototype to API/DB integration | n/a | **Not started** (no HTTP call in the prototype; no backend endpoint for any prototype feature) |

## Feature matrix

| ID | Feature | Status | Evidence (paths) | Dependency / next step |
|---|---|---|---|---|
| F-01 | Landing page (3D hero, GSAP, Lenis) | Implemented (static review) | `prototype/src/pages/LandingPage.jsx`, `components/three/*` | Run and visually check; remove unused sections |
| F-02 | Sign in by demo account | Simulated in frontend | `pages/AuthPage.jsx`, `mockApi.login` | Real credential check (INT stage 4) |
| F-03 | Student sign up, OTP step, forgot password | Simulated in frontend | `AuthPage.jsx` (fixed demo OTP), `mockApi.registerDemoAccount` | Backend OTP (`fn_generate_otp`, `fn_verify_otp` exist in SQL, unused) |
| F-04 | Demo identity switching (ADMIN, STAFF, STUDENT) | Implemented, simulated | `context/AuthContext.jsx` (`activeDemoUser`, `switchDemoAccount`), `layouts/DashboardLayout.jsx` | Remove for production |
| F-05 | Route-level role guards | Implemented (static review) | `App.jsx` `RoleProtectedRoute` | Server-side enforcement missing |
| F-06 | Action-level permissions from `ROLE_PERMISSIONS` flags | Partially implemented | `AuthContext.jsx` defines `canManage*`; no page reads them | Wire flags or delete them |
| F-07 | Shared dashboard shell (sidebar, header, search, profile menu) | Implemented (static review) | `layouts/DashboardLayout.jsx` | Responsive check |
| F-08 | Notification bell + popover | Implemented (static review) | `DashboardLayout.jsx` (portal, viewport clamp, outside click, Escape) | Browser test |
| F-09 | Global toasts | Implemented (static review) | `context/ToastContext.jsx` (fixed bottom-right) | Browser test |
| F-10 | Per-user notifications with read state | Simulated in frontend | `mockApi.pushNotification`, `getNotifications`, `markNotificationRead` (`read_by` map) | DB has `notifications` for students only |
| F-11 | Demo Inbox messaging | Simulated in frontend | `components/ui/DemoInboxModal.jsx`, `mockApi.sendMessage` and conversation methods | No DB tables; scope decision needed |
| F-12 | Student directory, CGPA verification toggle, skills update, promote, CSV export | Simulated in frontend | `pages/dashboard/StudentsPage.jsx` | CSV quoting issue (KI-015) |
| F-13 | Staff/user account management | Simulated in frontend | `UserManagementPage.jsx`, `mockApi.createUserAccount`, `toggleUserAccountStatus` | `users` table lacks staff profile fields |
| F-14 | Companies (create, edit, HR contacts) | Simulated in frontend | `CompaniesPage.jsx` | No delete in prototype |
| F-15 | Job drives (create, edit) | Simulated in frontend | `JobsPage.jsx`, `mockApi.createJob`, `updateJob` | No delete / archive in prototype |
| F-16 | Eligibility engine and match % | Implemented (static review), client-side | `services/eligibility.js` | Differs from SQL `fn_match_score` (KI-008) |
| F-17 | Apply to job | Simulated in frontend | `JobsPage.jsx`, `mockApi.applyToJob` | `applyToJob` itself does not re-check eligibility or deadline (KI-005) |
| F-18 | Application status workflow | Simulated in frontend | `mockApi.getValidApplicationTransitions`, `updateApplicationStatus`, `ApplicationsPage.jsx` | Vocabulary differs from SQL (KI-007) |
| F-19 | Interview scheduling and results | Simulated in frontend | `StaffInterviewsPage.jsx`, `StudentInterviewsPage.jsx`, `mockApi.scheduleInterview` | Missing columns in SQL (attendance, feedback, mode) |
| F-20 | Selection, offers, accept/decline | Simulated in frontend | `StaffResultsSelectionPage.jsx`, `StudentMyPlacement.jsx`, `mockApi.createOffer`, `updateOfferStatus` | SQL uses trigger + `sp_respond_to_offer` |
| F-21 | Single/dream-offer tier policy | Simulated in frontend; also Written, not executed in SQL | `mockApi._evaluateOfferPolicyForStudent`; `fn_policy_allows`, `trg_applications_create_offer` | Two implementations to reconcile |
| F-22 | Offer letter PDF and ID badge | Implemented (static review) | `utils/offerPdfGenerator.js` (jsPDF) | Browser test |
| F-23 | Admin policies editor | Partially implemented | `PlacementPoliciesPage.jsx`, `mockApi.updatePolicies` | Most policy fields are stored but never enforced (KI-006) |
| F-24 | Analytics dashboards | Partially implemented | `AnalyticsPage.jsx`, `AdminOverview.jsx`, `mockApi.getAnalytics` | Base figures are hard-coded; only some deltas are live (KI-009) |
| F-25 | Student progress, interviews, applications, settings pages | Simulated in frontend | `StudentProgressPage.jsx`, `StudentInterviewsPage.jsx`, `StudentMyApplications.jsx`, `StudentSettingsPage.jsx` | No withdraw action |
| F-26 | Contact actions (call, email, join meeting) | Implemented (static review) | `ContactActionButtons.jsx` (tel:/mailto:), `MeetingLinkButton.jsx` (validated anchor) | Real links depend on data |
| F-27 | Backend health endpoints | Written, not executed | `backend/app/routers/health.py`, `backend/tests/test_health.py` | Run pytest in Docker |
| F-28 | Backend business API (auth, students, jobs, applications, offers, analytics) | **Missing** | `backend/app/{models,schemas,crud,services,routers}` empty except health | Integration plan stages 4 to 12 |
| F-29 | SQL schema, functions, procedures, triggers, seed | Written, not executed | `sql/init/01..06` | Boot DB, run smoke tests |
| F-30 | Docker Compose stack | Written, not executed | `docker-compose.yml` | `docker compose up -d --build` |
| F-31 | Automated tests | Missing (backend: 2 health tests, unexecuted; prototype: none) | `backend/tests/` | See [TESTING.md](./TESTING.md) |
| F-32 | Documentation set | Implemented | `README.md`, `PHASES.md`, `docs/` | Keep synchronized |

## What changed since the original starter

The original starter was a health-check skeleton. The prototype added the full UI. These facts are verified by inspection of `prototype/`; they are not features of the FastAPI/PostgreSQL stack.
