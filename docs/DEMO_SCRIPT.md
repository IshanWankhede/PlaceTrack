# PlaceTrack — Viva & Demonstration Script

This document provides a minute-by-minute walkthrough for the DBMS course viva and project presentation, followed by anticipated external examiner questions with model answers.

---

## ⏱️ Minute-by-Minute Demonstration Flow (Total: ~22 minutes)

### Part 1: Schema & Entity-Relationship Architecture (3 mins)
**Tool**: pgAdmin 4 (`localhost:5433` -> `placetrack_db`)
1. **Navigate to Database Tree**:
   - Expand `Servers` → `PlaceTrack PostgreSQL 16` → `Databases` → `placetrack_db` → `Schemas` → `public`.
   - Right-click on `Tables` → **Generate ERD**.
2. **Key Talking Points**:
   - Highlight the **17 tables** in 3NF (Third Normal Form):
     - **Core Entities**: `departments`, `skills`, `students`, `companies`, `jobs`, `users`.
     - **Relationship / Junction Tables**: `student_skills`, `job_skills`, `job_departments`.
     - **Transactional Lifecycle**: `applications`, `application_status_history`, `interviews`, `offers`, `placements`.
     - **Security & Notification**: `email_otps`, `notifications`.
   - Zero surrogate key redundancy on junction tables; natural composite primary keys are used (`student_skills (student_id, skill_id)`).

---

### Part 2: DDL & Integrity Constraints (3 mins)
**Tool**: Query Tool in pgAdmin (`sql/demo/07_ddl_demo.sql`)
1. **Show DDL Constraints on `students`, `jobs`, and `applications`**:
   ```sql
   -- View table definition and constraints
   \d students
   \d jobs
   \d applications
   ```
2. **Demonstrate Enforced Constraints**:
   - **Domain & Range CHECK Constraints**:
     - `students.cgpa BETWEEN 0.00 AND 10.00`
     - `students.active_backlogs >= 0`
     - `jobs.minimum_cgpa BETWEEN 0.00 AND 10.00`
     - `jobs.package > 0`
   - **Enumerated Types & State Machine Integrity**:
     - Application status: `APPLIED`, `SHORTLISTED`, `INTERVIEW`, `SELECTED`, `REJECTED`, `WITHDRAWN`.
     - Company tiers: `CORE`, `DREAM`, `SUPER_DREAM`.
   - **Referential Integrity**:
     - `ON DELETE RESTRICT` on departments and companies to preserve historical audit records.
     - `ON DELETE CASCADE` on transient junction rows like `job_skills`.

---

### Part 3: DML, Joins, Aggregates & Complex DQL (4 mins)
**Tool**: Query Tool in pgAdmin (`sql/demo/10_dql_joins.sql`, `11_dql_aggregates.sql`, `12_dql_subqueries_cte.sql`)
1. **Multi-Table Joins**:
   - Execute query joining `applications`, `students`, `jobs`, `companies`, and `departments` to display the active recruitment cohort.
2. **Aggregates & GROUP BY**:
   - Query department-wise placement metrics:
     ```sql
     SELECT 
         d.name AS department,
         COUNT(s.id) AS total_students,
         COUNT(p.id) AS placed_students,
         ROUND(AVG(p.package), 2) AS avg_package_lpa,
         MAX(p.package) AS highest_package_lpa
     FROM departments d
     LEFT JOIN students s ON s.department_id = d.id
     LEFT JOIN placements p ON p.student_id = s.id
     GROUP BY d.id, d.name
     ORDER BY placed_students DESC;
     ```
3. **Subqueries & Window Functions**:
   - Demonstrate `DENSE_RANK() OVER (PARTITION BY department_id ORDER BY cgpa DESC)` for student merit rankings.
   - Run Common Table Expression (CTE) query calculating conversion funnel drop-offs per round.

---

### Part 4: Views, Stored Functions, Procedures & Triggers (5 mins)
**Tool**: Query Tool in pgAdmin (`sql/demo/15_procedures_triggers_demo.sql`)
1. **Materialized Views**:
   - Inspect `mv_placement_kpis`:
     ```sql
     SELECT * FROM mv_placement_kpis;
     ```
   - Explain why a Materialized View is used (fast O(1) dashboard loading, refreshed concurrently or scheduled via `CALL sp_refresh_analytics()`).
2. **Eligibility Engine (`fn_is_eligible`)**:
   - Test student eligibility against job requirements:
     ```sql
     -- Student 1 (Aarav, CGPA 8.70) against Job 1 (Min CGPA 8.00):
     SELECT fn_is_eligible(1, 1); -- Returns TRUE
     -- Student 3 (Rohan, 1 backlog) against Job 1 (Max backlogs 0):
     SELECT fn_is_eligible(3, 1); -- Returns FALSE
     ```
3. **Trigger Enforcements & Blocked Invariants**:
   - Show trigger preventing double application or ineligible application:
     ```sql
     -- Attempt to apply ineligible student (Blocked by trg_applications_validate_insert)
     INSERT INTO applications (student_id, job_id) VALUES (3, 1);
     -- Output: ERROR: Student 3 is not eligible for job 1
     ```
   - Show trigger preventing illegal status jumps (e.g. `APPLIED` straight to `SELECTED`):
     ```sql
     UPDATE applications SET status = 'SELECTED' WHERE student_id = 12 AND job_id = 1;
     -- Output: ERROR: Illegal status transition
     ```
   - Show Dream-Offer Tier Policy (`fn_policy_allows`):
     - A student placed at CORE (TechNova, 12 LPA) CAN apply to DREAM/SUPER_DREAM (DataWave, CloudNest).
     - But a student placed at DREAM CANNOT apply to CORE!

---

### Part 5: Transactions (TCL) and Access Control (DCL) (2 mins)
**Tool**: Query Tool in pgAdmin (`sql/demo/13_dcl.sql`, `14_tcl.sql`)
1. **TCL (Transaction Control Language)**:
   - Run `sql/demo/14_tcl.sql`:
     - Open transaction with `BEGIN`.
     - Set savepoint: `SAVEPOINT before_offer`.
     - Attempt illegal operation, catch exception, rollback to savepoint, commit clean state.
2. **DCL (Data Control Language)**:
   - Show role-based privileges: `GRANT SELECT ON students TO placetrack_viewer`.
   - Demonstrate column-level security: viewer cannot see student email/phone.

---

### Part 6: Live Web Application Demonstration (5 mins)
**Tool**: Web Browser (`http://localhost:5173`)
1. **Student Experience (Aarav Sharma)**:
   - Log in using verified credentials: `aarav.sharma@example.edu` / `Student@123`.
   - Open `/dashboard/profile`: show academic credentials displayed (Roll Number, CGPA, Backlogs, Department).
   - Navigate to `/dashboard/drives`: show live job postings fetched from FastAPI backend, with real-time eligibility tags.
   - View `/dashboard/applications`: show submitted applications enriched via multi-table SQL joins with company, role, package, and interview rounds.
   - View `/dashboard/placements`: show active placement details at TechNova (12.00 LPA).
2. **Admin Experience (Dean of Corporate Relations)**:
   - Sign in as Admin: `admin@placetrack.com` / `Admin@123`.
   - Open `/dashboard/profile`: verify **profile credential isolation** (displays Institutional Role, Office, and Unit; student CGPA and backlogs are strictly omitted).
   - Open `/dashboard/analytics`:
     - Show Materialized View placement KPI cards.
     - Show Department-wise placement rate chart.
     - Show Company CTC distribution and Top Placed Students table.
   - Open `/dashboard/notifications`: show clean notification view (graceful `[]` returned by backend without 403 error).

---

## 🎓 Viva Q&A — Questions Your Examiner / Professor May Ask

### Q1: Why did you put business logic into Database Triggers instead of only in Python?
> **Model Answer**:
> In an enterprise placement system, data integrity is paramount. If placement rules (like the one-placement rule or tier progression) existed only in the Python API, any direct SQL query in pgAdmin, bulk migration, or background worker could corrupt the database. By encoding rules in PostgreSQL triggers (`trg_applications_validate_insert`, `trg_applications_validate_update`), the database guarantees data consistency under all circumstances, fulfilling the ACID durability and consistency guarantees.

---

### Q2: What normal form is your database in? Justify with examples.
> **Model Answer**:
> The schema is in **Third Normal Form (3NF)**:
> 1. **1NF**: Every column contains atomic values, each row has a primary key, and there are no repeating groups.
> 2. **2NF**: It is in 1NF and all non-key attributes are fully functionally dependent on the entire primary key. In junction tables with composite keys like `student_skills (student_id, skill_id)`, `proficiency` depends on both attributes, not a subset.
> 3. **3NF**: There are no transitive dependencies ($X \to Y$ and $Y \to Z$). For example, student details (CGPA, name) are in `students`, while department details are in `departments` referenced by foreign key `department_id`. Placing `department_name` in `students` would violate 3NF.

---

### Q3: How do you handle concurrency when two students accept offers simultaneously?
> **Model Answer**:
> We rely on PostgreSQL's transactional isolation and table-level unique constraints. The `placements` table has a `UNIQUE (student_id)` constraint. When an offer is accepted via `sp_respond_to_offer`, an `INSERT INTO placements` is executed inside the transaction. If two transactions attempt to insert a placement for the same student, PostgreSQL's row-level lock and unique index detect the conflict and immediately abort the second transaction with a unique violation error (SQLSTATE `23505`), preventing duplicate placements.

---

### Q4: Why use a Materialized View for analytics instead of standard SQL Views?
> **Model Answer**:
> Standard views re-execute the underlying multi-table joins and aggregation queries every single time an endpoint or user requests them, which causes query latency as application rows grow. `mv_placement_kpis` precomputes the aggregations once and stores the physical result on disk. The dashboard loads in under 5ms. We refresh it periodically using `REFRESH MATERIALIZED VIEW` or via the stored procedure `sp_refresh_analytics()`.

---

### Q5: What database indexes did you create and why?
> **Model Answer**:
> Beyond primary keys and unique constraints (which automatically create B-trees), we indexed:
> 1. Foreign keys: `applications(student_id)`, `applications(job_id)`, `interviews(application_id)` to speed up `JOIN` and cascading checks.
> 2. Search & filter columns: `students(cgpa)`, `students(graduation_year)`, `jobs(status)`, `jobs(drive_date)`.
> 3. Covering indexes for frequent analytical queries. We verified the performance gains using `EXPLAIN ANALYZE` (demonstrated in `sql/demo/16_indexes_explain.sql`).

---

### Q6: What is the isolation level used by the application?
> **Model Answer**:
> The application uses PostgreSQL's default **READ COMMITTED** isolation level. This prevents dirty reads while ensuring high concurrency. For critical multi-step operations like offer acceptance or interview outcome recording, we encapsulate state transitions inside stored procedures (`CALL sp_respond_to_offer(...)`), ensuring all updates execute atomically.
