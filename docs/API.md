# API Reference

The PlaceTrack API is a RESTful API powered by **FastAPI** with auto-generated OpenAPI documentation available at `/docs` and `/redoc`.

Base path: `/api/v1`

---

## 1. Implemented & Verified Backend Endpoints

Source: `backend/app/routers/`. All endpoints below are implemented, backed by SQLAlchemy 2 models and PostgreSQL 16 stored procedures/views, and verified with **115 automated tests** in `backend/tests/`.

### 1.1 Authentication (`/auth`)
| Method | Path | Role / Auth | Description | Request Body / Params | Response |
|---|---|---|---|---|---|
| POST | `/auth/login` | Public | Authenticates user credentials via bcrypt; issues JWT access token | `LoginRequest` (email, password) | `TokenResponse` (`access_token`, `token_type`, `user`) |
| GET | `/auth/me` | Authenticated | Retrieves profile of currently authenticated user | Bearer Token | `UserOut` |
| POST | `/auth/signup/request-otp` | Public | Generates 6-digit signup OTP via `fn_generate_otp` and sends via SMTP | `SignupRequestOTPIn` (roll_number, email) | `{"message": "OTP sent successfully"}` |
| POST | `/auth/signup/validate-otp` | Public | Verifies entered OTP without consuming it | `SignupValidateOTPIn` (email, otp) | `{"valid": true}` |
| POST | `/auth/signup/verify` | Public | Verifies OTP via `fn_verify_otp`, creates user account with bcrypt hash | `SignupVerifyIn` (roll_number, email, otp, password) | `TokenResponse` |
| POST | `/auth/forgot-password` | Public | Initiates password reset by issuing OTP | `ForgotPasswordIn` (email) | `{"message": "Reset OTP dispatched"}` |
| POST | `/auth/reset-password` | Public | Resets user password after verifying reset OTP | `ResetPasswordIn` (email, otp, new_password) | `{"message": "Password reset successfully"}` |

### 1.2 Students (`/students`)
| Method | Path | Role / Auth | Description | Request Body / Params | Response |
|---|---|---|---|---|---|
| GET | `/students` | ADMIN, STAFF | Paginated list of students with filters (cgpa, dept, placed) | `page`, `page_size`, `department_id`, `min_cgpa`, `placed` | `PaginatedResponse[StudentListOut]` |
| GET | `/students/me` | STUDENT | Returns authenticated student's full academic and skills profile | Bearer Token | `StudentProfileOut` |
| PATCH | `/students/me` | STUDENT | Updates own contact phone and resume link | `StudentUpdateMe` (phone, resume_url) | `StudentProfileOut` |
| GET | `/students/{id}` | ADMIN, STAFF, or Own | Get student profile by ID | Path `id` | `StudentProfileOut` |
| POST | `/students` | ADMIN, STAFF | Register new student record into roster | `StudentCreate` | `StudentOut` |
| PUT | `/students/{id}` | ADMIN, STAFF | Update student academic record (CGPA, backlogs, dept) | `StudentUpdate` | `StudentOut` |
| DELETE | `/students/{id}` | ADMIN | Remove student record | Path `id` | `{"message": "Student deleted"}` |
| POST | `/students/{id}/verify-cgpa` | ADMIN, STAFF | Mark student CGPA as CDC-verified (`sp_verify_student_cgpa`) | Path `id` | `{"message": "CGPA verified"}` |
| PUT | `/students/{id}/skills` | ADMIN, STAFF, or Own | Update student skill proficiency matrix | `list[StudentSkillUpdate]` | `list[StudentSkillOut]` |
| GET | `/students/{id}/eligible-jobs`| ADMIN, STAFF, or Own | List open drives matching student's criteria (`fn_eligible_jobs`) | Path `id` | `list[EligibleJobOut]` |
| GET | `/students/export.csv` | ADMIN, STAFF | Stream CSV export of student placement roster | None | `text/csv` |

### 1.3 Companies (`/companies`)
| Method | Path | Role / Auth | Description | Request Body / Params | Response |
|---|---|---|---|---|---|
| GET | `/companies` | Authenticated | List partner recruiting companies with tier filter | `tier`, `page`, `page_size` | `PaginatedResponse[CompanyOut]` |
| GET | `/companies/{id}` | Authenticated | Company details and HR contacts | Path `id` | `CompanyDetailOut` |
| POST | `/companies` | ADMIN, STAFF | Register new recruiting partner | `CompanyCreate` | `CompanyOut` |
| PUT | `/companies/{id}` | ADMIN, STAFF | Update company details and tier | `CompanyUpdate` | `CompanyOut` |
| DELETE | `/companies/{id}` | ADMIN | Delete company record | Path `id` | `{"message": "Company deleted"}` |
| POST | `/companies/{id}/contacts` | ADMIN, STAFF | Add HR contact person for company | `CompanyContactCreate` | `CompanyContactOut` |

### 1.4 Jobs & Recruitment Drives (`/jobs`)
| Method | Path | Role / Auth | Description | Request Body / Params | Response |
|---|---|---|---|---|---|
| GET | `/jobs` | Authenticated | List recruitment drives (filter by status, type, tier) | `status`, `job_type`, `tier`, `min_cgpa`, `page`, `page_size` | `PaginatedResponse[JobOut]` |
| GET | `/jobs/{id}` | Authenticated | Get job drive details, required skills, and eligible departments | Path `id` | `JobDetailOut` |
| POST | `/jobs` | ADMIN, STAFF | Create recruitment drive with cutoffs and criteria | `JobCreate` | `JobOut` |
| PUT | `/jobs/{id}` | ADMIN, STAFF | Update job drive details and deadlines | `JobUpdate` | `JobOut` |
| DELETE | `/jobs/{id}` | ADMIN | Delete job drive | Path `id` | `{"message": "Job deleted"}` |
| PATCH | `/jobs/{id}/archive` | ADMIN, STAFF | Archive completed job drive (`sp_archive_job`) | Path `id` | `JobOut` |
| POST | `/jobs/close-expired` | ADMIN, STAFF | Bulk close drives past deadline (`sp_close_expired_jobs`) | None | `CloseExpiredOut` |
| GET | `/jobs/{id}/eligible-students` | ADMIN, STAFF | List students eligible for this drive (`fn_eligible_students`) | Path `id` | `list[EligibleStudentOut]` |
| GET | `/jobs/{id}/eligibility` | Authenticated | Check specific student's eligibility (`fn_eligibility_check`) | `student_id` | `EligibilityCheckOut` |

### 1.5 Applications (`/applications`)
| Method | Path | Role / Auth | Description | Request Body / Params | Response |
|---|---|---|---|---|---|
| GET | `/applications` | ADMIN, STAFF | List all applications with status/drive filters | `status`, `job_id`, `student_id`, `page`, `page_size` | `PaginatedResponse[ApplicationOverviewOut]` |
| GET | `/applications/mine` | STUDENT | List authenticated student's applications with round status | Bearer Token | `list[MyApplicationOut]` |
| POST | `/applications` | Authenticated | Submit application (`sp_apply_to_job` + trigger validation) | `ApplicationCreate` (job_id, student_id) | `ApplicationOut` |
| GET | `/applications/{id}` | ADMIN, STAFF, or Own | Get application details and round status history | Path `id` | `ApplicationDetailOut` |
| PATCH | `/applications/{id}/status` | ADMIN, STAFF | Transition status (`sp_update_application_status`) | `StatusUpdateIn` (status, remarks) | `ApplicationOut` |
| POST | `/applications/bulk-status` | ADMIN, STAFF | Bulk status promotion (`sp_bulk_update_status`) | `BulkStatusUpdateIn` | `BulkStatusUpdateOut` |
| POST | `/applications/{id}/withdraw` | STUDENT (Own) | Withdraw application (`sp_withdraw_application`) | Path `id` | `ApplicationOut` |
| GET | `/applications/{id}/history` | ADMIN, STAFF, or Own | Full audit trail from `application_status_history` | Path `id` | `list[ApplicationHistoryOut]` |

### 1.6 Interviews (`/applications/{id}/interviews` and `/interviews`)
| Method | Path | Role / Auth | Description | Request Body / Params | Response |
|---|---|---|---|---|---|
| GET | `/applications/{id}/interviews` | Authenticated (Own/Staff) | List scheduled rounds for application | Path `id` | `list[InterviewOut]` |
| POST | `/applications/{id}/interviews` | ADMIN, STAFF | Schedule interview round (`sp_schedule_interview`) | `InterviewScheduleIn` | `InterviewOut` |
| PATCH | `/interviews/{id}` | ADMIN, STAFF | Record round outcome (`sp_record_interview_result`) | `InterviewResultIn` | `InterviewOut` |

### 1.7 Offers & Placements (`/offers` and `/placements`)
| Method | Path | Role / Auth | Description | Request Body / Params | Response |
|---|---|---|---|---|---|
| GET | `/offers` | ADMIN, STAFF | List offers with company tier & CTC breakdown | `status`, `student_id`, `company_id`, `limit`, `offset` | `list[OfferOut]` |
| GET | `/offers/mine` | STUDENT | Retrieve offers received by authenticated student | Bearer Token | `list[OfferOut]` |
| PATCH | `/offers/{id}/breakdown` | ADMIN, STAFF | Set CTC breakdown (`sp_set_offer_breakdown`) | `OfferBreakdownUpdate` (base, bonus, esop) | `OfferOut` |
| POST | `/offers/{id}/accept` | STUDENT (Own) | Accept offer with single/dream policy (`sp_respond_to_offer`) | Path `id` | `OfferOut` |
| POST | `/offers/{id}/decline` | STUDENT (Own) | Decline offer (`sp_respond_to_offer(..., FALSE)`) | Path `id` | `OfferOut` |
| GET | `/placements` | ADMIN, STAFF | List confirmed student placements from `v_placement_summary` | `department_id`, `company_id`, `limit`, `offset` | `list[PlacementOut]` |
| GET | `/placements/mine` | STUDENT | Get student's confirmed placement record | Bearer Token | `PlacementOut` |
| GET | `/placements/export.csv` | ADMIN, STAFF | Stream CSV export of confirmed placements | None | `text/csv` |

### 1.8 Notifications (`/notifications`)
| Method | Path | Role / Auth | Description | Request Body / Params | Response |
|---|---|---|---|---|---|
| GET | `/notifications` | Authenticated | Get notifications (returns `[]` for non-students) | `unread` (optional bool) | `list[NotificationOut]` |
| POST | `/notifications/read-all` | Authenticated | Mark notifications as read (`sp_mark_notifications_read`) | None | `{"message": "Notifications marked as read"}` |

### 1.9 Analytics (`/analytics`)
| Method | Path | Role / Auth | Description | Request Body / Params | Response |
|---|---|---|---|---|---|
| GET | `/analytics/overview` | ADMIN, STAFF | High-level placement KPIs from `mv_placement_kpis` | None | `PlacementKPIsOut` |
| GET | `/analytics/departments` | ADMIN, STAFF | Department placement statistics from `v_department_stats` | None | `list[DepartmentStatsOut]` |
| GET | `/analytics/companies` | ADMIN, STAFF | Company selection metrics from `v_company_selections` | None | `list[CompanySelectionOut]` |
| GET | `/analytics/packages` | ADMIN, STAFF | Distribution of packages across CTC tiers | None | `list[PackageRangeItem]` |
| GET | `/analytics/funnel` | ADMIN, STAFF | Recruitment pipeline conversion funnel | None | `list[FunnelItem]` |
| GET | `/analytics/top-students` | ADMIN, STAFF | Top placed students by CTC package | None | `list[TopStudentPlacementOut]` |
| GET | `/analytics/nirf-report.csv` | ADMIN, STAFF | Download official NIRF accreditation CSV report | None | `text/csv` |
| POST | `/analytics/refresh` | ADMIN, STAFF | Refresh materialized view (`sp_refresh_analytics`) | None | `{"message": "Analytics refreshed successfully"}` |

### 1.10 System Health (`/health`)
| Method | Path | Role / Auth | Description | Response |
|---|---|---|---|---|
| GET | `/health`, `/api/v1/health` | Public | Container liveness check | `{"status": "ok", "service": "placetrack-backend"}` |
| GET | `/health/db`, `/api/v1/health/db` | Public | PostgreSQL connectivity and base table count | `{"status": "ok", "database": "connected", "public_tables": 17}` |

---

## 2. Frontend Integration Status

| Page | Integration Status | Data Source |
|---|---|---|
| `AuthPage.jsx` | **Integrated** | Calls real `/api/v1/auth/login`, `/auth/signup/*`, `/auth/forgot-password` via `authService.js` |
| `StudentOverview.jsx` | **Integrated** | Calls real `/jobs`, `/applications/mine`, `/offers/mine` via real services |
| `AdminOverview.jsx` | **Integrated** | Calls real `/analytics/overview`, `/jobs`, `/students` via real services |
| `StudentMyApplications.jsx`| **Integrated** | Calls real `/applications/mine`, `/applications/{id}/withdraw` |
| `StudentMyPlacement.jsx` | **Integrated** | Calls real `/offers/mine`, `/offers/{id}/accept`, `/offers/{id}/decline` |
| `NotificationsPage.jsx` | **Integrated** | Calls real `/notifications`, `/notifications/read-all` via `notificationsService.js` |
| `ProfilePage.jsx` | **Integrated** | Calls real `/students/me`, `/students/me/skills` for students; displays isolated institutional credentials for Admin/Staff |
| `StaffInterviewsPage.jsx` | Partial (In transition) | Uses `mockApi.js` state for interview scheduling in UI |
| `StaffResultsSelectionPage.jsx`| Partial (In transition) | Uses `mockApi.js` state for result selection in UI |
| `PlacementPoliciesPage.jsx` | Partial (In transition) | Uses `mockApi.js` state for local policy adjustments |
| `UserManagementPage.jsx` | Partial (In transition) | Uses `mockApi.js` state for staff user list |
| `DemoInboxModal.jsx` | Simulated | Client-side demo conversation modal (no backing DB table) |

---

## 3. Error Handling and Status Codes

- `400 Bad Request`: Invalid parameter, mismatched state, or missing required attributes.
- `401 Unauthorized`: Missing, invalid, or expired Bearer JWT token.
- `403 Forbidden`: Authenticated user lacks required role (`require_roles`) or attempts unauthorized access to another student's record.
- `404 Not Found`: Entity (student, job, application, offer) does not exist.
- `409 Conflict`: Unique constraint violation (e.g. duplicate application for the same job).
- `422 Unprocessable Content`: Domain/trigger validation error (e.g. ineligible application, illegal status jump). Formatted cleanly via `AppException`.
- `500 Internal Server Error`: Unexpected runtime error; database schema details and stack traces are suppressed.

