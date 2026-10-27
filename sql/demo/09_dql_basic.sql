-- =====================================================================
-- DQL BASICS | SELECT, WHERE, operators, ORDER BY, LIMIT, functions, CASE
-- =====================================================================

SELECT * FROM students;
SELECT roll_number AS roll, name, cgpa FROM students ORDER BY cgpa DESC;

-- Filtering
SELECT name, cgpa FROM students WHERE cgpa >= 8.0 AND department_id IN (1, 2);
SELECT name, cgpa FROM students WHERE cgpa BETWEEN 7.5 AND 8.5;
SELECT name FROM students WHERE name LIKE 'A%';
SELECT name FROM students WHERE name ILIKE '%an%';
SELECT title FROM jobs WHERE application_deadline IS NOT NULL AND NOT (status = 'CLOSED');
SELECT DISTINCT job_type FROM jobs;
SELECT DISTINCT department_id FROM students ORDER BY department_id;

-- Sorting and paging: top 3 CGPAs, then the next 3
SELECT name, cgpa FROM students ORDER BY cgpa DESC LIMIT 3;
SELECT name, cgpa FROM students ORDER BY cgpa DESC LIMIT 3 OFFSET 3;

-- CASE and COALESCE
SELECT name, cgpa,
       CASE WHEN cgpa >= 9 THEN 'Distinction'
            WHEN cgpa >= 8 THEN 'First Class'
            WHEN cgpa >= 7 THEN 'Second Class'
            ELSE 'Pass' END AS grade_band
FROM students ORDER BY cgpa DESC;

SELECT name, COALESCE(phone, 'N/A') AS phone FROM students LIMIT 5;
SELECT title, COALESCE(package, 0) AS package_lpa FROM jobs;

-- String functions
SELECT UPPER(name) AS upper_name, LENGTH(name) AS name_len,
       SUBSTRING(roll_number FROM 1 FOR 2) AS dept_prefix,
       name || ' <' || email || '>' AS contact
FROM students LIMIT 5;
SELECT SPLIT_PART(email, '@', 2) AS email_domain, COUNT(*) FROM students GROUP BY 1;

-- Date functions
SELECT title, application_deadline,
       application_deadline - CURRENT_DATE AS days_left,
       TO_CHAR(application_deadline, 'DD Mon YYYY') AS pretty_date
FROM jobs ORDER BY application_deadline;
SELECT DATE_TRUNC('month', applied_at) AS month, COUNT(*) FROM applications GROUP BY 1;
SELECT EXTRACT(YEAR FROM created_at) AS yr, COUNT(*) FROM students GROUP BY 1;

-- Math and casting
SELECT name, cgpa, ROUND(cgpa * 9.5, 1) AS approx_percentage, cgpa::TEXT AS cgpa_text FROM students LIMIT 5;

-- Enum-style checks from CHECK constraints
SELECT status, COUNT(*) FROM applications GROUP BY status ORDER BY COUNT(*) DESC;
