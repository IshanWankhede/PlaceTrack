# Requirements and Traceability

Status legend: see [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md). Paths are relative to the repository root. *Test evidence* is "none" throughout because no automated test covers these features and nothing was executed in review (see [TESTING.md](./TESTING.md)). Feature-to-code chains: [TRACEABILITY.md](./TRACEABILITY.md).

## 1. Functional requirements

| ID | Requirement | Roles | Status | Responsible source | Database structure | Test evidence |
|---|---|---|---|---|---|---|
| FR-AUTH-001 | Sign in with a demo account | ALL | Simulated in frontend | prototype/src/pages/AuthPage.jsx; services/mockApi.js login | users (not connected) | none |
| FR-AUTH-002 | Student sign up with e-mail OTP and password reset | STUDENT | Simulated in frontend (fixed demo OTP) | AuthPage.jsx; mockApi.registerDemoAccount | email_otps, fn_generate_otp, fn_verify_otp (not connected) | none |
| FR-AUTH-003 | Real credential verification and token issue | ALL | Missing | backend/app has no auth router | users.password_hash | none |
| FR-AUTH-004 | Role-guarded routes | ALL | Implemented (static review) | prototype/src/App.jsx RoleProtectedRoute |  | none |
| FR-AUTH-005 | Server-enforced authorization | ALL | Missing | - | users.role | none |
| FR-AUTH-006 | Demo identity switching (ADMIN, STAFF, STUDENT) | ALL (demo) | Implemented (static review), simulated | context/AuthContext.jsx; layouts/DashboardLayout.jsx |  | none |
| FR-STU-001 | Student directory with filters and export | ADMIN, STAFF | Simulated in frontend | pages/dashboard/StudentsPage.jsx | students, v_student_status | none |
| FR-STU-002 | Student profile and skills editing | STUDENT, STAFF, ADMIN | Simulated in frontend | pages/dashboard/ProfilePage.jsx; mockApi.updateStudentProfile, updateStudentSkills | students, student_skills | none |
| FR-STU-003 | CDC CGPA verification | ADMIN, STAFF | Simulated in frontend | StudentsPage.jsx toggleStudentCgpaVerified | students.cgpa_verified, sp_verify_student_cgpa | none |
| FR-STU-004 | Promote selected students to next round in bulk | ADMIN, STAFF | Simulated in frontend | StudentsPage.jsx promoteStudentsToNextRound | sp_bulk_update_status | none |
| FR-STU-005 | Staff and user account management | ADMIN | Simulated in frontend | pages/dashboard/UserManagementPage.jsx | users (no staff profile table) | none |
| FR-CMP-001 | Company create / edit with HR contacts | ADMIN, STAFF | Simulated in frontend | pages/dashboard/CompaniesPage.jsx | companies, company_contacts | none |
| FR-JOB-001 | Create and edit job drives with cutoffs and package range | ADMIN, STAFF | Simulated in frontend | pages/dashboard/JobsPage.jsx; mockApi.createJob, updateJob | jobs, job_skills, job_departments | none |
| FR-JOB-002 | Students browse drives with eligibility checklist and match % | STUDENT | Simulated in frontend | JobsPage.jsx; services/eligibility.js | fn_eligible_jobs, fn_eligibility_check | none |
| FR-ELG-001 | Eligibility from CGPA, backlogs, department, skills, verification | ALL | Implemented (static review) | services/eligibility.js | fn_is_eligible (written, not executed) | none |
| FR-ELG-002 | Eligible-students list per drive | ADMIN, STAFF | Simulated in frontend | pages/dashboard/StaffEligibleStudentsPage.jsx | fn_eligible_students | none |
| FR-APP-001 | Apply to an eligible drive | STUDENT | Simulated in frontend (UI-gated, KI-005) | JobsPage.jsx; mockApi.applyToJob | sp_apply_to_job + trigger | none |
| FR-APP-002 | Application status workflow with valid transitions | ADMIN, STAFF | Simulated in frontend | mockApi.getValidApplicationTransitions; pages/dashboard/ApplicationsPage.jsx | applications + trg_applications_validate_status (different vocabulary) | none |
| FR-APP-003 | Student tracks own applications | STUDENT | Simulated in frontend | pages/dashboard/StudentMyApplications.jsx, StudentProgressPage.jsx | applications, application_status_history | none |
| FR-APP-004 | Student withdraws an application | STUDENT | Missing in prototype; SQL supports WITHDRAWN | - | applications.status WITHDRAWN, sp_withdraw_application | none |
| FR-INT-001 | Schedule, update, cancel interviews | ADMIN, STAFF | Simulated in frontend | StaffInterviewsPage.jsx; mockApi.scheduleInterview, updateInterview, cancelInterview | interviews, sp_schedule_interview | none |
| FR-INT-002 | Student views interview schedule with meeting link | STUDENT | Simulated in frontend | StudentInterviewsPage.jsx; components/ui/MeetingLinkButton.jsx | interviews.meeting_link | none |
| FR-OFR-001 | Release offers from selection | ADMIN, STAFF | Simulated in frontend | StaffResultsSelectionPage.jsx, PlacementsPage.jsx; mockApi.createOffer | offers, trg_applications_create_offer | none |
| FR-OFR-002 | Student accepts or declines an offer | STUDENT | Simulated in frontend | StudentMyPlacement.jsx; mockApi.updateOfferStatus | sp_respond_to_offer | none |
| FR-OFR-003 | Single-offer / dream-offer policy | ALL | Simulated in frontend; SQL Written, not executed | mockApi._evaluateOfferPolicyForStudent | fn_policy_allows | none |
| FR-OFR-004 | Offer letter PDF | STUDENT | Implemented (static review) | utils/offerPdfGenerator.js |  | none |
| FR-PLC-001 | Placements and offers list | ADMIN, STAFF | Simulated in frontend | PlacementsPage.jsx | placements, placement_summary | none |
| FR-NTF-001 | Per-user, per-role notifications with read state | ALL | Simulated in frontend | mockApi.pushNotification, getNotifications, markNotificationRead; NotificationsPage.jsx | notifications (students only) | none |
| FR-NTF-002 | Bell popover within viewport; global toasts | ALL | Implemented (static review) | layouts/DashboardLayout.jsx; context/ToastContext.jsx |  | none |
| FR-MSG-001 | Demo Inbox with permitted contacts and message history | ALL | Simulated in frontend | components/ui/DemoInboxModal.jsx; mockApi conversation methods | none (no tables) | none |
| FR-ANL-001 | Admin analytics (rates, departments, packages, funnel) | ADMIN | Partially implemented (static base data, KI-009) | AnalyticsPage.jsx, AdminOverview.jsx; mockApi.getAnalytics | v_department_stats, v_company_selections, mv_placement_kpis | none |
| FR-POL-001 | Administrator edits placement policies | ADMIN | Partially implemented (not enforced, KI-006) | PlacementPoliciesPage.jsx; mockApi.getPolicies, updatePolicies | none (no policies table) | none |
| FR-API-001 | Backend health endpoints | - | Written, not executed | backend/app/routers/health.py |  | none |
| FR-API-002 | Backend business API for all features above | - | Missing | - |  | none |

## 2. Non-functional requirements

| ID | Requirement | Status | Source |
|---|---|---|---|
| NFR-SEC-001 | Passwords hashed (bcrypt); secrets only in environment variables | Planned (SQL seed uses pgcrypto bcrypt; backend auth missing) | sql/init/06_seed.sql; .env.example |
| NFR-SEC-002 | Server-side authorization for every endpoint | Missing | - |
| NFR-SEC-003 | Input validation at the API boundary (Pydantic) | Planned | backend/app/schemas (empty) |
| NFR-SEC-004 | No secrets committed; `.env` ignored | Implemented (static review) | .gitignore |
| NFR-DAT-001 | Foreign keys, CHECK constraints and indexes enforced in the database | Written, not executed | sql/init/01_ddl.sql |
| NFR-DAT-002 | Multi-step operations atomic (status change plus offer) | Written, not executed | triggers and procedures in sql/init |
| NFR-UX-001 | Responsive dashboard (tablet and up) with loading and empty states | Partially implemented (EmptyState and Skeleton components exist but are unused) | prototype/src/components/ui |
| NFR-UX-002 | Notification popover and toasts do not overflow the viewport | Implemented (static review) | DashboardLayout.jsx, ToastContext.jsx |
| NFR-PERF-001 | Standard API calls under 300 ms locally | Planned (no API yet) | - |
| NFR-MNT-001 | Layered backend: routers, schemas, crud/services, models | Planned (folders exist, empty) | backend/app/* |
| NFR-MNT-002 | Automated tests for core resources | Missing | backend/tests (2 health tests, unexecuted) |
| NFR-OPS-001 | One-command local environment with live reload | Written, not executed | docker-compose.yml |

## 3. Data requirements

- Entities and constraints: [DB_SCHEMA.md](./DB_SCHEMA.md); diagram: [ER_DIAGRAM.md](./ER_DIAGRAM.md).
- The prototype data model (students, jobs, applications, interviews, offers, companies, notifications, conversations, policies, staff accounts, student settings) is larger than the SQL schema; gaps are tabulated in DB_SCHEMA.md.

## 4. Integration requirements

- IR-1: one agreed status/value vocabulary between UI, API and SQL.
- IR-2: the API returns the same field names the prototype services use (snake_case).
- IR-3: eligibility computed in one place (database function, exposed by the API).
- IR-4: remove the mock store only after API parity is tested.

Plan: [INTEGRATION_PLAN.md](./INTEGRATION_PLAN.md).

## 5. Testing requirements

See [TESTING.md](./TESTING.md).

