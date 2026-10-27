# Product Requirements Document (PRD)

**Product:** PlaceTrack, a Campus Placement Management System (college project).
**Document status:** reconstructed from the prototype source (`prototype/`), the SQL scripts (`sql/init/`), the FastAPI skeleton (`backend/`) and earlier planning documents. Requirement statuses use the legend in [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md). Detailed requirement tables with traceability are in [REQUIREMENTS.md](./REQUIREMENTS.md).

## 1. Executive summary

PlaceTrack centralizes a college's campus recruitment process: student placement profiles, company drives, eligibility checking, applications, interview rounds, selection, offers and placement analytics, for three roles: ADMIN, STAFF (placement staff) and STUDENT.

Today the product exists as a unified multi-tier application running via Docker Compose (`docker-compose.yml`):
- **Database (`placetrack-db`)**: PostgreSQL 16 Alpine with 17 normalized tables in 3NF, triggers, stored procedures, functions, and materialized view `mv_placement_kpis` executed and verified.
- **Backend (`placetrack-backend`)**: FastAPI REST API with SQLAlchemy 2, Pydantic v2, JWT authentication, role-based access control, and 115 passing automated tests.
- **Frontend (`placetrack-frontend`)**: React 18 + Vite 5 client running on port 5173. Core workflows (Auth, Student Overview, Admin Overview, Applications, Offers, Notifications, and Profile) are fully integrated with the FastAPI backend. Certain secondary staff operational screens (`StaffInterviewsPage`, `StaffResultsSelectionPage`, `PlacementPoliciesPage`, `UserManagementPage`) and the Demo Inbox modal still interface with client-side state pending frontend endpoint wiring.
- **Mail Service (`placetrack-mailpit`)**: Local SMTP catcher (port 8025/1025) for OTP verification.
- **Historical Prototype (`prototype/`)**: Standalone AI Studio prototype preserved as a UI design reference.

## 2. Problem statement

Placement records are typically fragmented across spreadsheets and messages. That makes it hard to see which students are eligible for a drive, where each application stands, which offers exist and what the placement statistics are. PlaceTrack aims to give one source of truth with role-appropriate access.

## 3. Objectives

| ID | Objective | State |
|---|---|---|
| OBJ-1 | One place for student, company, drive, application, interview and offer data | **Integrated and verified** (PostgreSQL 16 + FastAPI + React on core student & admin flows) |
| OBJ-2 | Automatic, explainable eligibility checks (CGPA, backlogs, department, skills) | **Integrated and verified** (SQL `fn_is_eligible`, FastAPI endpoints, student drive UI) |
| OBJ-3 | Visible application and interview progress for staff and students | **Integrated and verified** (Backend interview & application routes, student round tracker) |
| OBJ-4 | Offer handling with a single-offer / dream-offer policy | **Integrated and verified** (SQL `trg_applications_create_offer`, `sp_respond_to_offer`, API + UI) |
| OBJ-5 | Placement analytics for administrators | **Integrated and verified** (SQL `mv_placement_kpis`, FastAPI `/analytics/*`, NIRF export, UI charts) |
| OBJ-6 | Role-separated access (ADMIN, STAFF, STUDENT) | **Integrated and verified** (JWT HS256, backend `require_roles`, frontend route guards, profile data isolation) |

## 4. Scope

**In scope (v1 target):** authentication and roles; student profiles; companies and HR contacts; job drives with eligibility rules; applications and status workflow; interview rounds; selection and offers; placement records; notifications; analytics; administrator policies; demo messaging.

**Out of scope for v1:** real external SMS gateway (uses local Mailpit for email), resume file upload storage (URL link field only), payment, multi-institution tenancy, native mobile apps, AI résumé screening, real-time WebSocket chat.

## 5. Personas

| Persona | Role | Goals |
|---|---|---|
| Dean of Corporate Relations (demo: Ishan Wankhede) | ADMIN | Oversee placements, manage staff accounts and policies, inspect executive analytics |
| Senior Placement Coordinator / TPO (demo: Raghav Menon) | STAFF | Run drives, review applicants, schedule interviews, release offers |
| Student (demo: Rohit Verma / Aarav Sharma) | STUDENT | Maintain profile, find eligible drives, apply, track interviews and offers |

Names are illustrative demo identities, backed by seed records in `sql/init/06_seed.sql`.

## 6. Role-based requirements (summary)

Full matrix: [ROLE_PERMISSIONS.md](./ROLE_PERMISSIONS.md).

- **ADMIN:** institution-level administration, staff oversight, user management, policy review, and executive analytics. Profile shows institutional credentials (no student CGPA/backlogs).
- **STAFF:** student roster management, company and drive coordination, applicant screening, interview scheduling, offer breakdowns. Profile shows institutional credentials (no student CGPA/backlogs).
- **STUDENT:** own academic profile, CGPA/backlogs verification status, eligible drives, own applications, interview schedule, offers, and placement record.

## 7. Functional requirements

See [REQUIREMENTS.md](./REQUIREMENTS.md) section 1 (IDs `FR-AUTH-xxx`, `FR-STU-xxx`, `FR-CMP-xxx`, `FR-JOB-xxx`, `FR-ELG-xxx`, `FR-APP-xxx`, `FR-INT-xxx`, `FR-OFR-xxx`, `FR-PLC-xxx`, `FR-NTF-xxx`, `FR-MSG-xxx`, `FR-ANL-xxx`, `FR-POL-xxx`).

## 8. Non-functional requirements

See [REQUIREMENTS.md](./REQUIREMENTS.md) section 2 (`NFR-SEC`, `NFR-PERF`, `NFR-UX`, `NFR-MNT`, `NFR-DAT`, `NFR-OPS`).

## 9. Business rules

| ID | Rule | Where it exists today |
|---|---|---|
| BR-01 | A student may apply only to an open drive before its deadline for which they are eligible | UI gate (frontend); SQL trigger `trg_applications_validate_insert`; API validation |
| BR-02 | Eligibility = CGPA at or above the cutoff, backlogs at or below the maximum, department allowed, every required skill at the required level | SQL `fn_is_eligible`, `fn_eligibility_check`; backend `/jobs/{id}/eligible-students`; UI checklist |
| BR-03 | A student cannot apply twice to the same drive | Database constraint `UNIQUE (student_id, job_id)`; backend handles duplicate with HTTP 409 |
| BR-04 | Application status changes follow a fixed transition map; final states cannot be reopened | SQL trigger `trg_applications_validate_status`; backend router `applications.py` |
| BR-05 | Single-offer / dream-offer: a placed student may only take an offer from a higher tier | SQL `fn_policy_allows`, `sp_respond_to_offer`; backend `/offers/{id}/accept`; UI policy warning |
| BR-06 | Only an accepted offer counts as a placement | SQL table `placements` written only upon `sp_respond_to_offer(..., TRUE)` |
| BR-07 | Students see only their own applications, interviews, offers and notifications | Server-side isolation via `current_user.student_id` in FastAPI; frontend UI scoping |
| BR-08 | CGPA, department and backlogs are staff-managed; CGPA is CDC-verified | SQL `students.cgpa_verified`; backend `/students/{id}/verify-cgpa`; UI badges |

## 10. Core workflows

See [WORKFLOWS.md](./WORKFLOWS.md).

## 11. Acceptance criteria (examples)

1. Given a drive with minimum CGPA 8.0 and skills Python, SQL, Git, a student with CGPA 8.0 and all three skills is eligible; CGPA 7.9 or a missing skill is ineligible. (Verified in database `fn_is_eligible` and backend tests).
2. A STUDENT account cannot open `/dashboard/user-management`, `/dashboard/analytics` or any staff page. (Protected by frontend route guards and backend HTTP 403 `require_roles`).
3. Marking an application SELECTED produces an offer; accepting it creates the placement; accepting a lower-tier offer afterwards is rejected with a clear message. (Enforced by SQL triggers and `sp_respond_to_offer`).
4. A notification for a STUDENT is isolated to that student and not visible to others; Admin/Staff querying notifications receive role-appropriate empty lists without 403 errors.

## 12. Assumptions and dependencies

- Single institution, English UI, CGPA on a 0 to 10 scale, packages in LPA (lakhs per annum).
- Docker Compose v2 running PostgreSQL 16, FastAPI (Python 3.12), React 18 (Node 20), Mailpit, and optional pgAdmin.

## 13. Known limitations

See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md).
- Certain secondary staff management pages (`StaffInterviewsPage`, `StaffResultsSelectionPage`, `PlacementPoliciesPage`, `UserManagementPage`) still interact with mockApi client state rather than backend endpoints.
- In-app messaging (`DemoInboxModal`) is a simulated frontend prototype feature without backing database tables.
- UI policy customization is not yet wired to dynamically reconfigure database trigger constants.

## 14. Future requirements

- Complete frontend migration of remaining secondary staff screens to existing backend API endpoints.
- Database persistence for messaging conversations if retained in product scope.
- Configurable placement policy table in PostgreSQL for dynamic policy threshold overrides.

