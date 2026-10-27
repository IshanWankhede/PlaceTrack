# Role & Permission Architecture

## 1. Role Definitions & Responsibilities

PlaceTrack defines three distinct system roles with strictly separated operational boundaries:

| Role | Operational Scope & Responsibilities | Profile Credentials Displayed |
|---|---|---|
| **ADMIN** | **Institution-Level Administration**: Global configuration, user account lifecycle, partner companies, drive approvals, policy governance, and analytical auditing. | Role Title, Designation, Institutional Office/Unit. Academic fields (`cgpa`, `backlogs`, `roll_number`) are **strictly excluded**. |
| **STAFF** (TPO / Coordinator) | **Placement Operations**: Managing recruitment drives, student eligibility auditing, interview scheduling, round progression, offer recording, and candidate selections. | Role Title, Staff Designation, Placement Office/Department. Academic fields are **strictly excluded**. |
| **STUDENT** | **Placement Candidate**: Self-service profile management, skill self-assessment, eligibility evaluation, job applications, interview schedule viewing, and offer acceptance/declination. | Full Name, Roll Number, Department, Batch, Verified CGPA, Active Backlogs, Resume URL, Technical Skills. |

---

## 2. Enforcement Architecture: Defense-in-Depth

Authorization is enforced at multiple architectural layers:

```
[ Incoming Request ]
         │
         ▼
[ Layer 1: Frontend Route Guard ] ──(Client Check)──► Access Restricted Panel / Redirect
         │
         ▼
[ Layer 2: API Gateway & JWT Auth ] ──(Invalid/Missing Token)──► HTTP 401 Unauthorized
         │
         ▼
[ Layer 3: FastAPI RBAC Dependency ] ──(Role Not Allowed)──► HTTP 403 Forbidden
         │
         ▼
[ Layer 4: Resource Ownership Scoping ] ──(Cross-Tenant Access)──► HTTP 403/404 Filter
         │
         ▼
[ Layer 5: PostgreSQL Triggers & Constraints ] ──(Business Invariant Failed)──► Rollback (HTTP 400)
```

1. **Frontend Route Guards (`RoleProtectedRoute.jsx`)**: Enforces immediate UI-level access control, preventing unauthorized routes from rendering.
2. **Backend Authentication (`get_current_user`)**: Verifies signature, expiration, and payload of HS256 JWT tokens extracted from the `Authorization: Bearer` header.
3. **Backend Authorization (`require_roles(...)`)**: Injected into FastAPI route handlers to enforce role-based access at the server boundary.
4. **Resource Ownership Scoping**: Endpoints like `/applications/mine`, `/offers/mine`, and `/notifications` derive the student ID directly from the authenticated JWT `sub` claim, preventing cross-student data leakage.
5. **Database Triggers**: Constraints and stored procedures (`sql/init/04_procedures.sql`, `05_triggers.sql`) reject illegal state transitions (such as unapproved offer acceptance or duplicate applications).

---

## 3. Route Access Matrix (Frontend & API)

The table below correlates frontend routes (`frontend/src/App.jsx`) with their underlying FastAPI backend API endpoints and enforced roles:

| Frontend Route | Page Component | Underlying FastAPI Endpoint | ADMIN | STAFF | STUDENT | Verified Status |
|---|---|---|:---:|:---:|:---:|---|
| `/dashboard` | `DashboardRouter` | `GET /api/v1/analytics/overview` or `/jobs` | ✓ | ✓ | ✓ | **Integrated and verified** |
| `/dashboard/profile` | `ProfilePage` | `GET /api/v1/auth/me` | ✓ | ✓ | ✓ | **Integrated and verified** (Role-isolated fields) |
| `/dashboard/notifications` | `NotificationsPage` | `GET /api/v1/notifications` | ✓* | ✓* | ✓ | **Integrated and verified** (*Admin/Staff receive `[]`) |
| `/dashboard/jobs` | `JobsPage` | `GET /api/v1/jobs` | ✓ | ✓ | ✓ | **Integrated and verified** |
| `/dashboard/students` | `StudentsPage` | `GET /api/v1/students` | ✓ | ✓ | ✗ | **Integrated and verified** |
| `/dashboard/companies` | `CompaniesPage` | `GET /api/v1/companies` | ✓ | ✓ | ✗* | **Integrated and verified** (*Students view via job cards) |
| `/dashboard/eligible-students` | `StaffEligibleStudentsPage` | `GET /api/v1/jobs/{id}/eligible-students` | ✓ | ✓ | ✗ | **Integrated and verified** |
| `/dashboard/applications` | `ApplicationsPage` | `GET /api/v1/applications` | ✓ | ✓ | ✗ | **Integrated and verified** |
| `/dashboard/interviews` | `StaffInterviewsPage` | `GET /api/v1/applications/{id}/interviews` | ✓ | ✓ | ✗ | **Implemented in backend** (Frontend transitional) |
| `/dashboard/results` | `StaffResultsSelectionPage` | `PATCH /api/v1/applications/{id}/status` | ✓ | ✓ | ✗ | **Implemented in backend** (Frontend transitional) |
| `/dashboard/placements` | `PlacementsPage` | `GET /api/v1/placements` | ✓ | ✓ | ✗ | **Integrated and verified** |
| `/dashboard/user-management` | `UserManagementPage` | `GET/POST /api/v1/students`, `/users` | ✓ | ✗ | ✗ | **Partially implemented** (Admin only) |
| `/dashboard/analytics` | `AnalyticsPage` | `GET /api/v1/analytics/*` | ✓ | ✓ | ✗ | **Integrated and verified** |
| `/dashboard/policies` | `PlacementPoliciesPage` | SQL triggers (`fn_policy_allows`) | ✓ | ✗ | ✗ | **Implemented in SQL** (UI transitional) |
| `/dashboard/my-applications` | `StudentMyApplications` | `GET /api/v1/applications/mine` | ✗ | ✗ | ✓ | **Integrated and verified** |
| `/dashboard/my-interviews` | `StudentInterviewsPage` | `GET /api/v1/applications/{id}/interviews` | ✗ | ✗ | ✓ | **Implemented in backend** (Frontend transitional) |
| `/dashboard/my-placement` | `StudentMyPlacement` | `GET /api/v1/offers/mine`, `/placements/mine` | ✗ | ✗ | ✓ | **Integrated and verified** |
| `/dashboard/my-progress` | `StudentProgressPage` | Derived from applications & offers | ✗ | ✗ | ✓ | **Implemented in prototype** |
| `/dashboard/settings` | `StudentSettingsPage` | Local client settings | ✗ | ✗ | ✓ | **Implemented in prototype** |

---

## 4. Resource Operations & Ownership Rules

| Resource | ADMIN | STAFF | STUDENT | Ownership & Authorization Invariant |
|---|---|---|---|---|
| **Users / Accounts** | View, Create, Deactivate | None | None | Admin-only system governance. Plaintext passwords never stored. |
| **Student Roster** | View all, Verify CGPA | View all, Verify CGPA | View own profile only | Students restricted to updating own skills and bio. CGPA verified by Staff/Admin only. |
| **Companies** | Full CRUD | Full CRUD (except delete) | View active hiring partners | Company deletion restricted to Admin to prevent orphan placements. |
| **Job Drives** | Full CRUD | Full CRUD (except delete) | View eligible & open drives | Students cannot view internal drive notes or candidate pools. |
| **Applications** | View all, update status | View all, update status | Apply to eligible jobs, view own | Applications restricted to open drives; student can apply only once (`uq_application_student_job`). |
| **Interviews** | Full CRUD | Full CRUD | View own scheduled rounds | Interviewers, meeting links, and schedules scoped per application. |
| **Offers** | View all, set CTC breakdown | View all, set CTC breakdown | View own, Accept / Decline own | Offer acceptance enforces tier policy; accepting higher tier supersedes or locks lower tier offers. |
| **Placements** | View all, CSV export | View all, CSV export | View own placement record | Generated automatically upon offer acceptance. Exactly one active placement per student. |
| **Analytics** | View all, refresh views | View all | None | Materialized view refresh restricted to Admin. |
| **Notifications** | View own (`[]`) | View own (`[]`) | View own, Mark read | In-app notifications addressed per student recipient. Admin/Staff gracefully return empty list. |

---

## 5. Security & Permission Status Summary

1. **Server-Side Authorization**: **Integrated and verified.** FastAPI dependency injection enforces roles across all endpoints.
2. **Student Data Isolation**: **Integrated and verified.** Student endpoints filter queries by authenticated JWT student ID.
3. **Profile Credential Isolation**: **Integrated and verified.** Admin and Staff profiles omit student academic attributes.
4. **Remaining Work**: Complete migration of transitional staff pages (`StaffInterviewsPage`, `StaffResultsSelectionPage`, `PlacementPoliciesPage`, `UserManagementPage`) to real backend endpoints.
