# API

Three different things are documented here. Do not confuse them.

1. [Implemented backend endpoints](#1-implemented-backend-endpoints) (FastAPI, `backend/`)
2. [Frontend mock service methods](#frontend-mock-service-methods-not-http-endpoints) (prototype, not HTTP)
3. [Planned API](#3-planned-api) (design only)

## 1. Implemented backend endpoints

Source: `backend/app/main.py`, `backend/app/routers/health.py`. **Written, not executed** (no uvicorn or pytest run in review). The health router is mounted twice: at the root and under `/api/v1`.

| Method | Path | Purpose | Auth | Params / body | Response | Errors |
|---|---|---|---|---|---|---|
| GET | `/health`, `/api/v1/health` | Liveness | none | none | `{"status": "ok", "service": "placetrack-backend"}` | none defined |
| GET | `/health/db`, `/api/v1/health/db` | Database connectivity and table count | none | none | `{"status": "ok", "database": "connected", "public_tables": <int>}` (counts base tables in schema `public`; 17 expected after `sql/init` runs) | Unhandled exception (HTTP 500) if the database is unreachable |

Other facts: CORS allows origins from the `CORS_ORIGINS` setting; interactive docs at `/docs` (FastAPI default). There are **no** authentication, user, student, job, application, interview, offer, placement, notification or analytics endpoints, and no request/response schemas.

## Frontend mock service methods (not HTTP endpoints)

Defined in `prototype/src/services/mockApi.js` (object `mockApi`, 51 async methods) and `prototype/src/services/eligibility.js`. They read and write module-level arrays persisted in `localStorage`; no network is involved.

| Group | Methods |
|---|---|
| Auth / accounts | `login`, `registerDemoAccount`, `getDemoAccounts`, `getStaffAccounts`, `createUserAccount`, `updateUserAccount`, `toggleUserAccountStatus`, `resetDemoData` |
| Students | `getStudents`, `getStudentById`, `updateStudentProfile`, `updateStudentSkills`, `toggleStudentCgpaVerified`, `promoteStudentsToNextRound`, `getStudentSettings`, `updateStudentSettings` |
| Companies / jobs | `getCompanies`, `createCompany`, `updateCompany`, `getJobs`, `getJobById`, `createJob`, `updateJob` |
| Applications | `getApplications`, `getApplicationById`, `applyToJob`, `updateApplicationStatus`, `getValidApplicationTransitions` |
| Interviews | `getInterviews`, `scheduleInterview`, `updateInterview`, `cancelInterview` |
| Offers / placements | `getOffers`, `getPlacements`, `createOffer`, `updateOfferStatus`, `updateOfferRecord` |
| Policies / analytics | `getPolicies`, `updatePolicies`, `getAnalytics` |
| Notifications | `getNotifications`, `markNotificationRead`, `markNotificationsRead`, `sendNotification` |
| Messaging | `getPermittedMessagingContacts`, `openOrCreateConversation`, `getConversations`, `sendMessage`, `markConversationRead` |

(All names above were checked against the source; two internal helpers, `_enrichApplication` and `_evaluateOfferPolicyForStudent`, are not listed. Four methods are never called from UI code: `getApplicationById`, `getDemoAccounts`, `getJobById`, `getStudentById`.)

## 3. Planned API

Not implemented. Base path `/api/v1`. Status of every row: **Planned**. Error mapping: SQL `RAISE EXCEPTION` -> 422 with the message, unique violation -> 409, missing -> 404, no/invalid token -> 401, wrong role -> 403. Packages in LPA.

| Area | Planned endpoints (summary) | Database objects it would call |
|---|---|---|
| Auth | `POST /auth/login`, `GET /auth/me`, `POST /auth/signup/request-otp`, `POST /auth/signup/verify`, `POST /auth/forgot-password`, `POST /auth/reset-password` | `users`, `fn_find_student_for_signup`, `fn_generate_otp`, `fn_verify_otp` |
| Departments, skills | CRUD | `departments`, `skills` |
| Students | `GET/POST /students`, `GET/PUT/DELETE /students/{id}`, `PUT /students/{id}/skills`, `PATCH /students/{id}/verify-cgpa`, `PATCH /students/me`, `GET /students/export.csv`, `GET /students/{id}/eligible-jobs` | `students`, `student_skills`, `v_student_status`, `sp_verify_student_cgpa`, `fn_eligible_jobs` |
| Companies | CRUD plus `/companies/{id}/contacts`, `/companies/{id}/history` | `companies`, `company_contacts`, `v_company_selections` |
| Jobs | CRUD, `GET /jobs/{id}/eligible-students`, `GET /jobs/{id}/eligibility?student_id=`, `PATCH /jobs/{id}/archive`, `POST /jobs/close-expired` | `jobs`, `job_skills`, `job_departments`, `fn_eligible_students`, `fn_eligibility_check`, `sp_archive_job`, `sp_close_expired_jobs` |
| Applications | `POST /applications`, `GET /applications`, `GET /applications/mine`, `PATCH /applications/{id}/status`, `POST /applications/bulk-status`, `POST /applications/{id}/withdraw`, `GET /applications/{id}/history` | `sp_apply_to_job`, `sp_update_application_status`, `sp_bulk_update_status`, `sp_withdraw_application`, `application_status_history` |
| Interviews | `GET/POST /applications/{id}/interviews`, `PATCH /applications/{id}/interviews/{round}` | `sp_schedule_interview`, `sp_record_interview_result` |
| Offers | `GET /offers`, `GET /offers/mine`, `PATCH /offers/{id}/breakdown`, `POST /offers/{id}/accept`, `POST /offers/{id}/decline` | `offers`, `v_offer_overview`, `sp_set_offer_breakdown`, `sp_respond_to_offer` |
| Placements | `GET /placements`, `GET /placements/mine`, `GET /placements/export.csv` | `placements`, `placement_summary` |
| Notifications | `GET /notifications`, `POST /notifications/read-all` | `notifications`, `sp_mark_notifications_read` |
| Analytics | `GET /analytics/overview|departments|companies|packages|funnel|top-students`, `GET /analytics/nirf-report.csv`, `POST /analytics/refresh` | `v_department_stats`, `v_company_selections`, `mv_placement_kpis`, `sp_refresh_analytics` |
| **Not covered by SQL yet** | Messaging, policies, staff profiles, student settings, assessment stage, offer expiry | need new tables or columns ([DB_SCHEMA.md](./DB_SCHEMA.md#schema-gaps-and-prototype-mismatches)) |

Role rules for these endpoints: [ROLE_PERMISSIONS.md](./ROLE_PERMISSIONS.md). Migration order: [INTEGRATION_PLAN.md](./INTEGRATION_PLAN.md).
