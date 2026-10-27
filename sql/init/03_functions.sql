-- =====================================================================
-- PlaceTrack | 03_functions.sql | User-defined functions (PL/pgSQL + SQL)
-- Definition order matters: SQL-language functions are validated at creation time.
-- =====================================================================

-- Rank a proficiency label so levels can be compared numerically.
CREATE OR REPLACE FUNCTION fn_skill_rank(p_level VARCHAR)
RETURNS INTEGER
LANGUAGE sql IMMUTABLE STRICT AS $$
    SELECT CASE p_level
             WHEN 'BEGINNER'     THEN 1
             WHEN 'INTERMEDIATE' THEN 2
             WHEN 'ADVANCED'     THEN 3
             WHEN 'EXPERT'       THEN 4
           END;
$$;

-- Rank a company tier (single-offer / dream-offer policy).
CREATE OR REPLACE FUNCTION fn_tier_rank(p_tier VARCHAR)
RETURNS INTEGER
LANGUAGE sql IMMUTABLE STRICT AS $$
    SELECT CASE p_tier
             WHEN 'CORE'        THEN 1
             WHEN 'DREAM'       THEN 2
             WHEN 'SUPER_DREAM' THEN 3
           END;
$$;

-- Placement policy: a placed student may only pursue a company of a HIGHER tier than
-- the company they are currently placed at. Students with no placement are always allowed.
CREATE OR REPLACE FUNCTION fn_policy_allows(p_student_id INT, p_job_id INT)
RETURNS BOOLEAN
LANGUAGE sql STABLE AS $$
    SELECT NOT EXISTS (
        SELECT 1
        FROM placements p
        JOIN companies pc ON pc.id = p.company_id
        JOIN jobs j       ON j.id  = p_job_id
        JOIN companies jc ON jc.id = j.company_id
        WHERE p.student_id = p_student_id
          AND fn_tier_rank(pc.tier) >= fn_tier_rank(jc.tier)
    );
$$;

-- Rule-by-rule eligibility report (powers the "criteria gap" screen).
-- category ACADEMIC = CGPA, backlogs, department, skills. category POLICY = tier policy.
CREATE OR REPLACE FUNCTION fn_eligibility_check(p_student_id INT, p_job_id INT)
RETURNS TABLE (category TEXT, rule TEXT, required TEXT, actual TEXT, passed BOOLEAN)
LANGUAGE sql STABLE AS $$
    SELECT 'ACADEMIC'::TEXT, 'CGPA'::TEXT, j.minimum_cgpa::TEXT, s.cgpa::TEXT, (s.cgpa >= j.minimum_cgpa)
    FROM students s, jobs j
    WHERE s.id = p_student_id AND j.id = p_job_id

    UNION ALL
    SELECT 'ACADEMIC', 'Active backlogs', 'max ' || j.max_backlogs, s.active_backlogs::TEXT,
           (s.active_backlogs <= j.max_backlogs)
    FROM students s, jobs j
    WHERE s.id = p_student_id AND j.id = p_job_id

    UNION ALL
    SELECT 'ACADEMIC', 'Department',
           COALESCE((SELECT STRING_AGG(d2.code, ', ' ORDER BY d2.code)
                     FROM job_departments jd JOIN departments d2 ON d2.id = jd.department_id
                     WHERE jd.job_id = j.id), 'All departments'),
           d.code,
           (NOT EXISTS (SELECT 1 FROM job_departments x WHERE x.job_id = j.id)
            OR EXISTS (SELECT 1 FROM job_departments x
                       WHERE x.job_id = j.id AND x.department_id = s.department_id))
    FROM students s
    JOIN departments d ON d.id = s.department_id
    CROSS JOIN jobs j
    WHERE s.id = p_student_id AND j.id = p_job_id

    UNION ALL
    SELECT 'ACADEMIC', 'Skill: ' || k.name, js.required_level, COALESCE(ss.proficiency, 'NONE'),
           COALESCE(fn_skill_rank(ss.proficiency) >= fn_skill_rank(js.required_level), FALSE)
    FROM job_skills js
    JOIN skills k ON k.id = js.skill_id
    LEFT JOIN student_skills ss ON ss.skill_id = js.skill_id AND ss.student_id = p_student_id
    WHERE js.job_id = p_job_id
      AND EXISTS (SELECT 1 FROM students WHERE id = p_student_id)

    UNION ALL
    SELECT 'POLICY', 'Placement policy',
           CASE WHEN cur.tier IS NULL THEN 'No current placement' ELSE 'Tier above ' || cur.tier END,
           jc.tier,
           fn_policy_allows(p_student_id, p_job_id)
    FROM jobs j
    JOIN companies jc ON jc.id = j.company_id
    LEFT JOIN LATERAL (
        SELECT pc.tier FROM placements p JOIN companies pc ON pc.id = p.company_id
        WHERE p.student_id = p_student_id
    ) cur ON TRUE
    WHERE j.id = p_job_id
      AND EXISTS (SELECT 1 FROM students WHERE id = p_student_id);
$$;

-- Core eligibility = every ACADEMIC rule passes. (Tier policy is checked separately.)
CREATE OR REPLACE FUNCTION fn_is_eligible(p_student_id INT, p_job_id INT)
RETURNS BOOLEAN
LANGUAGE sql STABLE AS $$
    SELECT COALESCE(BOOL_AND(passed), FALSE)
    FROM fn_eligibility_check(p_student_id, p_job_id)
    WHERE category = 'ACADEMIC';
$$;

-- Match score 0-100: 60% skill coverage (level vs required) + 40% CGPA margin over the minimum.
CREATE OR REPLACE FUNCTION fn_match_score(p_student_id INT, p_job_id INT)
RETURNS NUMERIC
LANGUAGE sql STABLE AS $$
    SELECT ROUND(100 * (
        0.6 * COALESCE((
            SELECT AVG(LEAST(1.0, COALESCE(fn_skill_rank(ss.proficiency), 0)::NUMERIC
                                  / fn_skill_rank(js.required_level)))
            FROM job_skills js
            LEFT JOIN student_skills ss ON ss.skill_id = js.skill_id AND ss.student_id = p_student_id
            WHERE js.job_id = p_job_id), 1)
      + 0.4 * LEAST(1.0, GREATEST(0, s.cgpa - j.minimum_cgpa) / 2.0)
    ), 0)
    FROM students s, jobs j
    WHERE s.id = p_student_id AND j.id = p_job_id;
$$;

-- Eligible students for a job (FR-7.1). policy_ok = false means the student is academically
-- eligible but already holds an offer of the same or higher tier.
CREATE OR REPLACE FUNCTION fn_eligible_students(p_job_id INT)
RETURNS TABLE (student_id INT, roll_number VARCHAR, student_name VARCHAR, cgpa NUMERIC,
               department VARCHAR, policy_ok BOOLEAN)
LANGUAGE sql STABLE AS $$
    SELECT s.id, s.roll_number, s.name, s.cgpa, d.name, fn_policy_allows(s.id, p_job_id)
    FROM students s
    JOIN departments d ON d.id = s.department_id
    WHERE fn_is_eligible(s.id, p_job_id)
    ORDER BY s.cgpa DESC, s.name;
$$;

-- Open, eligible, policy-allowed jobs for a student, best match first (FR-7.2)
CREATE OR REPLACE FUNCTION fn_eligible_jobs(p_student_id INT)
RETURNS TABLE (job_id INT, title VARCHAR, company VARCHAR, tier VARCHAR, package NUMERIC,
               package_max NUMERIC, application_deadline DATE, match_score NUMERIC)
LANGUAGE sql STABLE AS $$
    SELECT j.id, j.title, c.name, c.tier, j.package, j.package_max, j.application_deadline,
           fn_match_score(p_student_id, j.id)
    FROM jobs j
    JOIN companies c ON c.id = j.company_id
    WHERE j.status = 'OPEN'
      AND (j.application_deadline IS NULL OR j.application_deadline >= CURRENT_DATE)
      AND fn_is_eligible(p_student_id, j.id)
      AND fn_policy_allows(p_student_id, j.id)
    ORDER BY fn_match_score(p_student_id, j.id) DESC, j.package DESC NULLS LAST;
$$;

-- Helpers: look up ids from natural keys
CREATE OR REPLACE FUNCTION fn_get_application_id(p_student_id INT, p_job_id INT)
RETURNS INTEGER
LANGUAGE sql STABLE AS $$
    SELECT id FROM applications WHERE student_id = p_student_id AND job_id = p_job_id;
$$;

CREATE OR REPLACE FUNCTION fn_get_offer_id(p_student_id INT, p_job_id INT)
RETURNS INTEGER
LANGUAGE sql STABLE AS $$
    SELECT o.id FROM offers o
    JOIN applications a ON a.id = o.application_id
    WHERE a.student_id = p_student_id AND a.job_id = p_job_id;
$$;

-- Overall placement rate (%)
CREATE OR REPLACE FUNCTION fn_placement_rate()
RETURNS NUMERIC
LANGUAGE sql STABLE AS $$
    SELECT ROUND(100.0 * (SELECT COUNT(*) FROM placements)
                 / NULLIF((SELECT COUNT(*) FROM students), 0), 2);
$$;

-- Placement rate for one department (%)
CREATE OR REPLACE FUNCTION fn_department_placement_rate(p_department_id INT)
RETURNS NUMERIC
LANGUAGE sql STABLE AS $$
    SELECT ROUND(100.0 * COUNT(p.id) / NULLIF(COUNT(s.id), 0), 2)
    FROM students s
    LEFT JOIN placements p ON p.student_id = s.id
    WHERE s.department_id = p_department_id;
$$;

-- Signup: find the roster student for (roll number, college email) that has no account yet.
CREATE OR REPLACE FUNCTION fn_find_student_for_signup(p_roll VARCHAR, p_email VARCHAR)
RETURNS INTEGER
LANGUAGE sql STABLE AS $$
    SELECT s.id
    FROM students s
    WHERE s.roll_number = UPPER(TRIM(p_roll))
      AND s.email = LOWER(TRIM(p_email))
      AND NOT EXISTS (SELECT 1 FROM users u WHERE u.student_id = s.id);
$$;

-- OTP: generate a 6-digit code, store only its bcrypt hash, return the plain code to the caller
-- (the backend e-mails it). random() is fine for a demo; use a CSPRNG in production.
CREATE OR REPLACE FUNCTION fn_generate_otp(p_email VARCHAR, p_purpose VARCHAR)
RETURNS TEXT
LANGUAGE plpgsql AS $$
DECLARE
    v_otp TEXT;
BEGIN
    v_otp := LPAD(FLOOR(random() * 1000000)::INT::TEXT, 6, '0');
    UPDATE email_otps SET consumed = TRUE
     WHERE email = LOWER(p_email) AND purpose = p_purpose AND NOT consumed;
    INSERT INTO email_otps (email, purpose, otp_hash, expires_at)
    VALUES (LOWER(p_email), p_purpose, crypt(v_otp, gen_salt('bf', 6)), NOW() + INTERVAL '10 minutes');
    RETURN v_otp;
END;
$$;

-- OTP: verify the latest unconsumed code (10 min expiry, max 5 attempts, single use).
CREATE OR REPLACE FUNCTION fn_verify_otp(p_email VARCHAR, p_purpose VARCHAR, p_otp VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql AS $$
DECLARE
    v email_otps%ROWTYPE;
BEGIN
    SELECT * INTO v FROM email_otps
     WHERE email = LOWER(p_email) AND purpose = p_purpose AND NOT consumed
     ORDER BY id DESC LIMIT 1
     FOR UPDATE;
    IF NOT FOUND THEN RETURN FALSE; END IF;
    IF v.expires_at < NOW() OR v.attempts >= 5 THEN RETURN FALSE; END IF;

    UPDATE email_otps SET attempts = attempts + 1 WHERE id = v.id;
    IF v.otp_hash = crypt(p_otp, v.otp_hash) THEN
        UPDATE email_otps SET consumed = TRUE WHERE id = v.id;
        RETURN TRUE;
    END IF;
    RETURN FALSE;
END;
$$;
