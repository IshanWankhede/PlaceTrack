-- =====================================================================
-- PlaceTrack | 01_ddl.sql | DDL: tables, constraints, indexes
-- Runs automatically on first start of the db container.
-- Package amounts are in LPA (lakhs per annum).
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- used for bcrypt hashing in seed data

-- ---------------------------------------------------------------- departments
CREATE TABLE departments (
    id    SERIAL       PRIMARY KEY,
    name  VARCHAR(100) NOT NULL UNIQUE,
    code  VARCHAR(10)  NOT NULL UNIQUE
);

-- ---------------------------------------------------------------- students
CREATE TABLE students (
    id               SERIAL        PRIMARY KEY,
    roll_number      VARCHAR(20)   NOT NULL UNIQUE,
    name             VARCHAR(150)  NOT NULL,
    email            VARCHAR(150)  NOT NULL UNIQUE,
    phone            VARCHAR(15),
    cgpa             NUMERIC(3,2)  NOT NULL CHECK (cgpa BETWEEN 0 AND 10),
    graduation_year  INTEGER       NOT NULL CHECK (graduation_year >= 2000),
    department_id    INTEGER       NOT NULL REFERENCES departments(id),
    active_backlogs  INTEGER       NOT NULL DEFAULT 0 CHECK (active_backlogs >= 0),
    cgpa_verified    BOOLEAN       NOT NULL DEFAULT FALSE,   -- scorecard approved by CDC staff
    resume_url       VARCHAR(255),                           -- link (file upload is out of scope for v1)
    photo_url        VARCHAR(255),
    created_at       TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------- users (login accounts)
CREATE TABLE users (
    id             SERIAL        PRIMARY KEY,
    email          VARCHAR(150)  NOT NULL UNIQUE,
    password_hash  VARCHAR(255)  NOT NULL,
    role           VARCHAR(20)   NOT NULL DEFAULT 'STAFF'
                   CHECK (role IN ('ADMIN','STAFF','STUDENT')),
    student_id     INTEGER       UNIQUE REFERENCES students(id) ON DELETE CASCADE,
    is_active      BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP     NOT NULL DEFAULT NOW(),
    -- STUDENT accounts must point to a student row; ADMIN/STAFF must not
    CONSTRAINT chk_user_role_student CHECK (
        (role = 'STUDENT' AND student_id IS NOT NULL) OR
        (role <> 'STUDENT' AND student_id IS NULL)
    )
);

-- ---------------------------------------------------------------- email OTPs (signup / password reset)
CREATE TABLE email_otps (
    id          SERIAL        PRIMARY KEY,
    email       VARCHAR(150)  NOT NULL,
    purpose     VARCHAR(20)   NOT NULL CHECK (purpose IN ('SIGNUP','PASSWORD_RESET')),
    otp_hash    VARCHAR(255)  NOT NULL,               -- bcrypt hash, the plain OTP is never stored
    expires_at  TIMESTAMP     NOT NULL,
    attempts    INTEGER       NOT NULL DEFAULT 0,
    consumed    BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------- in-app notifications (written by triggers)
CREATE TABLE notifications (
    id          SERIAL        PRIMARY KEY,
    student_id  INTEGER       NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    type        VARCHAR(20)   NOT NULL CHECK (type IN ('APPLICATION','INTERVIEW','OFFER','SYSTEM')),
    title       VARCHAR(150)  NOT NULL,
    message     TEXT          NOT NULL,
    is_read     BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------- skills
CREATE TABLE skills (
    id    SERIAL       PRIMARY KEY,
    name  VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE student_skills (
    student_id   INTEGER     NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    skill_id     INTEGER     NOT NULL REFERENCES skills(id)   ON DELETE CASCADE,
    proficiency  VARCHAR(20) NOT NULL DEFAULT 'BEGINNER'
                 CHECK (proficiency IN ('BEGINNER','INTERMEDIATE','ADVANCED','EXPERT')),
    PRIMARY KEY (student_id, skill_id)
);

-- ---------------------------------------------------------------- companies & jobs
CREATE TABLE companies (
    id           SERIAL        PRIMARY KEY,
    name         VARCHAR(150)  NOT NULL UNIQUE,
    industry     VARCHAR(100),
    location     VARCHAR(150),
    website      VARCHAR(255),
    description  TEXT,
    tier         VARCHAR(20)   NOT NULL DEFAULT 'CORE'
                 CHECK (tier IN ('CORE','DREAM','SUPER_DREAM')),   -- drives the single/dream-offer policy
    logo_url     VARCHAR(255)
);

CREATE TABLE company_contacts (
    id           SERIAL        PRIMARY KEY,
    company_id   INTEGER       NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name         VARCHAR(150)  NOT NULL,
    designation  VARCHAR(100),
    email        VARCHAR(150),
    phone        VARCHAR(20)
);

CREATE TABLE jobs (
    id                    SERIAL         PRIMARY KEY,
    company_id            INTEGER        NOT NULL REFERENCES companies(id),
    title                 VARCHAR(150)   NOT NULL,
    description           TEXT,
    minimum_cgpa          NUMERIC(3,2)   NOT NULL CHECK (minimum_cgpa BETWEEN 0 AND 10),
    package               NUMERIC(10,2)  CHECK (package >= 0),      -- CTC in LPA (lower end of the range)
    package_max           NUMERIC(10,2)  CHECK (package_max IS NULL OR package IS NULL OR package_max >= package),
    max_backlogs          INTEGER        NOT NULL DEFAULT 0 CHECK (max_backlogs >= 0),
    job_type              VARCHAR(20)    NOT NULL DEFAULT 'FULL_TIME'
                          CHECK (job_type IN ('FULL_TIME','INTERNSHIP','PPO')),
    location              VARCHAR(150),
    drive_date            DATE,
    application_deadline  DATE,
    status                VARCHAR(20)    NOT NULL DEFAULT 'OPEN'
                          CHECK (status IN ('OPEN','CLOSED','ARCHIVED')),
    created_at            TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE TABLE job_skills (
    job_id          INTEGER     NOT NULL REFERENCES jobs(id)   ON DELETE CASCADE,
    skill_id        INTEGER     NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    required_level  VARCHAR(20) NOT NULL DEFAULT 'BEGINNER'
                    CHECK (required_level IN ('BEGINNER','INTERMEDIATE','ADVANCED','EXPERT')),
    PRIMARY KEY (job_id, skill_id)
);

-- Department scope: NO rows for a job = open to every department.
CREATE TABLE job_departments (
    job_id         INTEGER NOT NULL REFERENCES jobs(id)        ON DELETE CASCADE,
    department_id  INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, department_id)
);

-- ---------------------------------------------------------------- applications & interviews
CREATE TABLE applications (
    id          SERIAL      PRIMARY KEY,
    student_id  INTEGER     NOT NULL REFERENCES students(id),
    job_id      INTEGER     NOT NULL REFERENCES jobs(id),
    status      VARCHAR(20) NOT NULL DEFAULT 'APPLIED'
                CHECK (status IN ('APPLIED','SHORTLISTED','INTERVIEW','SELECTED','REJECTED','WITHDRAWN')),
    applied_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, job_id)
);

CREATE TABLE interviews (
    id              SERIAL       PRIMARY KEY,
    application_id  INTEGER      NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    round_number    INTEGER      NOT NULL CHECK (round_number > 0),
    round_type      VARCHAR(50)  NOT NULL DEFAULT 'TECHNICAL'
                    CHECK (round_type IN ('ONLINE_TEST','TECHNICAL','HR','GROUP_DISCUSSION')),
    scheduled_at    TIMESTAMP,
    result          VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                    CHECK (result IN ('PENDING','CLEARED','REJECTED')),
    remarks         TEXT,
    reporting_time  TIME,
    venue           VARCHAR(150),
    meeting_link    VARCHAR(255),
    panelists       TEXT,
    UNIQUE (application_id, round_number)
);

-- Audit trail filled by a trigger (see 05_triggers.sql)
CREATE TABLE application_status_history (
    id              SERIAL       PRIMARY KEY,
    application_id  INTEGER      NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    old_status      VARCHAR(20),
    new_status      VARCHAR(20)  NOT NULL,
    changed_by      VARCHAR(100) NOT NULL DEFAULT CURRENT_USER,
    changed_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------- offers
-- A SELECTED application creates a PENDING offer (trigger). The student accepts or declines
-- (sp_respond_to_offer). Only an ACCEPTED offer becomes a row in placements.
CREATE TABLE offers (
    id              SERIAL         PRIMARY KEY,
    application_id  INTEGER        NOT NULL UNIQUE REFERENCES applications(id),
    student_id      INTEGER        NOT NULL REFERENCES students(id),
    job_id          INTEGER        NOT NULL REFERENCES jobs(id),
    company_id      INTEGER        NOT NULL REFERENCES companies(id),
    base_lpa        NUMERIC(10,2)  NOT NULL DEFAULT 0 CHECK (base_lpa  >= 0),
    bonus_lpa       NUMERIC(10,2)  NOT NULL DEFAULT 0 CHECK (bonus_lpa >= 0),
    esop_lpa        NUMERIC(10,2)  NOT NULL DEFAULT 0 CHECK (esop_lpa  >= 0),
    package         NUMERIC(10,2)  NOT NULL CHECK (package >= 0),             -- total CTC
    status          VARCHAR(20)    NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','ACCEPTED','DECLINED','LOCKED','SUPERSEDED')),
    released_at     TIMESTAMP      NOT NULL DEFAULT NOW(),
    responded_at    TIMESTAMP
);

-- ---------------------------------------------------------------- placements (= accepted offers only)
CREATE TABLE placements (
    id              SERIAL         PRIMARY KEY,
    student_id      INTEGER        NOT NULL UNIQUE REFERENCES students(id),   -- one current placement per student
    application_id  INTEGER        NOT NULL UNIQUE REFERENCES applications(id),
    offer_id        INTEGER        NOT NULL UNIQUE REFERENCES offers(id),
    job_id          INTEGER        NOT NULL REFERENCES jobs(id),
    company_id      INTEGER        NOT NULL REFERENCES companies(id),
    package         NUMERIC(10,2)  NOT NULL CHECK (package >= 0),             -- snapshot of the accepted CTC
    placement_date  DATE           NOT NULL DEFAULT CURRENT_DATE
);

-- ---------------------------------------------------------------- indexes (FKs + hot filters)
CREATE INDEX idx_students_department      ON students(department_id);
CREATE INDEX idx_students_cgpa            ON students(cgpa);
CREATE INDEX idx_student_skills_skill     ON student_skills(skill_id);
CREATE INDEX idx_jobs_company             ON jobs(company_id);
CREATE INDEX idx_jobs_status              ON jobs(status);
CREATE INDEX idx_job_skills_skill         ON job_skills(skill_id);
CREATE INDEX idx_applications_student     ON applications(student_id);
CREATE INDEX idx_applications_job         ON applications(job_id);
CREATE INDEX idx_applications_status      ON applications(status);
CREATE INDEX idx_interviews_application   ON interviews(application_id);
CREATE INDEX idx_status_history_app       ON application_status_history(application_id);
CREATE INDEX idx_placements_company       ON placements(company_id);
CREATE INDEX idx_placements_job           ON placements(job_id);
CREATE INDEX idx_company_contacts_company ON company_contacts(company_id);
CREATE INDEX idx_notifications_student    ON notifications(student_id, is_read);
CREATE INDEX idx_email_otps_lookup        ON email_otps(email, purpose);
CREATE INDEX idx_offers_student           ON offers(student_id);
CREATE INDEX idx_offers_job               ON offers(job_id);
CREATE INDEX idx_offers_company           ON offers(company_id);
CREATE INDEX idx_offers_status            ON offers(status);
CREATE INDEX idx_job_departments_dept     ON job_departments(department_id);
CREATE INDEX idx_companies_tier           ON companies(tier);
