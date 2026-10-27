# Entity-Relationship Diagram

Generated from the verified executable schema `sql/init/01_ddl.sql` (17 tables, 24 foreign keys) active in the `placetrack-db` PostgreSQL 16 container. It reflects the live database structure; entities that appear only in frontend prototypes (such as conversations, chat messages, or dynamic policy configurations) are intentionally excluded and documented as planned. See [DB_SCHEMA.md](./DB_SCHEMA.md#5-schema-mappings--integration-gaps).


```mermaid
erDiagram
    APPLICATIONS ||--o{ APPLICATION_STATUS_HISTORY : "application_id"
    APPLICATIONS ||--o{ INTERVIEWS : "application_id"
    APPLICATIONS ||--o| OFFERS : "application_id"
    APPLICATIONS ||--o| PLACEMENTS : "application_id"
    COMPANIES ||--o{ COMPANY_CONTACTS : "company_id"
    COMPANIES ||--o{ JOBS : "company_id"
    COMPANIES ||--o{ OFFERS : "company_id"
    COMPANIES ||--o{ PLACEMENTS : "company_id"
    DEPARTMENTS ||--o{ JOB_DEPARTMENTS : "department_id"
    DEPARTMENTS ||--o{ STUDENTS : "department_id"
    JOBS ||--o{ APPLICATIONS : "job_id"
    JOBS ||--o{ JOB_DEPARTMENTS : "job_id"
    JOBS ||--o{ JOB_SKILLS : "job_id"
    JOBS ||--o{ OFFERS : "job_id"
    JOBS ||--o{ PLACEMENTS : "job_id"
    OFFERS ||--o| PLACEMENTS : "offer_id"
    SKILLS ||--o{ JOB_SKILLS : "skill_id"
    SKILLS ||--o{ STUDENT_SKILLS : "skill_id"
    STUDENTS |o--o| USERS : "student_id"
    STUDENTS ||--o{ APPLICATIONS : "student_id"
    STUDENTS ||--o{ NOTIFICATIONS : "student_id"
    STUDENTS ||--o{ OFFERS : "student_id"
    STUDENTS ||--o{ STUDENT_SKILLS : "student_id"
    STUDENTS ||--o| PLACEMENTS : "student_id"
    DEPARTMENTS {
        serial id PK
        varchar name UK
        varchar code UK
    }
    STUDENTS {
        serial id PK
        varchar roll_number UK
        varchar name
        varchar email UK
        varchar phone
        numeric cgpa
        integer graduation_year
        integer department_id FK
        integer active_backlogs
        boolean cgpa_verified
        varchar resume_url
        varchar photo_url
        timestamp created_at
    }
    USERS {
        serial id PK
        varchar email UK
        varchar password_hash
        varchar role
        integer student_id FK,UK
        boolean is_active
        timestamp created_at
    }
    EMAIL_OTPS {
        serial id PK
        varchar email
        varchar purpose
        varchar otp_hash
        timestamp expires_at
        integer attempts
        boolean consumed
        timestamp created_at
    }
    NOTIFICATIONS {
        serial id PK
        integer student_id FK
        varchar type
        varchar title
        text message
        boolean is_read
        timestamp created_at
    }
    SKILLS {
        serial id PK
        varchar name UK
    }
    STUDENT_SKILLS {
        integer student_id PK,FK
        integer skill_id PK,FK
        varchar proficiency
    }
    COMPANIES {
        serial id PK
        varchar name UK
        varchar industry
        varchar location
        varchar website
        text description
        varchar tier
        varchar logo_url
    }
    COMPANY_CONTACTS {
        serial id PK
        integer company_id FK
        varchar name
        varchar designation
        varchar email
        varchar phone
    }
    JOBS {
        serial id PK
        integer company_id FK
        varchar title
        text description
        numeric minimum_cgpa
        numeric package
        numeric package_max
        integer max_backlogs
        varchar job_type
        varchar location
        date drive_date
        date application_deadline
        varchar status
        timestamp created_at
    }
    JOB_SKILLS {
        integer job_id PK,FK
        integer skill_id PK,FK
        varchar required_level
    }
    JOB_DEPARTMENTS {
        integer job_id PK,FK
        integer department_id PK,FK
    }
    APPLICATIONS {
        serial id PK
        integer student_id FK
        integer job_id FK
        varchar status
        timestamp applied_at
    }
    INTERVIEWS {
        serial id PK
        integer application_id FK
        integer round_number
        varchar round_type
        timestamp scheduled_at
        varchar result
        text remarks
        time reporting_time
        varchar venue
        varchar meeting_link
        text panelists
    }
    APPLICATION_STATUS_HISTORY {
        serial id PK
        integer application_id FK
        varchar old_status
        varchar new_status
        varchar changed_by
        timestamp changed_at
    }
    OFFERS {
        serial id PK
        integer application_id FK,UK
        integer student_id FK
        integer job_id FK
        integer company_id FK
        numeric base_lpa
        numeric bonus_lpa
        numeric esop_lpa
        numeric package
        varchar status
        timestamp released_at
        timestamp responded_at
    }
    PLACEMENTS {
        serial id PK
        integer student_id FK,UK
        integer application_id FK,UK
        integer offer_id FK,UK
        integer job_id FK
        integer company_id FK
        numeric package
        date placement_date
    }
```

## Reading the diagram

- `||--o{` means exactly one parent to zero or many children; `|o` means the parent reference is optional (nullable FK); `o|` on the child side means at most one child (the FK column is UNIQUE).
- Junction tables `student_skills`, `job_skills` and `job_departments` use composite primary keys.
- `placements` is one row per student (`student_id` UNIQUE) and is created or upgraded only when an offer is accepted (`sp_respond_to_offer`).

## Relationships the diagram cannot express

- **Tier policy:** a student with a placement may only receive offers from a company with a higher `companies.tier` (`fn_policy_allows`, `trg_applications_create_offer`).
- **Eligibility:** computed by `fn_is_eligible` from `students`, `jobs`, `job_departments`, `job_skills` and `student_skills`; there is no stored eligibility table.
- **Application status:** legal transitions are enforced by a trigger, not by foreign keys.
- **Notifications and audit rows** are written by triggers, not by application code.
