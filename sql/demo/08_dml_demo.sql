-- =====================================================================
-- DML DEMO | INSERT / UPDATE / DELETE / UPSERT / RETURNING
-- Creates 'Demo Corp' data and removes it again at the end. Safe to re-run.
-- =====================================================================

-- INSERT single row + RETURNING
INSERT INTO companies (name, industry, location)
VALUES ('Demo Corp', 'Testing', 'Pune')
RETURNING id, name;

-- INSERT multiple rows, ignoring duplicates
INSERT INTO skills (name) VALUES ('Rust'), ('Go'), ('Python')
ON CONFLICT (name) DO NOTHING;

-- UPSERT: insert, or update when the key already exists
INSERT INTO companies (name, industry)
VALUES ('Demo Corp', 'Quality Assurance')
ON CONFLICT (name) DO UPDATE SET industry = EXCLUDED.industry
RETURNING *;

-- INSERT ... SELECT
INSERT INTO jobs (company_id, title, minimum_cgpa, package, job_type, status)
SELECT id, 'QA Engineer', 7.00, 6.00, 'FULL_TIME', 'OPEN'
FROM companies WHERE name = 'Demo Corp'
RETURNING id, title, package;

-- UPDATE with expression
UPDATE jobs SET package = package * 1.10
WHERE title = 'QA Engineer'
RETURNING title, package;

-- UPDATE with join (UPDATE ... FROM)
UPDATE jobs j
SET location = c.location
FROM companies c
WHERE c.id = j.company_id AND c.name = 'Demo Corp'
RETURNING j.title, j.location;

-- Trigger in action: mixed-case email is normalized to lowercase (trg_students_lowercase_email)
INSERT INTO students (roll_number, name, email, cgpa, graduation_year, department_id)
VALUES ('DEMO001', 'Demo Student', '  Demo.Student@EXAMPLE.edu ', 7.50, 2027, 1)
RETURNING id, email;

-- ON DELETE CASCADE: deleting the student removes their skills automatically
INSERT INTO student_skills (student_id, skill_id)
SELECT s.id, k.id FROM students s, skills k WHERE s.roll_number = 'DEMO001' AND k.name = 'Rust';

SELECT * FROM student_skills WHERE student_id = (SELECT id FROM students WHERE roll_number = 'DEMO001');

DELETE FROM students WHERE roll_number = 'DEMO001';

SELECT COUNT(*) AS skills_left_for_deleted_student
FROM student_skills ss
WHERE NOT EXISTS (SELECT 1 FROM students s WHERE s.id = ss.student_id);   -- 0 (cascade worked)

-- DELETE with subquery / USING, RETURNING
DELETE FROM jobs
WHERE company_id IN (SELECT id FROM companies WHERE name = 'Demo Corp')
RETURNING id, title;

DELETE FROM companies WHERE name = 'Demo Corp' RETURNING id, name;

DELETE FROM skills WHERE name IN ('Rust', 'Go') RETURNING name;

-- Foreign key protection: this fails because placements reference the student (run alone to see the error)
-- DELETE FROM students WHERE id = 1;
