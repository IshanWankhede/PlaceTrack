# Database Schema — Placement Management & Analytics System

Target: PostgreSQL 14+. Schema normalized to **3NF**.

---

## 1. Table Definitions

### `departments`
| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL |
| code | VARCHAR(10) | NOT NULL, UNIQUE |

```sql
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE
);
```

---

### `students`
| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| roll_number | VARCHAR(20) | NOT NULL, UNIQUE |
| name | VARCHAR(150) | NOT NULL |
| email | VARCHAR(150) | NOT NULL, UNIQUE |
| phone | VARCHAR(15) | |
| cgpa | NUMERIC(3,2) | NOT NULL, CHECK (cgpa BETWEEN 0 AND 10) |
| graduation_year | INTEGER | NOT NULL, CHECK (graduation_year >= 2000) |
| department_id | INTEGER | FK → departments(id), NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |

```sql
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    roll_number VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(15),
    cgpa NUMERIC(3,2) NOT NULL CHECK (cgpa BETWEEN 0 AND 10),
    graduation_year INTEGER NOT NULL CHECK (graduation_year >= 2000),
    department_id INTEGER NOT NULL REFERENCES departments(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### `skills`
| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL, UNIQUE |

```sql
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);
```

---

### `student_skills` (M:M junction — Students ↔ Skills)
| Column | Type | Constraints |
|---|---|---|
| student_id | INTEGER | PK, FK → students(id) |
| skill_id | INTEGER | PK, FK → skills(id) |
| proficiency | VARCHAR(20) | CHECK (proficiency IN ('BEGINNER','INTERMEDIATE','ADVANCED','EXPERT')) |

```sql
CREATE TABLE student_skills (
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    proficiency VARCHAR(20) CHECK (proficiency IN ('BEGINNER','INTERMEDIATE','ADVANCED','EXPERT')),
    PRIMARY KEY (student_id, skill_id)
);
```

---

### `companies`
| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(150) | NOT NULL, UNIQUE |
| industry | VARCHAR(100) | |
| location | VARCHAR(150) | |
| website | VARCHAR(255) | |
| description | TEXT | |

```sql
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    industry VARCHAR(100),
    location VARCHAR(150),
    website VARCHAR(255),
    description TEXT
);
```

---

### `jobs`
| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| company_id | INTEGER | FK → companies(id), NOT NULL |
| title | VARCHAR(150) | NOT NULL |
| description | TEXT | |
| minimum_cgpa | NUMERIC(3,2) | NOT NULL, CHECK (minimum_cgpa BETWEEN 0 AND 10) |
| package | NUMERIC(10,2) | CHECK (package >= 0) |
| job_type | VARCHAR(20) | CHECK (job_type IN ('FULL_TIME','INTERNSHIP','PPO')) |
| location | VARCHAR(150) | |
| application_deadline | DATE | |
| status | VARCHAR(20) | DEFAULT 'OPEN', CHECK (status IN ('OPEN','CLOSED')) |
| created_at | TIMESTAMP | DEFAULT NOW() |

```sql
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    minimum_cgpa NUMERIC(3,2) NOT NULL CHECK (minimum_cgpa BETWEEN 0 AND 10),
    package NUMERIC(10,2) CHECK (package >= 0),
    job_type VARCHAR(20) CHECK (job_type IN ('FULL_TIME','INTERNSHIP','PPO')),
    location VARCHAR(150),
    application_deadline DATE,
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN','CLOSED')),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### `job_skills` (M:M junction — Jobs ↔ Skills)
| Column | Type | Constraints |
|---|---|---|
| job_id | INTEGER | PK, FK → jobs(id) |
| skill_id | INTEGER | PK, FK → skills(id) |
| required_level | VARCHAR(20) | CHECK (required_level IN ('BEGINNER','INTERMEDIATE','ADVANCED','EXPERT')) |

```sql
CREATE TABLE job_skills (
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    required_level VARCHAR(20) CHECK (required_level IN ('BEGINNER','INTERMEDIATE','ADVANCED','EXPERT')),
    PRIMARY KEY (job_id, skill_id)
);
```

---

### `applications`
| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| student_id | INTEGER | FK → students(id), NOT NULL |
| job_id | INTEGER | FK → jobs(id), NOT NULL |
| status | VARCHAR(20) | DEFAULT 'APPLIED', CHECK (status IN ('APPLIED','SHORTLISTED','INTERVIEW','SELECTED','REJECTED','WITHDRAWN')) |
| applied_at | TIMESTAMP | DEFAULT NOW() |
| | | UNIQUE (student_id, job_id) — a student can apply to a given job only once |

```sql
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id),
    job_id INTEGER NOT NULL REFERENCES jobs(id),
    status VARCHAR(20) DEFAULT 'APPLIED'
        CHECK (status IN ('APPLIED','SHORTLISTED','INTERVIEW','SELECTED','REJECTED','WITHDRAWN')),
    applied_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (student_id, job_id)
);
```

---

### `interviews`
| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| application_id | INTEGER | FK → applications(id), NOT NULL |
| round_number | INTEGER | NOT NULL, CHECK (round_number > 0) |
| round_type | VARCHAR(50) | e.g. 'TECHNICAL','APTITUDE','HR' |
| scheduled_at | TIMESTAMP | |
| result | VARCHAR(20) | CHECK (result IN ('PENDING','CLEARED','REJECTED')), DEFAULT 'PENDING' |
| remarks | TEXT | |
| | | UNIQUE (application_id, round_number) |

```sql
CREATE TABLE interviews (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id),
    round_number INTEGER NOT NULL CHECK (round_number > 0),
    round_type VARCHAR(50),
    scheduled_at TIMESTAMP,
    result VARCHAR(20) DEFAULT 'PENDING' CHECK (result IN ('PENDING','CLEARED','REJECTED')),
    remarks TEXT,
    UNIQUE (application_id, round_number)
);
```

---

### `placements`
| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| student_id | INTEGER | FK → students(id), NOT NULL, UNIQUE (one placement per student) |
| job_id | INTEGER | FK → jobs(id), NOT NULL |
| company_id | INTEGER | FK → companies(id), NOT NULL |
| package | NUMERIC(10,2) | NOT NULL, CHECK (package >= 0) |
| placement_date | DATE | NOT NULL, DEFAULT CURRENT_DATE |

```sql
CREATE TABLE placements (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL UNIQUE REFERENCES students(id),
    job_id INTEGER NOT NULL REFERENCES jobs(id),
    company_id INTEGER NOT NULL REFERENCES companies(id),
    package NUMERIC(10,2) NOT NULL CHECK (package >= 0),
    placement_date DATE NOT NULL DEFAULT CURRENT_DATE
);
```

> Design note: `student_id UNIQUE` on `placements` enforces "one final placement per student" — adjust if the institution allows students to hold multiple offers simultaneously before choosing one.

---

## 2. Indexes

```sql
CREATE INDEX idx_students_department ON students(department_id);
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_interviews_application ON interviews(application_id);
CREATE INDEX idx_placements_company ON placements(company_id);
```

---

## 3. View: `placement_summary`

```sql
CREATE VIEW placement_summary AS
SELECT
    s.id            AS student_id,
    s.name          AS student_name,
    d.name          AS department,
    c.name          AS company,
    j.title         AS job_role,
    p.package,
    p.placement_date
FROM placements p
JOIN students s   ON p.student_id = s.id
JOIN departments d ON s.department_id = d.id
JOIN companies c  ON p.company_id = c.id
JOIN jobs j       ON p.job_id = j.id;
```

---

## 4. Trigger: Auto-create Placement on Selection

```sql
CREATE OR REPLACE FUNCTION create_placement_on_selection()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'SELECTED' AND
       (OLD.status IS DISTINCT FROM 'SELECTED') THEN
        INSERT INTO placements (student_id, job_id, company_id, package, placement_date)
        SELECT NEW.student_id, j.id, j.company_id, j.package, CURRENT_DATE
        FROM jobs j
        WHERE j.id = NEW.job_id
        ON CONFLICT (student_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_application_selected
AFTER UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION create_placement_on_selection();
```

---

## 5. Analytics Queries (Reference)

**Placement rate:**
```sql
SELECT
    ROUND(100.0 * COUNT(DISTINCT p.student_id) / COUNT(DISTINCT s.id), 2) AS placement_rate
FROM students s
LEFT JOIN placements p ON s.id = p.student_id;
```

**Average package by department:**
```sql
SELECT d.name, AVG(p.package) AS avg_package
FROM placements p
JOIN students s ON p.student_id = s.id
JOIN departments d ON s.department_id = d.id
GROUP BY d.name;
```

**Company selection count:**
```sql
SELECT c.name, COUNT(*) AS selections
FROM placements p
JOIN companies c ON p.company_id = c.id
GROUP BY c.name
ORDER BY selections DESC;
```

**Highest package:**
```sql
SELECT MAX(package) AS highest_package FROM placements;
```

**Students above average CGPA:**
```sql
SELECT * FROM students
WHERE cgpa > (SELECT AVG(cgpa) FROM students);
```

**Departments with placement rate having > 50%:**
```sql
SELECT d.name,
       COUNT(DISTINCT p.student_id) AS placed,
       COUNT(DISTINCT s.id) AS total,
       ROUND(100.0 * COUNT(DISTINCT p.student_id) / COUNT(DISTINCT s.id), 2) AS rate
FROM students s
JOIN departments d ON s.department_id = d.id
LEFT JOIN placements p ON s.id = p.student_id
GROUP BY d.name
HAVING COUNT(DISTINCT p.student_id) * 1.0 / COUNT(DISTINCT s.id) > 0.5;
```

---

## 6. DBMS Concepts Checklist

| Feature | Where Implemented |
|---|---|
| Primary Keys | Every table |
| Foreign Keys | students→departments, jobs→companies, applications→students/jobs, interviews→applications, placements→students/jobs/companies |
| Composite Primary Keys | `student_skills`, `job_skills` |
| UNIQUE constraints | roll_number, email, department.code, company.name, applications(student_id, job_id), placements.student_id |
| NOT NULL constraints | Core identifying/required fields across all tables |
| CHECK constraints | cgpa range, graduation_year, status enums, package ≥ 0, round_number > 0 |
| 1:M relationships | departments→students, companies→jobs, applications→interviews |
| M:M relationships | students↔skills, jobs↔skills |
| Normalization (3NF) | All tables — no transitive/partial dependencies |
| INNER JOIN | Used across all reporting/analytics queries |
| LEFT JOIN | Placement rate query (students without placements included) |
| GROUP BY / HAVING | Department/company aggregations |
| Subqueries | Average CGPA comparison, HAVING clause rate calc |
| Aggregate functions | COUNT, AVG, MAX, SUM |
| Views | `placement_summary` |
| Indexes | On FK columns and `applications.status` |
| Transactions | Wrap application status update + trigger-driven placement insert |
| Trigger | `trg_application_selected` |
