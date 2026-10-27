# PlaceTrack Security Architecture & Review

## 1. Overview & Threat Model

PlaceTrack manages sensitive academic, placement, and corporate recruitment data. The system enforces defense-in-depth across three layers:
1. **API / Transport Layer**: JWT authentication, CORS confinement, standard error formatting without internal stack/context leakage.
2. **Application / Business Layer**: Pydantic v2 input validation, FastAPI dependency-injected role checking (`require_roles`), password sanitization (hash never exposed in any schema).
3. **Database Layer (Source of Truth)**: PostgreSQL CHECK constraints, foreign keys, row triggers (`trg_applications_validate_insert`, `trg_applications_validate_update`), and stored procedures (`sp_schedule_interview`, `sp_set_offer_breakdown`, `sp_respond_to_offer`). Even if an application bug bypasses API validation, database triggers prevent illegal operations (such as multiple active placements or applying to closed drives).

---

## 2. Authentication & Session Management

- **Algorithm**: HMAC-SHA256 (`HS256`) via python-jose.
- **Payload**: Contains `sub` (user primary key ID), `role` (`ADMIN`, `STAFF`, `STUDENT`), `exp` (expiration timestamp), and `iat`.
- **Token Expiry**: Configurable via `ACCESS_TOKEN_EXPIRE_MINUTES` (defaults to 60 minutes). Python-jose rejects expired tokens on validation (`JWTError`).
- **Password Storage**: Passwords hashed using `bcrypt` (pgcrypto `gen_salt('bf', 10)` in SQL seed, `passlib` bcrypt context in FastAPI). Plaintext passwords are never logged, stored, or returned.
- **Student Onboarding**: Two-step OTP verification against verified student roster. OTPs are 6-digit numeric codes generated securely, timed to expire in 10 minutes, and sent via dev mail catcher (Mailpit).

---

## 3. CORS & Network Confinement

- Configured in `app/core/config.py` via `CORS_ORIGINS`.
- Defaults strictly to `http://localhost:5173` (Vite development host).
- Wildcard `*` is explicitly disabled in CORS origin configuration.
- Supports comma-separated origin list for staging and production environments.

---

## 4. Endpoint × Role Permission Matrix

The following matrix documents role requirements across all API routes:

| Route / Resource | Method | ADMIN | STAFF | STUDENT | Unauthenticated | Description |
|---|---|:---:|:---:|:---:|:---:|---|
| **Health** | | | | | | |
| `/api/v1/health` | GET | ✓ | ✓ | ✓ | ✓ | Container liveness & DB connectivity check |
| **Auth** | | | | | | |
| `/api/v1/auth/login` | POST | ✓ | ✓ | ✓ | ✓ | Issues access token |
| `/api/v1/auth/me` | GET | ✓ | ✓ | ✓ | ✗ | Returns current user profile (no hash) |
| `/api/v1/auth/signup/request-otp` | POST | ✓ | ✓ | ✓ | ✓ | Request signup OTP for roster student |
| `/api/v1/auth/signup/verify` | POST | ✓ | ✓ | ✓ | ✓ | Verify OTP & set student account password |
| **Students** | | | | | | |
| `/api/v1/students` | GET | ✓ | ✓ | ✗ | ✗ | List & filter roster students |
| `/api/v1/students/{id}` | GET | ✓ | ✓ | ✓* | ✗ | Student details (*students own profile) |
| `/api/v1/students` | POST | ✓ | ✓ | ✗ | ✗ | Create new student record |
| `/api/v1/students/{id}` | PUT/PATCH | ✓ | ✓ | ✓* | ✗ | Update student details/skills (*own profile) |
| `/api/v1/students/{id}` | DELETE | ✓ | ✗ | ✗ | ✗ | Delete student record (Admin only) |
| `/api/v1/students/{id}/verify-cgpa` | POST | ✓ | ✓ | ✗ | ✗ | Staff/Admin verify student CGPA |
| **Companies** | | | | | | |
| `/api/v1/companies` | GET | ✓ | ✓ | ✓ | ✗ | List campus hiring partners |
| `/api/v1/companies/{id}` | GET | ✓ | ✓ | ✓ | ✗ | Company details and contacts |
| `/api/v1/companies` | POST | ✓ | ✓ | ✗ | ✗ | Register new partner company |
| `/api/v1/companies/{id}` | PUT/PATCH | ✓ | ✓ | ✗ | ✗ | Update partner profile |
| `/api/v1/companies/{id}` | DELETE | ✓ | ✗ | ✗ | ✗ | Delete company (Admin only) |
| **Jobs** | | | | | | |
| `/api/v1/jobs` | GET | ✓ | ✓ | ✓ | ✗ | List campus recruitment drives |
| `/api/v1/jobs/{id}` | GET | ✓ | ✓ | ✓ | ✗ | Drive details and eligibility criteria |
| `/api/v1/jobs` | POST | ✓ | ✓ | ✗ | ✗ | Create new job drive |
| `/api/v1/jobs/{id}` | PUT/PATCH | ✓ | ✓ | ✗ | ✗ | Update drive criteria / status |
| `/api/v1/jobs/{id}` | DELETE | ✓ | ✗ | ✗ | ✗ | Delete drive (Admin only) |
| `/api/v1/jobs/{id}/eligible-students` | GET | ✓ | ✓ | ✗ | ✗ | Evaluation of eligible student cohort |
| **Applications** | | | | | | |
| `/api/v1/applications` | GET | ✓ | ✓ | ✗ | ✗ | List all drive applications |
| `/api/v1/applications/mine` | GET | ✗ | ✗ | ✓ | ✗ | Student's own applications list |
| `/api/v1/applications` | POST | ✓ | ✓ | ✓ | ✗ | Submit new application (checked by DB trigger) |
| `/api/v1/applications/{id}/status` | PATCH | ✓ | ✓ | ✗ | ✗ | Transition status (SHORTLISTED, SELECTED, etc.) |
| **Interviews** | | | | | | |
| `/api/v1/applications/{id}/interviews` | GET | ✓ | ✓ | ✓* | ✗ | View interview rounds (*own application) |
| `/api/v1/applications/{id}/interviews` | POST | ✓ | ✓ | ✗ | ✗ | Schedule interview round (`sp_schedule_interview`) |
| `/api/v1/applications/{id}/interviews/{r}` | PATCH | ✓ | ✓ | ✗ | ✗ | Record round outcome (`sp_record_interview_result`) |
| **Offers & Placements** | | | | | | |
| `/api/v1/offers` | GET | ✓ | ✓ | ✗ | ✗ | List company offers |
| `/api/v1/offers/mine` | GET | ✗ | ✗ | ✓ | ✗ | View student's offers |
| `/api/v1/offers/{id}/breakdown` | PATCH | ✓ | ✓ | ✗ | ✗ | Set CTC breakdown (`sp_set_offer_breakdown`) |
| `/api/v1/offers/{id}/accept` | POST | ✗ | ✗ | ✓ | ✗ | Accept offer (`sp_respond_to_offer(..., TRUE)`) |
| `/api/v1/offers/{id}/decline` | POST | ✗ | ✗ | ✓ | ✗ | Decline offer (`sp_respond_to_offer(..., FALSE)`) |
| `/api/v1/placements` | GET | ✓ | ✓ | ✗ | ✗ | List confirmed student placements |
| `/api/v1/placements/mine` | GET | ✗ | ✗ | ✓ | ✗ | View student's confirmed placement |
| `/api/v1/placements/export.csv` | GET | ✓ | ✓ | ✗ | ✗ | Export placements CSV |
| **Analytics** | | | | | | |
| `/api/v1/analytics/overview` | GET | ✓ | ✓ | ✗ | ✗ | Placement KPIs from `mv_placement_kpis` |
| `/api/v1/analytics/departments` | GET | ✓ | ✓ | ✗ | ✗ | Department metrics from `v_department_stats` |
| `/api/v1/analytics/companies` | GET | ✓ | ✓ | ✗ | ✗ | Company stats from `v_company_selections` |
| `/api/v1/analytics/packages` | GET | ✓ | ✓ | ✗ | ✗ | CTC distribution tiers |
| `/api/v1/analytics/funnel` | GET | ✓ | ✓ | ✗ | ✗ | Recruitment pipeline conversion funnel |
| `/api/v1/analytics/top-students` | GET | ✓ | ✓ | ✗ | ✗ | Top placed students by CTC |
| `/api/v1/analytics/nirf-report.csv` | GET | ✓ | ✓ | ✗ | ✗ | NIRF accreditation CSV export |
| `/api/v1/analytics/refresh` | POST | ✓ | ✓ | ✗ | ✗ | Refresh materialized views |

---

## 5. Information Disclosure Prevention

1. **Password Hashes**:
   - `UserOut` and `StudentOut` schemas omit password fields completely.
   - Pydantic models validate that no internal authentication attributes are exposed.
2. **Database Error Sanitization**:
   - Internal PostgreSQL traceback, schema internals, and query texts are intercepted by `app.core.errors.extract_pg_message`.
   - User-facing error bodies conform strictly to `{"detail": "<sanitized message>", "code": "<ERROR_CODE>"}`.
3. **Authorization Leakage**:
   - Unauthenticated requests receive HTTP 401 (`UNAUTHORIZED`).
   - Authenticated requests lacking required roles receive HTTP 403 (`FORBIDDEN`).
