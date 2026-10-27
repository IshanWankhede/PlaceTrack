-- =====================================================================
-- DQL AGGREGATES | COUNT/SUM/AVG/MIN/MAX, GROUP BY, HAVING, ROLLUP, FILTER, WINDOW
-- =====================================================================

-- Aggregate functions
SELECT COUNT(*)            AS total_students,
       ROUND(AVG(cgpa), 2) AS avg_cgpa,
       MIN(cgpa)           AS min_cgpa,
       MAX(cgpa)           AS max_cgpa,
       SUM(cgpa)           AS sum_cgpa
FROM students;

SELECT COUNT(*) AS placed, SUM(package) AS total_lpa, ROUND(AVG(package),2) AS avg_lpa,
       MAX(package) AS highest, MIN(package) AS lowest,
       PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY package) AS median_lpa
FROM placements;

-- GROUP BY
SELECT d.name AS department, COUNT(*) AS students, ROUND(AVG(s.cgpa),2) AS avg_cgpa
FROM students s JOIN departments d ON d.id = s.department_id
GROUP BY d.name ORDER BY students DESC;

-- GROUP BY + HAVING: departments with placement rate >= 50%
SELECT d.name,
       COUNT(DISTINCT p.student_id) AS placed,
       COUNT(DISTINCT s.id)         AS total,
       ROUND(100.0 * COUNT(DISTINCT p.student_id) / COUNT(DISTINCT s.id), 2) AS rate
FROM students s
JOIN departments d ON d.id = s.department_id
LEFT JOIN placements p ON p.student_id = s.id
GROUP BY d.name
HAVING 100.0 * COUNT(DISTINCT p.student_id) / COUNT(DISTINCT s.id) >= 50;

-- Companies with more than one application
SELECT c.name, COUNT(a.id) AS applications
FROM companies c
JOIN jobs j ON j.company_id = c.id
JOIN applications a ON a.job_id = j.id
GROUP BY c.name HAVING COUNT(a.id) > 2 ORDER BY applications DESC;

-- FILTER clause: conditional counts in one pass (status funnel per job)
SELECT j.title,
       COUNT(*)                                          AS total_apps,
       COUNT(*) FILTER (WHERE a.status = 'SHORTLISTED')  AS shortlisted,
       COUNT(*) FILTER (WHERE a.status = 'INTERVIEW')    AS in_interview,
       COUNT(*) FILTER (WHERE a.status = 'SELECTED')     AS selected,
       COUNT(*) FILTER (WHERE a.status IN ('REJECTED','WITHDRAWN')) AS dropped
FROM applications a JOIN jobs j ON j.id = a.job_id
GROUP BY j.title ORDER BY total_apps DESC;

-- STRING_AGG / ARRAY_AGG
SELECT d.name, STRING_AGG(s.name, ', ' ORDER BY s.name) AS students
FROM departments d JOIN students s ON s.department_id = d.id GROUP BY d.name;
SELECT k.name, ARRAY_AGG(s.name ORDER BY s.name) AS students_with_skill
FROM skills k JOIN student_skills ss ON ss.skill_id = k.id JOIN students s ON s.id = ss.student_id
GROUP BY k.name ORDER BY COUNT(*) DESC;

-- ROLLUP: subtotals and grand total
SELECT COALESCE(d.name, 'ALL DEPARTMENTS') AS department,
       COALESCE(c.name, 'ALL COMPANIES')   AS company,
       COUNT(*) AS placements, SUM(p.package) AS total_lpa
FROM placements p
JOIN students s ON s.id = p.student_id JOIN departments d ON d.id = s.department_id
JOIN companies c ON c.id = p.company_id
GROUP BY ROLLUP (d.name, c.name) ORDER BY d.name, c.name;

-- Window functions: ranking
SELECT student_name, department, company, package,
       RANK()       OVER (ORDER BY package DESC)                          AS overall_rank,
       DENSE_RANK() OVER (ORDER BY package DESC)                          AS dense_pos,
       ROW_NUMBER() OVER (PARTITION BY department ORDER BY package DESC)  AS rank_in_dept
FROM placement_summary;

-- Window: running total and difference from average
SELECT student_name, package, placement_date,
       SUM(package) OVER (ORDER BY placement_date, student_name) AS running_total,
       ROUND(package - AVG(package) OVER (), 2)                  AS diff_from_avg
FROM placement_summary;

-- Window: students ranked by CGPA inside department, quartiles, previous value
SELECT name, department_id, cgpa,
       RANK()  OVER (PARTITION BY department_id ORDER BY cgpa DESC) AS dept_rank,
       NTILE(4) OVER (ORDER BY cgpa DESC)                           AS quartile,
       LAG(cgpa) OVER (ORDER BY cgpa DESC)                          AS next_higher_cgpa
FROM students;
