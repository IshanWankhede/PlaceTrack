# Frontend and Backend Integration Plan

Goal: replace the prototype's in-browser mock layer with the FastAPI + PostgreSQL stack **without changing the approved UI**. **Do not start before the prototype is reviewed and approved.** Today: the prototype makes no HTTP call, the backend exposes only health endpoints, and the SQL scripts have not been executed (KI-019, KI-020).

Method: keep each `mockApi` method name and its snake_case payload as the contract; swap the implementation per stage behind a thin `services/api` module, flag by flag, so the UI never changes.

| # | Stage | Relevant files | Backend / database needed | Dependencies | Acceptance criteria | Risks | Test strategy |
|---|---|---|---|---|---|---|---|
| 1 | Inventory and stabilize mock services | `prototype/src/services/mockApi.js`, `eligibility.js` | none | review done ([PROTOTYPE_AUDIT.md](./PROTOTYPE_AUDIT.md)) | Method list frozen; unused code decided (KI-012) | scope creep | unit tests for eligibility and transitions |
| 2 | Define shared data contracts and one vocabulary | [DB_SCHEMA.md](./DB_SCHEMA.md) mismatch table | decisions: statuses (UNDER_REVIEW, ASSESSMENT, OFFER_*, WITHDRAWN, EXPIRED), casing, round types, tier names | stage 1 | Written contract (OpenAPI or JSON schema) approved | rework if decided late | contract review |
| 3 | Align frontend models with backend schemas | `mockApi.js` seed data; `sql/init/01_ddl.sql` | missing tables/columns: messaging, policies, staff profile, settings, interview attendance/feedback, offer joining date | stage 2 | Seed data validates against the contract | schema churn | schema validation script |
| 4 | Authentication | `AuthContext.jsx`, `AuthPage.jsx`; `backend/app/routers`, `core/security` | `users`, `email_otps`, `fn_generate_otp`, `fn_verify_otp`; Mailpit | 2 | Login returns a JWT; wrong password rejected; OTP works; demo selector hidden in production | token storage mistakes | API tests + manual |
| 5 | Server-enforced authorization | `App.jsx` guards; FastAPI dependencies | role and ownership checks per endpoint | 4 | STUDENT gets 403 on staff routes and 404 on other students' data (KI-002) | forgetting one endpoint | role matrix tests |
| 6 | Replace reads | pages calling `getStudents`, `getJobs`, `getCompanies`, ... | GET endpoints for students, companies, jobs, applications, offers | 5 | Pages render from API; loading/empty/error states shown (use `Skeleton`, `EmptyState`) | N+1 calls | integration tests |
| 7 | Replace writes | create/update calls in pages | POST/PUT/PATCH endpoints | 6 | Persisted across reload and across browsers | validation drift | integration tests |
| 8 | Job drives and eligibility | `JobsPage.jsx`, `StaffEligibleStudentsPage.jsx`, `eligibility.js` | `fn_eligibility_check`, `fn_eligible_jobs`, `fn_eligible_students`; endpoints | 7 | UI shows the database result; client formula removed (KI-008) | different percentages | compare against acceptance cases |
| 9 | Applications and status transitions | `ApplicationsPage.jsx`, `StudentMyApplications.jsx` | apply, status, bulk, withdraw procedures and triggers | 8 | Illegal moves return 422 with message; duplicates 409 (KI-005, KI-007) | vocabulary mapping | lifecycle tests |
| 10 | Interviews, results, offers, placements | `StaffInterviewsPage.jsx`, `StaffResultsSelectionPage.jsx`, `StudentMyPlacement.jsx`, `PlacementsPage.jsx` | interview procedures, `offers`, `sp_respond_to_offer`, placements | 9 | Accepting creates or upgrades placement; tier policy enforced by DB | two policy implementations | scenario tests (accept, decline, upgrade) |
| 11 | Notifications | `DashboardLayout.jsx`, `NotificationsPage.jsx` | extend `notifications` to all roles with per-user read state, or add a read-receipt table | 7 | Student notifications invisible to others; unread counts per user | polling load | API tests |
| 12 | Messaging (only if approved) | `DemoInboxModal.jsx` | new `conversations`, `conversation_participants`, `messages` tables | scope decision | Participant rules enforced server-side | scope creep, privacy | API tests |
| 13 | Loading, empty, success, error states | all pages | API error format | 6 to 11 | No unhandled promise; consistent toasts | inconsistency | UI review |
| 14 | Integration tests | `backend/tests`, new frontend tests | test database fixtures | 6 to 12 | Suite green in Docker | slow tests | CI later |
| 15 | Verify persistence and access controls | whole app | all | 14 | Manual pass of [TESTING.md](./TESTING.md) smoke list against the API | gaps found late | manual + automated |
| 16 | Remove obsolete mock-only code | `mockApi.js`, `AuthContext` demo parts, unused components | none | 15 | No `mockApi` imports remain; no demo selector; bundle smaller | removing something still used | build + tests |

Cross-cutting rules: the database stays the source of truth for eligibility, transitions and policy; any new rule goes into SQL first; the API only translates and authorizes.
