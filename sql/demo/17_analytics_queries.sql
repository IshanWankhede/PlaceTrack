-- =====================================================================
-- ANALYTICS | the exact queries the FastAPI /api/v1/analytics/* endpoints use
-- =====================================================================

-- 1) Overview
SELECT (SELECT COUNT(*) FROM students)   AS total_students,
       (SELECT COUNT(*) FROM placements) AS total_placed,
       fn_placement_rate()               AS placement_rate;

-- 2) Department-wise placement stats
SELECT * FROM v_department_stats ORDER BY placement_rate DESC NULLS LAST;

-- 3) Company-wise selection counts (ranked)
SELECT * FROM v_company_selections ORDER BY selections DESC, company;

-- 4) Package distribution
SELECT MIN(package) AS min_package, MAX(package) AS max_package, ROUND(AVG(package), 2) AS avg_package,
       PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY package) AS median_package
FROM placements;

-- 4b) Package buckets (for a bar chart)
SELECT CASE WHEN package < 6  THEN '< 6 LPA'
            WHEN package < 10 THEN '6 - 10 LPA'
            WHEN package < 14 THEN '10 - 14 LPA'
            ELSE '14+ LPA' END AS bucket,
       COUNT(*) AS students
FROM placements GROUP BY 1 ORDER BY MIN(package);

-- 5) Top package holder
SELECT * FROM placement_summary ORDER BY package DESC LIMIT 1;

-- 6) Students with CGPA above the overall average
SELECT id, roll_number, name, cgpa FROM students
WHERE cgpa > (SELECT AVG(cgpa) FROM students) ORDER BY cgpa DESC;

-- 7) Application funnel
SELECT status, COUNT(*) AS applications FROM applications
GROUP BY status
ORDER BY CASE status WHEN 'APPLIED' THEN 1 WHEN 'SHORTLISTED' THEN 2 WHEN 'INTERVIEW' THEN 3
                     WHEN 'SELECTED' THEN 4 WHEN 'REJECTED' THEN 5 ELSE 6 END;

-- 8) Placements per month
SELECT DATE_TRUNC('month', placement_date)::DATE AS month, COUNT(*) AS placements, SUM(package) AS total_lpa
FROM placements GROUP BY 1 ORDER BY 1;

-- 9) Unplaced students who are eligible for at least one open job (outreach list)
SELECT s.id, s.name, s.cgpa, COUNT(*) AS open_jobs_eligible
FROM students s
CROSS JOIN LATERAL fn_eligible_jobs(s.id) ej
WHERE NOT EXISTS (SELECT 1 FROM placements p WHERE p.student_id = s.id)
GROUP BY s.id, s.name, s.cgpa ORDER BY open_jobs_eligible DESC;

-- 10) Offer funnel (released -> accepted / declined / locked / superseded)
SELECT status, COUNT(*) AS offers, ROUND(AVG(package), 2) AS avg_ctc
FROM offers GROUP BY status ORDER BY offers DESC;

-- 11) Placement status of the whole roster (Placed / In interview / Unplaced)
SELECT placement_status, COUNT(*) AS students FROM v_student_status GROUP BY placement_status ORDER BY students DESC;

-- 12) Company tier mix of accepted placements
SELECT c.tier, COUNT(*) AS placements, ROUND(AVG(p.package), 2) AS avg_ctc
FROM placements p JOIN companies c ON c.id = p.company_id
GROUP BY c.tier ORDER BY fn_tier_rank(c.tier) DESC;

-- 13) NIRF-style summary: overall rate, mean / median / highest CTC, department-wise median
SELECT ROUND(AVG(package), 2) AS mean_ctc,
       PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY package) AS median_ctc,
       MAX(package) AS highest_ctc,
       fn_placement_rate() AS placement_rate_pct
FROM placements;
SELECT d.name AS department,
       COUNT(*) AS placed,
       PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.package) AS median_ctc
FROM placements p JOIN students s ON s.id = p.student_id JOIN departments d ON d.id = s.department_id
GROUP BY d.name ORDER BY d.name;
