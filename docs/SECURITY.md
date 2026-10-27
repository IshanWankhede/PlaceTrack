# PlaceTrack Security Architecture & Verification Audit

## 1. Overview & Threat Model

PlaceTrack manages sensitive academic, placement, and corporate recruitment data. The system enforces defense-in-depth across three architectural layers:

1. **API / Transport Layer**: JWT authentication (`HS256`), CORS confinement, input sanitization, and structured error responses preventing internal database stack leakage.
2. **Application / Business Layer**: Pydantic v2 schema validation, FastAPI dependency-injected role enforcement (`require_roles`), password sanitization, and strict student academic data isolation.
3. **Database Layer (Source of Truth)**: PostgreSQL CHECK constraints, foreign key invariants, domain triggers (`trg_applications_validate_insert`, `trg_applications_validate_update`), and stored procedures (`sp_schedule_interview`, `sp_set_offer_breakdown`, `sp_respond_to_offer`). Even if an application bug bypasses API validation, database triggers prevent illegal operations (such as multiple active placements or applying to closed drives).

---

## 2. Security Controls Verification Matrix

Each security control has been verified against the active codebase and execution evidence:

| Control Area | Claimed Security Mechanism | Implementation Layer | Verified Status | Evidence & Notes |
|---|---|---|---|---|
| **Password Hashing** | bcrypt with work factor 10 | Backend (`passlib.context.CryptContext`) & SQL (`gen_salt('bf', 10)`) | **Integrated and verified** | Tested in `test_auth.py`; plaintext passwords are never stored or returned. |
| **Token Issuance** | HMAC-SHA256 (`HS256`) JWT with `sub`, `role`, `exp` claims | Backend (`python-jose`) | **Integrated and verified** | Tested in `test_auth.py`; validated on every protected endpoint via `get_current_user`. |
| **Session Expiration** | Token lifespan bounded by `ACCESS_TOKEN_EXPIRE_MINUTES` (60 min) | Backend (`app/core/security.py`) | **Integrated and verified** | Expired tokens automatically rejected with `HTTP 401 Unauthorized`. |
| **Server-Side RBAC** | Role verification via `require_roles(["ADMIN", "STAFF"])` | Backend dependencies (`app/core/dependencies.py`) | **Integrated and verified** | Tested in `test_edge_cases_security.py`; unauthorized roles receive `HTTP 403 Forbidden`. |
| **Frontend Route Guards** | Client-side navigation guards via `RoleProtectedRoute` | Frontend (`src/components/common/RoleProtectedRoute.jsx`) | **Implemented in frontend** | Prevents unauthorized client rendering; purely advisory for UX (security relies on backend). |
| **Profile Academic Isolation** | Admin/Staff profiles display institutional credentials only; CGPA, roll number, and backlogs are isolated to Students | Frontend (`ProfilePage.jsx`) & Backend schemas (`UserOut` vs `StudentOut`) | **Integrated and verified** | Admin/Staff profiles render Role, Designation, Office. Student profile renders academic credentials. |
| **Student Record Isolation** | Students can access only their own applications, offers, and placement records | Backend (`/applications/mine`, `/offers/mine`, `/placements/mine`) | **Integrated and verified** | Queries filter strictly by authenticated `student.id` derived from JWT `sub`. |
| **Notification Isolation** | In-app notifications are targeted per recipient | Backend (`GET /api/v1/notifications`) & DB (`notifications` table) | **Integrated and verified** | Students query by their `user_id`. Non-students receive `HTTP 200 []` without 403 error. |
| **Messaging Isolation** | Multi-party peer conversations | Frontend client simulation (`mockApi.js`) | **Implemented in prototype** | Real backend messaging WebSocket/REST endpoints not yet implemented (`Planned`). |
| **Input Validation** | Strict type coercion, bounds checking, and enum validation | Backend (`pydantic` v2 models) | **Integrated and verified** | Tested across all 11 router test suites; invalid payloads return `HTTP 422 Unprocessable Entity`. |
| **Database Invariants** | Check constraints, unique constraints, trigger guards | PostgreSQL 16 (`sql/init/01_ddl.sql` - `04_triggers.sql`) | **Integrated and verified** | Tested live against `placetrack-db`; duplicate application or invalid offer responses trigger SQL rollback. |
| **CORS Confinement** | Restrict origins strictly to configured frontend hosts | Backend (`CORSMiddleware` in `app/main.py`) | **Integrated and verified** | Wildcard `*` disabled; defaults to `http://localhost:5173`. |
| **Secret Management** | Environment variables with `.env` separation | Backend (`app/core/config.py`) via `pydantic-settings` | **Partially implemented** | Development uses `.env.docker` with fallback secret key; production requires vault-injected secret. |

---

## 3. Role Responsibilities & Architectural Separation

### Role Responsibilities

- **ADMIN**:
  - Institution-level administration, global configuration, user lifecycle management, company partnerships, and placement policy governance.
  - Profile credentials: Role title, Designation, Institutional Office/Unit. (Never displays student academic fields).
- **STAFF (Placement Officer / Coordinator)**:
  - Placement drive operations, student roster verification, eligibility auditing, interview scheduling, round progression, and offer management.
  - Profile credentials: Staff Designation, Placement Office/Department. (Never displays student academic fields).
- **STUDENT**:
  - Own academic profile, skill self-assessment, eligibility viewing, job drive applications, interview schedule viewing, and offer acceptance/declination.
  - Profile credentials: Full Name, Roll Number, Department, Batch, Verified CGPA, Active Backlogs.

### Distinction: Frontend Route Guards vs. Backend Authorization

```
[ User Request ]
       │
       ▼
[ Frontend: RoleProtectedRoute ] ──(Unmatched Role)──► Redirect / Render Restricted Panel
       │
       ▼ (Matched Role)
[ Axios API Client ] (Appends Bearer <JWT>)
       │
       ▼
[ FastAPI Server: get_current_user ] ──(Invalid/Expired JWT)──► HTTP 401 Unauthorized
       │
       ▼
[ FastAPI Server: require_roles(...) ] ──(Unauthorized Role)──► HTTP 403 Forbidden
       │
       ▼
[ Database Trigger / Constraint ] ──(Business Invariant Violated)──► HTTP 400 / Rollback
```

Frontend route guards provide immediate visual feedback and navigation UX. **They are not a security boundary.** Complete authorization and access control are enforced on every request by FastAPI dependency injection and database trigger constraints.

---

## 4. Endpoint × Role Permission Matrix

The following matrix documents role requirements across all API routes:

| Route / Resource | Method | ADMIN | STAFF | STUDENT | Unauthenticated | Verified Security Mechanism |
|---|---|:---:|:---:|:---:|:---:|---|
| **Health & Monitoring** | | | | | | |
| `/health` | GET | ✓ | ✓ | ✓ | ✓ | Open liveness probe |
| `/api/v1/health` | GET | ✓ | ✓ | ✓ | ✓ | Open API liveness probe |
| `/api/v1/health/db` | GET | ✓ | ✓ | ✓ | ✓ | Database connection pool probe |
| **Authentication** | | | | | | |
| `/api/v1/auth/login` | POST | ✓ | ✓ | ✓ | ✓ | Public: Rate-limited, bcrypt verification, JWT issued |
| `/api/v1/auth/me` | GET | ✓ | ✓ | ✓ | ✗ | `get_current_user`: Returns current user profile (no hash) |
| `/api/v1/auth/signup/request-otp` | POST | ✓ | ✓ | ✓ | ✓ | Public: Verifies roster roll number, generates 6-digit OTP |
| `/api/v1/auth/signup/verify` | POST | ✓ | ✓ | ✓ | ✓ | Public: Validates unexpired OTP, hashes password |
| **Students & Profiles** | | | | | | |
| `/api/v1/students` | GET | ✓ | ✓ | ✗ | ✗ | `require_roles(["ADMIN", "STAFF"])` |
| `/api/v1/students/{id}` | GET | ✓ | ✓ | ✓* | ✗ | *Student isolated: student can access only own profile |
| `/api/v1/students` | POST | ✓ | ✓ | ✗ | ✗ | `require_roles(["ADMIN", "STAFF"])` |
| `/api/v1/students/{id}` | PUT/PATCH | ✓ | ✓ | ✓* | ✗ | *Student restricted to updating own skills/bio |
| `/api/v1/students/{id}` | DELETE | ✓ | ✗ | ✗ | ✗ | `require_roles(["ADMIN"])` |
| `/api/v1/students/{id}/verify-cgpa` | POST | ✓ | ✓ | ✗ | ✗ | `require_roles(["ADMIN", "STAFF"])` |
| **Companies** | | | | | | |
| `/api/v1/companies` | GET | ✓ | ✓ | ✓ | ✗ | `get_current_user`: All authenticated roles |
| `/api/v1/companies/{id}` | GET | ✓ | ✓ | ✓ | ✗ | `get_current_user`: All authenticated roles |
| `/api/v1/companies` | POST | ✓ | ✓ | ✗ | ✗ | `require_roles(["ADMIN", "STAFF"])` |
| `/api/v1/companies/{id}` | PUT/PATCH | ✓ | ✓ | ✗ | ✗ | `require_roles(["ADMIN", "STAFF"])` |
| `/api/v1/companies/{id}` | DELETE | ✓ | ✗ | ✗ | ✗ | `require_roles(["ADMIN"])` |
| **Job Drives** | | | | | | |
| `/api/v1/jobs` | GET | ✓ | ✓ | ✓ | ✗ | `get_current_user`: Filtered by active drives |
| `/api/v1/jobs/{id}` | GET | ✓ | ✓ | ✓ | ✗ | `get_current_user`: Drive criteria & metadata |
| `/api/v1/jobs` | POST | ✓ | ✓ | ✗ | ✗ | `require_roles(["ADMIN", "STAFF"])` |
| `/api/v1/jobs/{id}` | PUT/PATCH | ✓ | ✓ | ✗ | ✗ | `require_roles(["ADMIN", "STAFF"])` |
| `/api/v1/jobs/{id}` | DELETE | ✓ | ✗ | ✗ | ✗ | `require_roles(["ADMIN"])` |
| `/api/v1/jobs/{id}/eligible-students` | GET | ✓ | ✓ | ✗ | ✗ | `require_roles(["ADMIN", "STAFF"])` |
| **Applications** | | | | | | |
| `/api/v1/applications` | GET | ✓ | ✓ | ✗ | ✗ | `require_roles(["ADMIN", "STAFF"])` |
| `/api/v1/applications/mine` | GET | ✗ | ✗ | ✓ | ✗ | `require_roles(["STUDENT"])`: Scoped to JWT student ID |
| `/api/v1/applications` | POST | ✗ | ✗ | ✓ | ✗ | `require_roles(["STUDENT"])`: Checked by DB trigger |
| `/api/v1/applications/{id}/status` | PATCH | ✓ | ✓ | ✗ | ✗ | `require_roles(["ADMIN", "STAFF"])` |
| **Interviews** | | | | | | |
| `/api/v1/applications/{id}/interviews` | GET | ✓ | ✓ | ✓* | ✗ | *Student can view only own application interviews |
| `/api/v1/applications/{id}/interviews` | POST | ✓ | ✓ | ✗ | ✗ | `require_roles(["ADMIN", "STAFF"])` |
| `/api/v1/applications/{id}/interviews/{r}` | PATCH | ✓ | ✓ | ✗ | ✗ | `require_roles(["ADMIN", "STAFF"])` |
| **Offers & Placements** | | | | | | |
| `/api/v1/offers` | GET | ✓ | ✓ | ✗ | ✗ | `require_roles(["ADMIN", "STAFF"])` |
| `/api/v1/offers/mine` | GET | ✗ | ✗ | ✓ | ✗ | `require_roles(["STUDENT"])`: Scoped to JWT student ID |
| `/api/v1/offers/{id}/breakdown` | PATCH | ✓ | ✓ | ✗ | ✗ | `require_roles(["ADMIN", "STAFF"])` |
| `/api/v1/offers/{id}/accept` | POST | ✗ | ✗ | ✓ | ✗ | `require_roles(["STUDENT"])`: Validates offer ownership |
| `/api/v1/offers/{id}/decline` | POST | ✗ | ✗ | ✓ | ✗ | `require_roles(["STUDENT"])`: Validates offer ownership |
| `/api/v1/placements` | GET | ✓ | ✓ | ✗ | ✗ | `require_roles(["ADMIN", "STAFF"])` |
| `/api/v1/placements/mine` | GET | ✗ | ✗ | ✓ | ✗ | `require_roles(["STUDENT"])`: Scoped to JWT student ID |
| `/api/v1/placements/export.csv` | GET | ✓ | ✓ | ✗ | ✗ | `require_roles(["ADMIN", "STAFF"])` |
| **Notifications** | | | | | | |
| `/api/v1/notifications` | GET | ✓* | ✓* | ✓ | ✗ | `get_current_user`: Returns student notifications; returns `[]` for Admin/Staff |
| `/api/v1/notifications/{id}/read` | PATCH | ✓ | ✓ | ✓ | ✗ | Validates notification ownership before updating |
| **Analytics** | | | | | | |
| `/api/v1/analytics/overview` | GET | ✓ | ✓ | ✗ | ✗ | `require_roles(["ADMIN", "STAFF"])` |
| `/api/v1/analytics/departments` | GET | ✓ | ✓ | ✗ | ✗ | `require_roles(["ADMIN", "STAFF"])` |
| `/api/v1/analytics/companies` | GET | ✓ | ✓ | ✗ | ✗ | `require_roles(["ADMIN", "STAFF"])` |
| `/api/v1/analytics/packages` | GET | ✓ | ✓ | ✗ | ✗ | `require_roles(["ADMIN", "STAFF"])` |
| `/api/v1/analytics/funnel` | GET | ✓ | ✓ | ✗ | ✗ | `require_roles(["ADMIN", "STAFF"])` |
| `/api/v1/analytics/top-students` | GET | ✓ | ✓ | ✗ | ✗ | `require_roles(["ADMIN", "STAFF"])` |
| `/api/v1/analytics/nirf-report.csv` | GET | ✓ | ✓ | ✗ | ✗ | `require_roles(["ADMIN", "STAFF"])` |
| `/api/v1/analytics/refresh` | POST | ✓ | ✗ | ✗ | ✗ | `require_roles(["ADMIN"])` |

---

## 5. Information Disclosure Prevention

1. **Password Hashes & Authentication Secrets**:
   - `UserOut` and `StudentOut` schemas explicitly exclude `password_hash`.
   - Pydantic models validate that no sensitive credential attributes are serialized.
2. **Database Error Sanitization**:
   - Internal PostgreSQL tracebacks, SQL query texts, and table schemas are intercepted by `app.core.errors.extract_pg_message`.
   - User-facing error bodies conform strictly to `{"detail": "<sanitized message>", "code": "<ERROR_CODE>"}`.
3. **Authorization Leakage**:
   - Unauthenticated requests receive HTTP 401 (`UNAUTHORIZED`).
   - Authenticated requests lacking required roles receive HTTP 403 (`FORBIDDEN`).
   - Requests for non-existent records versus unauthorized records return consistent 404/403 responses to prevent ID enumeration.
