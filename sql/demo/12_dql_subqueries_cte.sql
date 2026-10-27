-- =====================================================================
-- DQL SUBQUERIES | scalar, IN, EXISTS, correlated, ANY/ALL, derived, CTE, recursive, set ops
-- =====================================================================

-- Scalar subquery: students above the overall average CGPA
SELECT name, cgpa FROM students
WHERE cgpa > (SELECT AVG(cgpa) FROM students)
ORDER BY cgpa DESC;

-- IN / NOT IN
SELECT name FROM students WHERE id IN (SELECT student_id FROM placements);
SELECT name FROM students WHERE id NOT IN (SELECT student_id FROM applications);

-- EXISTS / NOT EXISTS: students who applied but are not placed
SELECT s.name FROM students s
WHERE EXISTS     (SELECT 1 FROM applications a WHERE a.student_id = s.id)
  AND NOT EXISTS (SELECT 1 FROM placements   p WHERE p.student_id = s.id);

-- Correlated subquery: each student's best (highest-package) job they were selected for
SELECT s.name,
       (SELECT MAX(p.package) FROM placements p WHERE p.student_id = s.id) AS package
FROM students s ORDER BY package DESC NULLS LAST;

-- Correlated: students whose CGPA is above their own department average
SELECT s.name, s.cgpa, s.department_id
FROM students s
WHERE s.cgpa > (SELECT AVG(x.cgpa) FROM students x WHERE x.department_id = s.department_id);

-- ANY / ALL
SELECT title, package FROM jobs WHERE package > ALL (SELECT package FROM jobs WHERE job_type = 'PPO');
SELECT name, cgpa FROM students WHERE cgpa >= ANY (SELECT minimum_cgpa FROM jobs WHERE company_id = 2);

-- Derived table (subquery in FROM)
SELECT dept, ROUND(AVG(cgpa), 2) AS avg_cgpa
FROM (SELECT d.name AS dept, s.cgpa FROM students s JOIN departments d ON d.id = s.department_id) t
GROUP BY dept;

-- Second highest package
SELECT MAX(package) AS second_highest FROM placements
WHERE package < (SELECT MAX(package) FROM placements);

-- CTE (WITH): placement funnel per company
WITH apps AS (
    SELECT j.company_id, COUNT(*) AS applications
    FROM applications a JOIN jobs j ON j.id = a.job_id GROUP BY j.company_id
), sel AS (
    SELECT company_id, COUNT(*) AS selections FROM placements GROUP BY company_id
)
SELECT c.name, COALESCE(apps.applications, 0) AS applications, COALESCE(sel.selections, 0) AS selections,
       ROUND(100.0 * COALESCE(sel.selections, 0) / NULLIF(apps.applications, 0), 1) AS conversion_pct
FROM companies c LEFT JOIN apps ON apps.company_id = c.id LEFT JOIN sel ON sel.company_id = c.id
ORDER BY conversion_pct DESC NULLS LAST;

-- Recursive CTE: number series 1..5 with factorial
WITH RECURSIVE nums(n, factorial) AS (
    SELECT 1, 1
    UNION ALL
    SELECT n + 1, factorial * (n + 1) FROM nums WHERE n < 5
)
SELECT * FROM nums;

-- Set operations
SELECT name FROM students WHERE id IN (SELECT student_id FROM placements)
UNION
SELECT name FROM students WHERE cgpa >= 9;

SELECT student_id FROM applications
INTERSECT
SELECT student_id FROM placements;

SELECT id FROM students
EXCEPT
SELECT student_id FROM applications;
