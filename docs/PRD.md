# Product Requirements Document (PRD)

**Product:** PlaceTrack, a Campus Placement Management System (college project).
**Document status:** reconstructed from the prototype source (`prototype/`), the SQL scripts (`sql/init/`), the FastAPI skeleton (`backend/`) and earlier planning documents. Requirement statuses use the legend in [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md). Detailed requirement tables with traceability are in [REQUIREMENTS.md](./REQUIREMENTS.md).

## 1. Executive summary

PlaceTrack centralizes a college's campus recruitment process: student placement profiles, company drives, eligibility checking, applications, interview rounds, selection, offers and placement analytics, for three roles: ADMIN, STAFF (placement staff) and STUDENT.

Today the product exists as (a) a complete interactive **frontend prototype** running on in-browser mock data, and (b) an **unexecuted PostgreSQL design** plus a **FastAPI skeleton**. The prototype is not connected to the backend or database. No production deployment, real institutional use or measured outcome is claimed.

## 2. Problem statement

Placement records are typically fragmented across spreadsheets and messages. That makes it hard to see which students are eligible for a drive, where each application stands, which offers exist and what the placement statistics are. PlaceTrack aims to give one source of truth with role-appropriate access.

## 3. Objectives

| ID | Objective | State |
|---|---|---|
| OBJ-1 | One place for student, company, drive, application, interview and offer data | Prototype (mock) + SQL design |
| OBJ-2 | Automatic, explainable eligibility checks (CGPA, backlogs, department, skills) | Prototype (client) + SQL functions |
| OBJ-3 | Visible application and interview progress for staff and students | Prototype (mock) |
| OBJ-4 | Offer handling with a single-offer / dream-offer policy | Prototype (mock) + SQL design |
| OBJ-5 | Placement analytics for administrators | Prototype (partly hard-coded) + SQL views |
| OBJ-6 | Role-separated access (ADMIN, STAFF, STUDENT) | Prototype route guards only |

## 4. Scope

**In scope (v1 target):** authentication and roles; student profiles; companies and HR contacts; job drives with eligibility rules; applications and status workflow; interview rounds; selection and offers; placement records; notifications; analytics; administrator policies; demo messaging.

**Out of scope for v1:** real e-mail/SMS delivery, resume and scorecard file storage (a link field only), payment, multi-institution tenancy, native mobile apps, AI résumé screening, real-time chat.

## 5. Personas

| Persona | Role | Goals |
|---|---|---|
| Dean of Corporate Relations (demo: Ishan Wankhede) | ADMIN | Oversee placements, manage staff accounts and policies, read analytics |
| Senior Placement Coordinator / TPO (demo: Raghav Menon) | STAFF | Run drives, review applicants, schedule interviews, release offers |
| Student (demo: Rohit Verma) | STUDENT | Maintain profile, find eligible drives, apply, track interviews and offers |

Names are illustrative demo identities, not real accounts.

## 6. Role-based requirements (summary)

Full matrix: [ROLE_PERMISSIONS.md](./ROLE_PERMISSIONS.md).

- **ADMIN:** everything STAFF can do plus user management, analytics and policy configuration.
- **STAFF:** students, companies, drives, eligible lists, applications, interviews, results, offers and placements, notifications, profile.
- **STUDENT:** own profile and settings, available drives with eligibility, own applications, interviews, offers and progress, notifications.

## 7. Functional requirements

See [REQUIREMENTS.md](./REQUIREMENTS.md) section 1 (IDs `FR-AUTH-xxx`, `FR-STU-xxx`, `FR-CMP-xxx`, `FR-JOB-xxx`, `FR-ELG-xxx`, `FR-APP-xxx`, `FR-INT-xxx`, `FR-OFR-xxx`, `FR-PLC-xxx`, `FR-NTF-xxx`, `FR-MSG-xxx`, `FR-ANL-xxx`, `FR-POL-xxx`).

## 8. Non-functional requirements

See [REQUIREMENTS.md](./REQUIREMENTS.md) section 2 (`NFR-SEC`, `NFR-PERF`, `NFR-UX`, `NFR-MNT`, `NFR-DAT`, `NFR-OPS`).

## 9. Business rules

| ID | Rule | Where it exists today |
|---|---|---|
| BR-01 | A student may apply only to an open drive before its deadline for which they are eligible | UI gate (prototype); SQL trigger `trg_applications_validate_insert` |
| BR-02 | Eligibility = CGPA at or above the cutoff, backlogs at or below the maximum, department allowed, every required skill at the required level | `prototype/src/services/eligibility.js`; SQL `fn_eligibility_check` |
| BR-03 | A student cannot apply twice to the same drive | Prototype returns the existing application; SQL `UNIQUE (student_id, job_id)` |
| BR-04 | Application status changes follow a fixed transition map; final states cannot be reopened | Prototype `getValidApplicationTransitions`; SQL `trg_applications_validate_status` (different vocabulary) |
| BR-05 | Single-offer / dream-offer: a placed student may only take an offer from a higher tier | Prototype `_evaluateOfferPolicyForStudent`; SQL `fn_policy_allows`, `sp_respond_to_offer` |
| BR-06 | Only an accepted offer counts as a placement | Prototype offer status; SQL `placements` written only on accept |
| BR-07 | Students see only their own applications, interviews, offers and notifications | UI filtering only (KI-002) |
| BR-08 | CGPA, department and backlogs are staff-managed; CGPA is CDC-verified | Prototype verification toggle; SQL `students.cgpa_verified` |

## 10. Core workflows

See [WORKFLOWS.md](./WORKFLOWS.md).

## 11. Acceptance criteria (examples)

1. Given a drive with minimum CGPA 8.0 and skills Python, SQL, Git, a student with CGPA 8.0 and all three skills is eligible; CGPA 7.9 or a missing skill is not. (Matches the SQL seed demo; the prototype formula must give the same eligibility result.)
2. A STUDENT account cannot open `/dashboard/user-management`, `/dashboard/analytics` or any staff page. (Prototype: route guard; backend: HTTP 403, not yet built.)
3. Marking an application SELECTED produces an offer; accepting it creates the placement; accepting a lower-tier offer afterwards is rejected with a clear message.
4. A notification for a STUDENT is never visible to ADMIN or STAFF and unread counts are per user.

## 12. Assumptions and dependencies

- Single institution, English UI, CGPA on a 0 to 10 scale, packages in LPA (lakhs per annum).
- Node.js and npm for the prototype; Docker for PostgreSQL, backend, mail catcher and pgAdmin; Python 3.12 image for the backend.
- Integration depends on resolving the vocabulary and schema gaps in [DB_SCHEMA.md](./DB_SCHEMA.md#schema-gaps-and-prototype-mismatches).

## 13. Known limitations

See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md). Headlines: no authentication, no server-side authorization, no integration, nothing executed in review.

## 14. Future requirements

Real authentication and OTP; server-enforced permissions; API for every prototype feature; messaging tables (if kept in scope); policy enforcement; computed analytics; automated tests; production build (no demo switcher).
