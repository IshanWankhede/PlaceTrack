-- =====================================================================
-- DQL JOINS | INNER, LEFT, RIGHT, FULL, CROSS, SELF, multi-table, anti-join
-- =====================================================================

-- INNER JOIN: students with their department
SELECT s.name, s.cgpa, d.name AS department
FROM students s
INNER JOIN departments d ON d.id = s.department_id
ORDER BY d.name, s.name;

-- Many-to-many via junction table (3 tables)
SELECT s.name, ss.proficiency
FROM students s JOIN student_skills ss ON ss.student_id = s.id
JOIN skills k ON k.id = ss.skill_id
WHERE k.name = 'Python';

-- LEFT JOIN: ALL students, placement if any (NULL = not placed)
SELECT s.name, p.package, c.name AS company
FROM students s
LEFT JOIN placements p ON p.student_id = s.id
LEFT JOIN companies  c ON c.id = p.company_id
ORDER BY p.package DESC NULLS LAST;

-- RIGHT JOIN: ALL companies, even ones with no placement yet
SELECT c.name AS company, COUNT(p.id) AS selections
FROM placements p
RIGHT JOIN companies c ON c.id = p.company_id
GROUP BY c.name ORDER BY selections DESC;

-- FULL OUTER JOIN: students vs applications (everyone, whether applied or not)
SELECT s.name, a.id AS application_id, a.status
FROM students s
FULL OUTER JOIN applications a ON a.student_id = s.id
ORDER BY s.name;

-- Anti-join: students who never applied anywhere
SELECT s.name
FROM students s
LEFT JOIN applications a ON a.student_id = s.id
WHERE a.id IS NULL;

-- Multi-table (5-way) join: complete application pipeline
SELECT s.name AS student, d.code AS dept, c.name AS company, j.title, a.status,
       COUNT(i.id) AS rounds
FROM applications a
JOIN students    s ON s.id = a.student_id
JOIN departments d ON d.id = s.department_id
JOIN jobs        j ON j.id = a.job_id
JOIN companies   c ON c.id = j.company_id
LEFT JOIN interviews i ON i.application_id = a.id
GROUP BY s.name, d.code, c.name, j.title, a.status
ORDER BY c.name, s.name;

-- SELF JOIN: pairs of students from the same department with similar CGPA
SELECT a.name AS student_a, b.name AS student_b, a.cgpa, b.cgpa
FROM students a
JOIN students b ON a.department_id = b.department_id AND a.id < b.id
WHERE ABS(a.cgpa - b.cgpa) <= 0.3;

-- CROSS JOIN: every department x job type combination
SELECT d.code, t.job_type
FROM departments d
CROSS JOIN (SELECT DISTINCT job_type FROM jobs) t
ORDER BY d.code, t.job_type;

-- Many-to-many through junction: jobs and the skills they need
SELECT c.name AS company, j.title, STRING_AGG(k.name || ' (' || js.required_level || ')', ', ') AS required_skills
FROM jobs j
JOIN companies c   ON c.id = j.company_id
JOIN job_skills js ON js.job_id = j.id
JOIN skills k      ON k.id = js.skill_id
GROUP BY c.name, j.title ORDER BY c.name;
