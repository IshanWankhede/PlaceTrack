# Code-to-Documentation Traceability Matrix

Authoritative end-to-end traceability chain per system feature:
**Feature -> Frontend Route -> Component -> Frontend Service -> Backend API Endpoint -> Database Objects -> Verified Test Evidence**

All active frontend paths refer to `frontend/src/`. All backend paths refer to `backend/app/`.

| Feature | Frontend Route | Active Component | Active Service | Backend API Endpoint | Database Objects | Verified Test Evidence |
|---|---|---|---|---|---|---|
| **Landing & Visuals** | `/` | `LandingPage.jsx`, `three/*` | Static / Scene hooks | None (Static landing) | None | Vite build (clean bundle) |
| **Authentication & Tokens** | `/login` | `LoginPage.jsx`, `AuthLayout.jsx` | `authService.login()` | `POST /api/v1/auth/login` | `users.password_hash` | Pytest `test_auth.py` (token issuance, bcrypt validation) |
| **Student OTP Signup** | `/signup` | `SignupPage.jsx` | `authService.requestOtp()`, `authService.verifyOtp()` | `POST /api/v1/auth/signup/request-otp`, `verify` | `email_otps`, `fn_generate_otp`, `fn_verify_otp` | Pytest `test_auth.py`, Mailpit integration |
| **Route Authorization** | All `/dashboard/*` | `RoleProtectedRoute.jsx` | Client navigation guard | `GET /api/v1/auth/me` | `users.role` | Pytest `test_edge_cases_security.py` |
| **Profile & Role Isolation** | `/dashboard/profile` | `ProfilePage.jsx` | `authService.getMe()`, `studentsService` | `GET /api/v1/auth/me`, `GET /students/{id}` | `users`, `students`, `departments` | Manual & API verification: Admin/Staff omit CGPA/backlogs; Student displays academic fields |
| **Student Directory** | `/dashboard/students` | `StudentsPage.jsx` | `studentsService.getStudents()` | `GET /api/v1/students` | `students`, `v_student_status`, `departments` | Pytest `test_students.py` |
| **CGPA Verification** | `/dashboard/students` | `StudentsPage.jsx` | `studentsService.verifyCgpa()` | `POST /api/v1/students/{id}/verify-cgpa` | `students.cgpa_verified`, `sp_verify_student_cgpa` | Pytest `test_students.py` |
| **Companies & Contacts** | `/dashboard/companies` | `CompaniesPage.jsx` | `companiesService.getCompanies()` | `GET /api/v1/companies`, `POST /companies` | `companies`, `company_contacts` | Pytest `test_companies.py` |
| **Job Drives Management** | `/dashboard/jobs` | `JobsPage.jsx` | `jobsService.getJobs()`, `jobsService.createJob()` | `GET /api/v1/jobs`, `POST /jobs` | `jobs`, `job_skills`, `job_departments` | Pytest `test_jobs.py` |
| **Student Drive Discovery** | `/dashboard/drives` | `StudentJobDrives.jsx` | `jobsService.getJobs()`, `getEligibleJobs()` | `GET /api/v1/jobs`, `GET /jobs/{id}` | `jobs`, `fn_is_eligible`, `fn_match_score` | Pytest `test_jobs.py` |
| **Drive Eligibility Evaluation** | `/dashboard/eligible-students` | `StaffEligibleStudentsPage.jsx` | `jobsService.getEligibleStudents()` | `GET /api/v1/jobs/{id}/eligible-students` | `fn_eligible_students`, `students`, `departments` | Pytest `test_jobs.py` |
| **Drive Application** | `/dashboard/jobs` | `JobsPage.jsx` | `applicationsService.applyToJob()` | `POST /api/v1/applications` | `applications`, `trg_applications_validate_insert` | Pytest `test_applications.py`, trigger invariant test |
| **Student Applications Tracker** | `/dashboard/applications` | `StudentMyApplications.jsx` | `applicationsService.getMyApplications()` | `GET /api/v1/applications/mine` | `applications`, `jobs`, `companies`, `interviews` | Pytest `test_applications.py`, live API smoke test (HTTP 200) |
| **Application Status Pipeline** | `/dashboard/applications` | `ApplicationsPage.jsx` | `applicationsService.updateStatus()` | `PATCH /api/v1/applications/{id}/status` | `applications`, `trg_applications_validate_status` | Pytest `test_applications.py` |
| **Interview Scheduling** | `/dashboard/interviews` | `StaffInterviewsPage.jsx` (transitional) | `interviewsService` / fallback | `POST /api/v1/applications/{id}/interviews` | `interviews`, `sp_schedule_interview` | Pytest `test_interviews.py` |
| **Student Interviews & Links** | `/dashboard/my-interviews` | `StudentInterviewsPage.jsx` | `interviewsService` / fallback | `GET /api/v1/applications/{id}/interviews` | `interviews.meeting_link` | Pytest `test_interviews.py` |
| **Offer Acceptance & Upgrades** | `/dashboard/placements` | `StudentMyPlacement.jsx` | `offersService.acceptOffer()`, `declineOffer()` | `POST /api/v1/offers/{id}/accept`, `decline` | `offers`, `placements`, `sp_respond_to_offer` | Pytest `test_offers.py`, tier upgrade rejection test |
| **Student Placement View** | `/dashboard/placements` | `StudentMyPlacement.jsx` | `offersService.getMyOffers()`, `placementsService` | `GET /api/v1/offers/mine`, `GET /placements/mine` | `offers`, `placements`, `companies` | Pytest `test_offers.py`, `test_placements.py`, smoke test |
| **Placement Records & CSV** | `/dashboard/placements` | `PlacementsPage.jsx` | `placementsService.getPlacements()` | `GET /api/v1/placements`, `export.csv` | `placements`, `placement_summary` | Pytest `test_placements.py` |
| **In-App Notifications** | `/dashboard/notifications` | `NotificationsPage.jsx`, `DashboardLayout.jsx` | `notificationsService.getNotifications()` | `GET /api/v1/notifications` | `notifications`, `trg_applications_notify` | Pytest `test_notifications.py` (HTTP 200 on all roles) |
| **Placement Analytics & KPIs** | `/dashboard/analytics`, `/dashboard` | `AdminOverview.jsx`, `AnalyticsPage.jsx` | `analyticsService.getOverview()`, `getDepartmentStats()` | `GET /api/v1/analytics/overview`, `departments`, `funnel` | `mv_placement_kpis`, `v_department_stats`, `v_company_selections` | Pytest `test_analytics.py`, live SQL query |
| **User & Staff Management** | `/dashboard/user-management` | `UserManagementPage.jsx` | `mockApi.js` (transitional) | `GET /api/v1/students`, `/users` | `users`, `students` | Pytest `test_students.py` |
| **Placement Policies** | `/dashboard/policies` | `PlacementPoliciesPage.jsx` | `mockApi.js` (transitional) | Stored procedures / SQL triggers | `fn_policy_allows`, `trg_applications_create_offer` | SQL procedural execution in `06_seed.sql` |
| **Infrastructure Health Probes** | Root & API paths | Container probes & UI health indicator | Direct HTTP GET probe | `GET /health`, `/api/v1/health`, `/api/v1/health/db` | PostgreSQL active connection pool | Pytest `test_health.py`, host curl verification |
