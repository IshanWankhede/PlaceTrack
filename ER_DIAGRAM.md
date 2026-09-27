# Entity-Relationship Diagram — Placement Management & Analytics System

## Mermaid ER Diagram

```mermaid
erDiagram
    DEPARTMENTS ||--o{ STUDENTS : "has"
    STUDENTS ||--o{ STUDENT_SKILLS : "has"
    SKILLS ||--o{ STUDENT_SKILLS : "assigned to"
    STUDENTS ||--o{ APPLICATIONS : "submits"
    JOBS ||--o{ APPLICATIONS : "receives"
    COMPANIES ||--o{ JOBS : "posts"
    JOBS ||--o{ JOB_SKILLS : "requires"
    SKILLS ||--o{ JOB_SKILLS : "required by"
    APPLICATIONS ||--o{ INTERVIEWS : "has rounds"
    STUDENTS ||--o| PLACEMENTS : "results in"
    JOBS ||--o{ PLACEMENTS : "fills"
    COMPANIES ||--o{ PLACEMENTS : "hires via"

    DEPARTMENTS {
        int id PK
        string name
        string code UK
    }

    STUDENTS {
        int id PK
        string roll_number UK
        string name
        string email UK
        string phone
        numeric cgpa
        int graduation_year
        int department_id FK
        timestamp created_at
    }

    SKILLS {
        int id PK
        string name UK
    }

    STUDENT_SKILLS {
        int student_id PK_FK
        int skill_id PK_FK
        string proficiency
    }

    COMPANIES {
        int id PK
        string name UK
        string industry
        string location
        string website
        string description
    }

    JOBS {
        int id PK
        int company_id FK
        string title
        string description
        numeric minimum_cgpa
        numeric package
        string job_type
        string location
        date application_deadline
        string status
        timestamp created_at
    }

    JOB_SKILLS {
        int job_id PK_FK
        int skill_id PK_FK
        string required_level
    }

    APPLICATIONS {
        int id PK
        int student_id FK
        int job_id FK
        string status
        timestamp applied_at
    }

    INTERVIEWS {
        int id PK
        int application_id FK
        int round_number
        string round_type
        timestamp scheduled_at
        string result
        string remarks
    }

    PLACEMENTS {
        int id PK
        int student_id FK_UK
        int job_id FK
        int company_id FK
        numeric package
        date placement_date
    }
```

> This block renders as a diagram in any Mermaid-compatible viewer (GitHub, GitLab, Notion, VS Code with the Mermaid extension, mermaid.live, etc.).

---

## Relationship Summary

| Relationship | Cardinality | Notes |
|---|---|---|
| Departments → Students | 1 : M | Each student belongs to exactly one department |
| Students ↔ Skills | M : M | via `student_skills`, carries `proficiency` |
| Companies → Jobs | 1 : M | Each job belongs to one company |
| Jobs ↔ Skills | M : M | via `job_skills`, carries `required_level` |
| Students → Applications | 1 : M | A student can apply to many jobs |
| Jobs → Applications | 1 : M | A job can receive many applications |
| Applications → Interviews | 1 : M | Each application can have multiple interview rounds |
| Students → Placements | 1 : 0..1 | A student has at most one final placement |
| Jobs → Placements | 1 : M | A job can place multiple students (if multiple openings) |
| Companies → Placements | 1 : M | A company can place multiple students across jobs |

---

## ASCII Overview (Quick Reference)

```
DEPARTMENTS ──1:M──► STUDENTS ◄──M:M──► SKILLS
                         │
                         │ 1:M
                         ▼
COMPANIES ──1:M──► JOBS ◄──M:M──► SKILLS
                     │
                     │ 1:M
                     ▼
                APPLICATIONS ◄──── STUDENTS
                     │
                     │ 1:M
                     ▼
                INTERVIEWS

APPLICATIONS ──(status = SELECTED, via trigger)──► PLACEMENTS
```
