# Frontend and Backend Integration Plan & Status

This document tracks the phased migration from client-side prototype mocks to the containerized full-stack architecture (React 18 + FastAPI + PostgreSQL 16).

---

## 1. Migration Stage Status Matrix

| # | Migration Stage | Target Scope | Implementation Status | Verified Evidence |
|---|---|---|---|---|
| **1** | **Stabilize Contracts & Models** | Data schemas, status enums, tier rankings | **Integrated and verified** | Pydantic v2 schemas align with PostgreSQL 16 DDL |
| **2** | **One Shared Vocabulary** | Enums (`APPLIED`, `SHORTLISTED`, `INTERVIEW`, `SELECTED`, `REJECTED`, `WITHDRAWN`) | **Integrated and verified** | Consistent status handling across DB triggers, API, and UI |
| **3** | **Database Script Verification** | PostgreSQL 16 DDL, constraints, triggers, functions, views, seed data | **Integrated and verified** | Executed in `placetrack-db`; 17 tables, 13 views, 5 seed placements active |
| **4** | **Real Authentication** | Password hashing (bcrypt), HS256 JWT issuance, login, OTP signup | **Integrated and verified** | Pytest `test_auth.py`, Mailpit OTP delivery, frontend login wired |
| **5** | **Server-Side Authorization (RBAC)** | Role verification (`require_roles`), student record isolation | **Integrated and verified** | Pytest `test_edge_cases_security.py`; HTTP 403 on role escalation |
| **6** | **Profile Credentials Isolation** | Exclude student academic fields from Admin/Staff profiles | **Integrated and verified** | `ProfilePage.jsx` renders role-isolated institutional block |
| **7** | **Student Drive Discovery & Eligibility** | Live jobs list, dynamic eligibility matching | **Integrated and verified** | `jobsService` wired to `/api/v1/jobs`; CGPA & backlog check |
| **8** | **Student Applications Flow** | Submit application, prevent duplicates, track student applications | **Integrated and verified** | `applicationsService` wired to `/api/v1/applications/mine` with joined drive details |
| **9** | **Offer Acceptance & Placements** | Student view offers, accept/decline, atomic placement creation | **Integrated and verified** | `offersService` wired to `/api/v1/offers/mine`, `/accept`; tier upgrades enforced |
| **10** | **In-App Notifications** | Role-safe notifications retrieval, mark as read | **Integrated and verified** | `notificationsService` wired to `/api/v1/notifications`; non-students get `[]` safely |
| **11** | **Placement Analytics & KPIs** | Materialized view KPIs, department stats, company stats | **Integrated and verified** | `AdminOverview.jsx` wired to `/api/v1/analytics/overview` |
| **12** | **Staff Operational Workflows** | Interview scheduling, candidate results progression | **Implemented in backend** | Backend routers active (`/interviews`, `/applications/{id}/status`); frontend pages transitional |
| **13** | **Placement Policies Configuration** | Dynamic policy rules in database | **Implemented in SQL** | Enforced via SQL triggers (`fn_policy_allows`); dynamic admin table planned |
| **14** | **Peer Messaging System** | WebSocket / REST chat, persistent message tables | **Implemented in prototype** | Frontend simulated modal active; real backend tables planned for Phase 2 |
| **15** | **Automated Integration Test Suite** | Multi-container automated testing | **Integrated and verified** | 115 passing tests in Pytest; Vite production build verified |

---

## 2. Completed Milestones

1. **Full-Stack Connectivity Established**:
   - The active containerized application (`frontend/`) connects via Axios with automatic Bearer JWT injection to the FastAPI backend (`backend/app/routers/`).
   - PostgreSQL 16 initialization scripts (`sql/init/01_ddl.sql` - `06_seed.sql`) run automatically on startup.
2. **Student User Journey Fully Integrated**:
   - Registration with 6-digit email OTP (via Mailpit).
   - Sign in with bcrypt credential verification and JWT generation.
   - Job drive browsing with eligibility threshold calculation.
   - Drive application submission backed by database trigger validation.
   - Application status and interview round tracking with multi-table SQL joins.
   - Offer letter review and acceptance, triggering atomic placement confirmation and tier policy locking.
   - In-app notification alerts for status updates.
3. **Admin Core Journey Integrated**:
   - Role-isolated profile view (institutional credentials only).
   - Institutional overview dashboard powered by real analytics and live database counts.
   - Placement rate metrics, company hiring distributions, and department breakdowns via PostgreSQL views and materialized views.

---

## 3. Remaining Integration Roadmap

1. **Complete Staff Operational Page Wiring (Phase 1.5)**:
   - Wire `StaffInterviewsPage.jsx` to call `interviewsService` (`POST /api/v1/applications/{id}/interviews`).
   - Wire `StaffResultsSelectionPage.jsx` to call `applicationsService.updateStatus` (`PATCH /api/v1/applications/{id}/status`).
   - Wire `UserManagementPage.jsx` to backend user management endpoints.
2. **Dynamic Placement Policy Table (Phase 2)**:
   - Create a dedicated `placement_policies` table allowing runtime adjustments of tier upgrade multipliers, max offers per student, and backlog waivers.
3. **Real Real-Time Messaging Engine (Phase 2)**:
   - Implement `conversations`, `conversation_participants`, and `messages` tables.
   - Implement WebSocket gateway in FastAPI for instant peer messaging.
