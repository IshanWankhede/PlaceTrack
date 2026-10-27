# Database Schema & Data Dictionary

> **Source of truth:** `sql/init/*.sql` (`01_ddl.sql`, `02_views.sql`, `03_functions.sql`, `04_procedures.sql`, `05_triggers.sql`, `06_seed.sql`).
> **Execution status:** **Integrated and verified.** These scripts run automatically via Docker Compose on PostgreSQL 16 (`placetrack-db`). Execution has been confirmed live via API health probes (`GET /api/v1/health/db` reporting 17 tables) and 115 passing Pytest backend tests.
> **Backend ORM mapping:** SQLAlchemy 2 declarative models in `backend/app/models/` map these tables directly with relational foreign-key joins.
> **Application relationship:** The active frontend (`frontend/`) interacts with this database through the FastAPI backend (`backend/app/routers/`). Historical prototype mocks (`prototype/`) remain for offline UI reference only.

Target: PostgreSQL 16 (`postgres:16-alpine` in `docker-compose.yml`). Required Extension: `pgcrypto`.

---

## 1. Initialization Order

Files in `sql/init/` run automatically in alphanumeric order when the PostgreSQL database volume is initialized:

| Order | File | Contents | Live Status |
|---|---|---|---|
| 01 | `01_ddl.sql` | 17 tables, primary/foreign key constraints, domain CHECK constraints, B-tree indexes, `pgcrypto` extension | Executed & Verified |
| 02 | `02_views.sql` | 6 relational reporting views + 1 materialized view (`mv_placement_kpis`) | Executed & Verified |
| 03 | `03_functions.sql` | 15 stored functions (eligibility check, tier policies, match scoring, OTP generation & verification) | Executed & Verified |
| 04 | `04_procedures.sql` | 14 stored procedures (application submission, interview scheduling, offer response, batch analytics refresh) | Executed & Verified |
| 05 | `05_triggers.sql` | 9 database triggers (application status validation, automated offer creation, audit logging, notification dispatch) | Executed & Verified |
| 06 | `06_seed.sql` | Initial demo seed data: departments, skills, students, companies, jobs, user credentials, applications, interviews, and confirmed placements | Executed & Verified |

---

## 2. Table Specifications

The database schema defines 17 relational tables:

| Table | Purpose | Primary Key | Foreign Keys |
|---|---|---|---|
| [`departments`](#departments) | Academic departments/branches | `id` | None |
| [`students`](#students) | Student academic profiles, verification status, and credentials | `id` | `department_id -> departments(id)` |
| [`users`](#users) | User login accounts with RBAC roles (`ADMIN`, `STAFF`, `STUDENT`) | `id` | `student_id -> students(id)` |
| [`email_otps`](#email_otps) | Hashed one-time passwords for signup and password recovery | `id` | None |
| [`notifications`](#notifications) | In-app notification messages targeted to students | `id` | `student_id -> students(id)` |
| [`skills`](#skills) | Master dictionary of technical and soft skills | `id` | None |
| [`student_skills`](#student_skills) | Student skill proficiency ratings (M:N) | `(student_id, skill_id)` | `student_id -> students(id)`, `skill_id -> skills(id)` |
| [`companies`](#companies) | Corporate recruitment partners and tier classification | `id` | None |
| [`company_contacts`](#company_contacts) | Corporate HR and campus recruitment POCs | `id` | `company_id -> companies(id)` |
| [`jobs`](#jobs) | Job drives with CTC packages and academic cutoffs | `id` | `company_id -> companies(id)` |
| [`job_skills`](#job_skills) | Skills required for specific recruitment drives (M:N) | `(job_id, skill_id)` | `job_id -> jobs(id)`, `skill_id -> skills(id)` |
| [`job_departments`](#job_departments) | Department eligibility filters per drive (M:N) | `(job_id, department_id)` | `job_id -> jobs(id)`, `department_id -> departments(id)` |
| [`applications`](#applications) | Student drive applications with status lifecycle | `id` | `student_id -> students(id)`, `job_id -> jobs(id)` |
| [`interviews`](#interviews) | Scheduled interview rounds per application | `id` | `application_id -> applications(id)` |
| [`application_status_history`](#application_status_history) | Immutable audit log of application status transitions | `id` | `application_id -> applications(id)` |
| [`offers`](#offers) | Released job offers with CTC breakdowns | `id` | `application_id -> applications(id)`, `student_id -> students(id)`, `job_id -> jobs(id)`, `company_id -> companies(id)` |
| [`placements`](#placements) | Confirmed placement records for accepted offers | `id` | `student_id -> students(id)`, `application_id -> applications(id)`, `offer_id -> offers(id)`, `job_id -> jobs(id)`, `company_id -> companies(id)` |

---

### Detailed Column Definitions

#### departments
| Column | Type | Null | Constraints |
|---|---|---|---|
| `id` | SERIAL | NO | PRIMARY KEY |
| `name` | VARCHAR(100) | NO | UNIQUE |
| `code` | VARCHAR(10) | NO | UNIQUE |

#### students
| Column | Type | Null | Constraints |
|---|---|---|---|
| `id` | SERIAL | NO | PRIMARY KEY |
| `roll_number` | VARCHAR(20) | NO | UNIQUE |
| `name` | VARCHAR(150) | NO | |
| `email` | VARCHAR(150) | NO | UNIQUE |
| `phone` | VARCHAR(15) | YES | |
| `cgpa` | NUMERIC(3,2) | NO | CHECK (cgpa BETWEEN 0 AND 10) |
| `graduation_year` | INTEGER | NO | CHECK (graduation_year >= 2000) |
| `department_id` | INTEGER | NO | FK -> departments(id) |
| `active_backlogs` | INTEGER | NO | DEFAULT 0; CHECK (active_backlogs >= 0) |
| `cgpa_verified` | BOOLEAN | NO | DEFAULT FALSE |
| `resume_url` | VARCHAR(255) | YES | |
| `photo_url` | VARCHAR(255) | YES | |
| `created_at` | TIMESTAMP | NO | DEFAULT NOW() |

#### users
| Column | Type | Null | Constraints |
|---|---|---|---|
| `id` | SERIAL | NO | PRIMARY KEY |
| `email` | VARCHAR(150) | NO | UNIQUE |
| `password_hash` | VARCHAR(255) | NO | |
| `role` | VARCHAR(20) | NO | DEFAULT 'STAFF'; CHECK (role IN ('ADMIN','STAFF','STUDENT')) |
| `student_id` | INTEGER | YES | UNIQUE; FK -> students(id) ON DELETE CASCADE |
| `is_active` | BOOLEAN | NO | DEFAULT TRUE |
| `created_at` | TIMESTAMP | NO | DEFAULT NOW() |

*Table Constraint:* `CHECK ((role = 'STUDENT' AND student_id IS NOT NULL) OR (role <> 'STUDENT' AND student_id IS NULL))`

#### email_otps
| Column | Type | Null | Constraints |
|---|---|---|---|
| `id` | SERIAL | NO | PRIMARY KEY |
| `email` | VARCHAR(150) | NO | |
| `purpose` | VARCHAR(20) | NO | CHECK (purpose IN ('SIGNUP','PASSWORD_RESET')) |
| `otp_hash` | VARCHAR(255) | NO | |
| `expires_at` | TIMESTAMP | NO | |
| `attempts` | INTEGER | NO | DEFAULT 0 |
| `consumed` | BOOLEAN | NO | DEFAULT FALSE |
| `created_at` | TIMESTAMP | NO | DEFAULT NOW() |

#### notifications
| Column | Type | Null | Constraints |
|---|---|---|---|
| `id` | SERIAL | NO | PRIMARY KEY |
| `student_id` | INTEGER | NO | FK -> students(id) ON DELETE CASCADE |
| `type` | VARCHAR(20) | NO | CHECK (type IN ('APPLICATION','INTERVIEW','OFFER','SYSTEM')) |
| `title` | VARCHAR(150) | NO | |
| `message` | TEXT | NO | |
| `is_read` | BOOLEAN | NO | DEFAULT FALSE |
| `created_at` | TIMESTAMP | NO | DEFAULT NOW() |

#### skills
| Column | Type | Null | Constraints |
|---|---|---|---|
| `id` | SERIAL | NO | PRIMARY KEY |
| `name` | VARCHAR(100) | NO | UNIQUE |

#### student_skills
| Column | Type | Null | Constraints |
|---|---|---|---|
| `student_id` | INTEGER | NO | Composite PK; FK -> students(id) ON DELETE CASCADE |
| `skill_id` | INTEGER | NO | Composite PK; FK -> skills(id) ON DELETE CASCADE |
| `proficiency` | VARCHAR(20) | NO | DEFAULT 'BEGINNER'; CHECK (proficiency IN ('BEGINNER','INTERMEDIATE','ADVANCED','EXPERT')) |

#### companies
| Column | Type | Null | Constraints |
|---|---|---|---|
| `id` | SERIAL | NO | PRIMARY KEY |
| `name` | VARCHAR(150) | NO | UNIQUE |
| `industry` | VARCHAR(100) | YES | |
| `location` | VARCHAR(150) | YES | |
| `website` | VARCHAR(255) | YES | |
| `description` | TEXT | YES | |
| `tier` | VARCHAR(20) | NO | DEFAULT 'CORE'; CHECK (tier IN ('CORE','DREAM','SUPER_DREAM')) |
| `logo_url` | VARCHAR(255) | YES | |

#### company_contacts
| Column | Type | Null | Constraints |
|---|---|---|---|
| `id` | SERIAL | NO | PRIMARY KEY |
| `company_id` | INTEGER | NO | FK -> companies(id) ON DELETE CASCADE |
| `name` | VARCHAR(150) | NO | |
| `designation` | VARCHAR(100) | YES | |
| `email` | VARCHAR(150) | YES | |
| `phone` | VARCHAR(20) | YES | |

#### jobs
| Column | Type | Null | Constraints |
|---|---|---|---|
| `id` | SERIAL | NO | PRIMARY KEY |
| `company_id` | INTEGER | NO | FK -> companies(id) |
| `title` | VARCHAR(150) | NO | |
| `description` | TEXT | YES | |
| `minimum_cgpa` | NUMERIC(3,2) | NO | CHECK (minimum_cgpa BETWEEN 0 AND 10) |
| `package` | NUMERIC(10,2) | YES | CHECK (package >= 0) |
| `package_max` | NUMERIC(10,2) | YES | CHECK (package_max IS NULL OR package IS NULL OR package_max >= package) |
| `max_backlogs` | INTEGER | NO | DEFAULT 0; CHECK (max_backlogs >= 0) |
| `job_type` | VARCHAR(20) | NO | DEFAULT 'FULL_TIME'; CHECK (job_type IN ('FULL_TIME','INTERNSHIP','PPO')) |
| `location` | VARCHAR(150) | YES | |
| `drive_date` | DATE | YES | |
| `application_deadline` | DATE | YES | |
| `status` | VARCHAR(20) | NO | DEFAULT 'OPEN'; CHECK (status IN ('OPEN','CLOSED','ARCHIVED')) |
| `created_at` | TIMESTAMP | NO | DEFAULT NOW() |

#### job_skills
| Column | Type | Null | Constraints |
|---|---|---|---|
| `job_id` | INTEGER | NO | Composite PK; FK -> jobs(id) ON DELETE CASCADE |
| `skill_id` | INTEGER | NO | Composite PK; FK -> skills(id) ON DELETE CASCADE |
| `required_level` | VARCHAR(20) | NO | DEFAULT 'BEGINNER'; CHECK (required_level IN ('BEGINNER','INTERMEDIATE','ADVANCED','EXPERT')) |

#### job_departments
| Column | Type | Null | Constraints |
|---|---|---|---|
| `job_id` | INTEGER | NO | Composite PK; FK -> jobs(id) ON DELETE CASCADE |
| `department_id` | INTEGER | NO | Composite PK; FK -> departments(id) ON DELETE CASCADE |

#### applications
| Column | Type | Null | Constraints |
|---|---|---|---|
| `id` | SERIAL | NO | PRIMARY KEY |
| `student_id` | INTEGER | NO | FK -> students(id) |
| `job_id` | INTEGER | NO | FK -> jobs(id) |
| `status` | VARCHAR(20) | NO | DEFAULT 'APPLIED'; CHECK (status IN ('APPLIED','SHORTLISTED','INTERVIEW','SELECTED','REJECTED','WITHDRAWN')) |
| `applied_at` | TIMESTAMP | NO | DEFAULT NOW() |

*Table Constraint:* `UNIQUE (student_id, job_id)`

#### interviews
| Column | Type | Null | Constraints |
|---|---|---|---|
| `id` | SERIAL | NO | PRIMARY KEY |
| `application_id` | INTEGER | NO | FK -> applications(id) ON DELETE CASCADE |
| `round_number` | INTEGER | NO | CHECK (round_number > 0) |
| `round_type` | VARCHAR(50) | NO | DEFAULT 'TECHNICAL'; CHECK (round_type IN ('ONLINE_TEST','TECHNICAL','HR','GROUP_DISCUSSION')) |
| `scheduled_at` | TIMESTAMP | YES | |
| `result` | VARCHAR(20) | NO | DEFAULT 'PENDING'; CHECK (result IN ('PENDING','CLEARED','REJECTED')) |
| `remarks` | TEXT | YES | |
| `reporting_time` | TIME | YES | |
| `venue` | VARCHAR(150) | YES | |
| `meeting_link` | VARCHAR(255) | YES | |
| `panelists` | TEXT | YES | |

*Table Constraint:* `UNIQUE (application_id, round_number)`

#### application_status_history
| Column | Type | Null | Constraints |
|---|---|---|---|
| `id` | SERIAL | NO | PRIMARY KEY |
| `application_id` | INTEGER | NO | FK -> applications(id) ON DELETE CASCADE |
| `old_status` | VARCHAR(20) | YES | |
| `new_status` | VARCHAR(20) | NO | |
| `changed_by` | VARCHAR(100) | NO | DEFAULT CURRENT_USER |
| `changed_at` | TIMESTAMP | NO | DEFAULT NOW() |

#### offers
| Column | Type | Null | Constraints |
|---|---|---|---|
| `id` | SERIAL | NO | PRIMARY KEY |
| `application_id` | INTEGER | NO | UNIQUE; FK -> applications(id) |
| `student_id` | INTEGER | NO | FK -> students(id) |
| `job_id` | INTEGER | NO | FK -> jobs(id) |
| `company_id` | INTEGER | NO | FK -> companies(id) |
| `base_lpa` | NUMERIC(10,2) | NO | DEFAULT 0; CHECK (base_lpa >= 0) |
| `bonus_lpa` | NUMERIC(10,2) | NO | DEFAULT 0; CHECK (bonus_lpa >= 0) |
| `esop_lpa` | NUMERIC(10,2) | NO | DEFAULT 0; CHECK (esop_lpa >= 0) |
| `package` | NUMERIC(10,2) | NO | CHECK (package >= 0) |
| `status` | VARCHAR(20) | NO | DEFAULT 'PENDING'; CHECK (status IN ('PENDING','ACCEPTED','DECLINED','LOCKED','SUPERSEDED')) |
| `released_at` | TIMESTAMP | NO | DEFAULT NOW() |
| `responded_at` | TIMESTAMP | YES | |

#### placements
| Column | Type | Null | Constraints |
|---|---|---|---|
| `id` | SERIAL | NO | PRIMARY KEY |
| `student_id` | INTEGER | NO | UNIQUE; FK -> students(id) |
| `application_id` | INTEGER | NO | UNIQUE; FK -> applications(id) |
| `offer_id` | INTEGER | NO | UNIQUE; FK -> offers(id) |
| `job_id` | INTEGER | NO | FK -> jobs(id) |
| `company_id` | INTEGER | NO | FK -> companies(id) |
| `package` | NUMERIC(10,2) | NO | CHECK (package >= 0) |
| `placement_date` | DATE | NO | DEFAULT CURRENT_DATE |

---

## 3. Views and Materialized Views

| View Name | Type | Underlying Tables | Purpose |
|---|---|---|---|
| `placement_summary` | VIEW | `placements`, `students`, `departments`, `companies`, `jobs` | Master placed student roster with package and role details. |
| `v_application_overview` | VIEW | `applications`, `students`, `jobs`, `companies`, `interviews` | Application tracker with student name, company, job title, and round count. |
| `v_department_stats` | VIEW | `departments`, `students`, `placements` | Aggregated placement rate, average CTC, and max CTC per academic department. |
| `v_company_selections` | VIEW | `companies`, `placements` | Total hires and average CTC offered per recruiting company. |
| `mv_placement_kpis` | MATERIALIZED VIEW | `students`, `placements` | Pre-aggregated institutional KPIs (total students, placed count, placement rate, average package, highest package). Refreshed via `CALL sp_refresh_analytics()`. |
| `v_student_status` | VIEW | `students`, `departments`, `placements`, `applications` | Student list with computed status (`PLACED`, `IN_INTERVIEW`, `UNPLACED`). |
| `v_offer_overview` | VIEW | `offers`, `students`, `jobs`, `companies` | Consolidated offer letters with full CTC breakdown (base, bonus, ESOP) and company tier. |

---

## 4. Key Triggers and Business Rules

- `trg_applications_validate_insert`: Enforces that the targeted job drive is `OPEN`, deadline has not passed, student meets minimum CGPA, active backlogs do not exceed limit, and placement tier policy permits application.
- `trg_applications_validate_status`: Enforces state machine progression:
  - `APPLIED` -> `SHORTLISTED` / `REJECTED` / `WITHDRAWN`
  - `SHORTLISTED` -> `INTERVIEW` / `REJECTED` / `WITHDRAWN`
  - `INTERVIEW` -> `SELECTED` / `REJECTED` / `WITHDRAWN`
  - `SELECTED`, `REJECTED`, and `WITHDRAWN` are terminal states.
- `trg_applications_create_offer`: Automatically creates a `PENDING` offer in `offers` when an application is transitioned to `SELECTED`.
- `trg_applications_log_status`: Inserts an immutable audit record into `application_status_history` on every status change.
- `trg_interviews_notify` & `trg_applications_notify`: Automatically create user notification records in `notifications` when an interview is scheduled or application status changes.

---

## 5. Schema Mappings & Integration Gaps

The table below reconciles differences across the frontend client models, FastAPI schemas, and PostgreSQL SQL schema:

| Domain | Frontend / Prototype Model | FastAPI Schema / SQLAlchemy Model | PostgreSQL SQL Schema | Current Resolution & Status |
|---|---|---|---|---|
| **Application Status** | APPLIED, UNDER_REVIEW, SHORTLISTED, ASSESSMENT, INTERVIEW, SELECTED, OFFER_RELEASED, OFFER_ACCEPTED, OFFER_DECLINED, OFFER_EXPIRED, REJECTED | APPLIED, SHORTLISTED, INTERVIEW, SELECTED, REJECTED, WITHDRAWN | APPLIED, SHORTLISTED, INTERVIEW, SELECTED, REJECTED, WITHDRAWN | **Integrated**: Backend and SQL agree. UI derives offer state from `offers` table. |
| **Offer Status** | PENDING, ACCEPTED, DECLINED, EXPIRED | PENDING, ACCEPTED, DECLINED, LOCKED, SUPERSEDED | PENDING, ACCEPTED, DECLINED, LOCKED, SUPERSEDED | **Integrated**: Backend maps DB statuses directly to frontend offer badge. |
| **Notifications** | Multi-recipient mock object | Student targeted list; non-student returns `[]` | `notifications.student_id` (FK to students) | **Integrated**: Staff/Admin receive clean empty list without 403 crash. Institutional notifications planned for Phase 2. |
| **Messaging** | Multi-party threads in `mockApi.js` | None | None | **Planned**: Real database tables and WebSocket endpoints for chat not yet implemented. |
| **Placement Policies** | Client policy configuration modal | Hardcoded institutional policy functions | `fn_policy_allows()` function | **Implemented in SQL**: Dynamic policy table planned for Phase 2. |
| **Staff Profile** | Staff designation, office, title | Role-isolated `UserOut` | `users` table (`role = 'STAFF'`) | **Integrated**: Staff profile renders institutional fields, isolating student academic fields. |
