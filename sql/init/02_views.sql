-- =====================================================================
-- PlaceTrack | 02_views.sql | Views + materialized view
-- =====================================================================

CREATE OR REPLACE VIEW placement_summary AS
SELECT
    s.id             AS student_id,
    s.roll_number,
    s.name           AS student_name,
    d.name           AS department,
    c.name           AS company,
    j.title          AS job_role,
    p.package,
    p.placement_date
FROM placements p
JOIN students    s ON s.id = p.student_id
JOIN departments d ON d.id = s.department_id
JOIN companies   c ON c.id = p.company_id
JOIN jobs        j ON j.id = p.job_id;

CREATE OR REPLACE VIEW v_application_overview AS
SELECT
    a.id            AS application_id,
    s.name          AS student_name,
    s.roll_number,
    c.name          AS company,
    j.title         AS job_title,
    a.status,
    a.applied_at,
    (SELECT COUNT(*) FROM interviews i WHERE i.application_id = a.id) AS interview_rounds,
    a.student_id,
    a.job_id,
    c.id            AS company_id
FROM applications a
JOIN students  s ON s.id = a.student_id
JOIN jobs      j ON j.id = a.job_id
JOIN companies c ON c.id = j.company_id;

CREATE OR REPLACE VIEW v_department_stats AS
SELECT
    d.id                                   AS department_id,
    d.name                                 AS department,
    COUNT(DISTINCT s.id)                   AS total_students,
    COUNT(DISTINCT p.student_id)           AS placed_students,
    ROUND(100.0 * COUNT(DISTINCT p.student_id) / NULLIF(COUNT(DISTINCT s.id), 0), 2) AS placement_rate,
    ROUND(AVG(p.package), 2)               AS avg_package,
    MAX(p.package)                         AS max_package
FROM departments d
LEFT JOIN students   s ON s.department_id = d.id
LEFT JOIN placements p ON p.student_id    = s.id
GROUP BY d.id, d.name;

CREATE OR REPLACE VIEW v_company_selections AS
SELECT
    c.id                 AS company_id,
    c.name               AS company,
    COUNT(p.id)          AS selections,
    ROUND(AVG(p.package), 2) AS avg_package
FROM companies c
LEFT JOIN placements p ON p.company_id = c.id
GROUP BY c.id, c.name;

-- Materialized view: pre-computed KPIs (refresh with CALL sp_refresh_analytics();)
CREATE MATERIALIZED VIEW mv_placement_kpis AS
SELECT
    (SELECT COUNT(*) FROM students)                                  AS total_students,
    (SELECT COUNT(*) FROM placements)                                AS total_placed,
    ROUND(100.0 * (SELECT COUNT(*) FROM placements)
          / NULLIF((SELECT COUNT(*) FROM students), 0), 2)           AS placement_rate,
    (SELECT ROUND(AVG(package), 2) FROM placements)                  AS avg_package,
    (SELECT MAX(package) FROM placements)                            AS highest_package;

-- Student roster with computed placement status (Placed / In interview / Unplaced)
CREATE OR REPLACE VIEW v_student_status AS
SELECT
    s.id              AS student_id,
    s.roll_number,
    s.name            AS student_name,
    d.code            AS department,
    s.cgpa,
    s.active_backlogs,
    s.cgpa_verified,
    CASE
        WHEN p.id IS NOT NULL THEN 'PLACED'
        WHEN EXISTS (SELECT 1 FROM applications a
                     WHERE a.student_id = s.id AND a.status = 'INTERVIEW') THEN 'IN_INTERVIEW'
        ELSE 'UNPLACED'
    END               AS placement_status
FROM students s
JOIN departments d ON d.id = s.department_id
LEFT JOIN placements p ON p.student_id = s.id;

-- Offers with company tier and CTC breakdown
CREATE OR REPLACE VIEW v_offer_overview AS
SELECT
    o.id            AS offer_id,
    s.id            AS student_id,
    s.name          AS student_name,
    c.name          AS company,
    c.tier,
    j.title         AS job_title,
    o.base_lpa, o.bonus_lpa, o.esop_lpa, o.package,
    o.status,
    o.released_at,
    o.responded_at,
    o.job_id,
    o.company_id,
    o.application_id
FROM offers o
JOIN students  s ON s.id = o.student_id
JOIN jobs      j ON j.id = o.job_id
JOIN companies c ON c.id = o.company_id;
