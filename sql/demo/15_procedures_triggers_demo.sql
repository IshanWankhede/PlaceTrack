-- =====================================================================
-- FUNCTIONS, PROCEDURES & TRIGGERS DEMO
-- Messages (NOTICE) appear in pgAdmin's "Messages" tab. Mutating demos run inside
-- BEGIN ... ROLLBACK so your data stays unchanged.
-- =====================================================================

-- ----------------------------------------------------------------- FUNCTIONS
SELECT fn_skill_rank('ADVANCED') AS advanced_rank, fn_tier_rank('SUPER_DREAM') AS super_dream_rank;
SELECT fn_is_eligible(1, 1) AS aarav_eligible_for_job1,      -- true
       fn_is_eligible(3, 1) AS rohan_eligible_for_job1,      -- false (CGPA 7.9 < 8.0, 1 backlog)
       fn_is_eligible(4, 1) AS sneha_eligible_for_job1,      -- false (missing Git)
       fn_is_eligible(1, 2) AS aarav_eligible_for_job2;      -- false (SQL level INTERMEDIATE < ADVANCED)

-- "Criteria gap" report: why is Rohan not eligible for job 1? (one row per rule)
SELECT category, rule, required, actual, passed FROM fn_eligibility_check(3, 1);
-- And Aarav on job 2 (skill level gap):
SELECT category, rule, required, actual, passed FROM fn_eligibility_check(1, 2);

SELECT * FROM fn_eligible_students(1);          -- Software Engineer @ TechNova (policy_ok = false for already placed students)
SELECT * FROM fn_eligible_students(2);          -- Data Analyst @ DataWave
SELECT * FROM fn_eligible_jobs(12);             -- open jobs Priya can apply to, best match first
SELECT * FROM fn_eligible_jobs(2);              -- Diya is placed at a DREAM company: only SUPER_DREAM jobs are offered
SELECT fn_match_score(12, 1) AS match_job1, fn_match_score(12, 6) AS match_job6;
SELECT fn_placement_rate() AS overall_rate, fn_department_placement_rate(1) AS ce_rate;

-- Eligibility matrix: every student x every open job
SELECT s.name, j.id AS job_id, j.title,
       fn_is_eligible(s.id, j.id)    AS eligible,
       fn_policy_allows(s.id, j.id)  AS tier_policy_ok
FROM students s CROSS JOIN jobs j
WHERE j.status = 'OPEN'
ORDER BY j.id, s.name;

-- ----------------------------------------------------------------- FULL LIFECYCLE (rolled back)
BEGIN;
CALL sp_apply_to_job(12, 6);                                                   -- Priya applies (eligible)
SELECT * FROM v_application_overview WHERE student_name = 'Priya Bansal';
CALL sp_update_application_status(fn_get_application_id(12, 6), 'SHORTLISTED');
CALL sp_schedule_interview(fn_get_application_id(12, 6), 'TECHNICAL', LOCALTIMESTAMP + INTERVAL '2 days',
                           'https://meet.example.com/demo', NULL, 'Ms. Kapoor', TIME '10:30');
SELECT application_id, round_number, round_type, meeting_link, reporting_time, result FROM interviews
WHERE application_id = fn_get_application_id(12, 6);
CALL sp_record_interview_result(fn_get_application_id(12, 6), 1, 'CLEARED', 'Good');
CALL sp_update_application_status(fn_get_application_id(12, 6), 'SELECTED');   -- trigger creates a PENDING offer
SELECT * FROM v_offer_overview WHERE student_name = 'Priya Bansal';
CALL sp_set_offer_breakdown(fn_get_offer_id(12, 6), 3.50, 0.80, 0.50);         -- CTC = 4.80
CALL sp_respond_to_offer(fn_get_offer_id(12, 6), TRUE);                        -- student accepts -> placement row
SELECT * FROM placement_summary WHERE student_name = 'Priya Bansal';
SELECT title, message FROM notifications WHERE student_id = 12 ORDER BY id;    -- written by triggers
SELECT * FROM application_status_history
WHERE application_id = fn_get_application_id(12, 6) ORDER BY id;               -- audit trail from trigger
ROLLBACK;

-- ----------------------------------------------------------------- DREAM-OFFER UPGRADE (rolled back)
-- Diya (student 2) is placed at DataWave (DREAM). CloudNest is SUPER_DREAM, so a new offer is allowed.
BEGIN;
CALL sp_schedule_interview(fn_get_application_id(2, 3), 'TECHNICAL', LOCALTIMESTAMP + INTERVAL '1 day');
CALL sp_update_application_status(fn_get_application_id(2, 3), 'SELECTED');
SELECT offer_id, company, tier, package, status FROM v_offer_overview WHERE student_id = 2 ORDER BY offer_id;
CALL sp_respond_to_offer(fn_get_offer_id(2, 3), TRUE);                         -- accept the higher-tier offer
SELECT offer_id, company, tier, package, status FROM v_offer_overview WHERE student_id = 2 ORDER BY offer_id;  -- old offer SUPERSEDED
SELECT student_name, company, package FROM placement_summary WHERE student_name = 'Diya Patil';              -- upgraded
ROLLBACK;

-- ----------------------------------------------------------------- BULK SHORTLISTING (rolled back)
BEGIN;
CALL sp_bulk_update_status(1, 'APPLIED', 'SHORTLISTED', NULL, 8.0);            -- job 1: everyone APPLIED with CGPA >= 8.0
SELECT student_name, status FROM v_application_overview WHERE job_title = 'Software Engineer' ORDER BY student_name;
ROLLBACK;

-- ----------------------------------------------------------------- OTP (signup / password reset)
DO $$
DECLARE
    v_otp TEXT;
BEGIN
    RAISE NOTICE 'roster match for signup: student id = %', fn_find_student_for_signup('ce2023005', 'Priya.Bansal@example.edu');
    v_otp := fn_generate_otp('demo.otp@example.edu', 'SIGNUP');
    RAISE NOTICE 'OTP e-mailed to user (6 digits): %', v_otp;
    RAISE NOTICE 'wrong code accepted?   %', fn_verify_otp('demo.otp@example.edu', 'SIGNUP', 'abcdef');
    RAISE NOTICE 'correct code accepted? %', fn_verify_otp('demo.otp@example.edu', 'SIGNUP', v_otp);
    RAISE NOTICE 'reuse accepted?        %', fn_verify_otp('demo.otp@example.edu', 'SIGNUP', v_otp);   -- single use
END $$;
DELETE FROM email_otps WHERE email = 'demo.otp@example.edu';                   -- cleanup

-- ----------------------------------------------------------------- OTHER ROUTINES
CALL sp_print_placement_report();               -- cursor loop, see Messages tab
CALL sp_refresh_analytics();
SELECT * FROM mv_placement_kpis;
SELECT placement_status, COUNT(*) FROM v_student_status GROUP BY placement_status;
SELECT title, message, is_read FROM notifications WHERE student_id = 1 ORDER BY id DESC LIMIT 5;

-- ----------------------------------------------------------------- TRIGGER GUARDS (each blocked attempt is caught)
-- a) Not eligible (CGPA too low)
DO $$ BEGIN
    INSERT INTO applications (student_id, job_id) VALUES (3, 1);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'BLOCKED (eligibility): %', SQLERRM; END $$;

-- b) Job closed / deadline passed
DO $$ BEGIN
    INSERT INTO applications (student_id, job_id) VALUES (1, 7);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'BLOCKED (closed job): %', SQLERRM; END $$;

-- c) Duplicate application (UNIQUE constraint via procedure)
DO $$ BEGIN
    CALL sp_apply_to_job(5, 1);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'BLOCKED (duplicate): %', SQLERRM; END $$;

-- d) Illegal status jump APPLIED -> SELECTED
DO $$ BEGIN
    UPDATE applications SET status = 'SELECTED' WHERE student_id = 12 AND job_id = 1;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'BLOCKED (transition): %', SQLERRM; END $$;

-- e) Re-opening a final state (SELECTED -> INTERVIEW)
DO $$ BEGIN
    UPDATE applications SET status = 'INTERVIEW' WHERE student_id = 1 AND job_id = 1;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'BLOCKED (final state): %', SQLERRM; END $$;

-- f) Offer policy at selection: Diya is placed at a DREAM company, job 1 is a CORE company
DO $$ BEGIN
    UPDATE applications SET status = 'SELECTED' WHERE student_id = 2 AND job_id = 1;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'BLOCKED (offer policy): %', SQLERRM; END $$;

-- g) Placement policy at apply time: Diya (placed at DREAM) applying to a CORE company
DO $$ BEGIN
    INSERT INTO applications (student_id, job_id) VALUES (2, 6);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'BLOCKED (apply policy): %', SQLERRM; END $$;

-- h) Interview for an application that is not shortlisted
DO $$ BEGIN
    INSERT INTO interviews (application_id, round_number, round_type)
    VALUES (fn_get_application_id(12, 1), 1, 'TECHNICAL');
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'BLOCKED (interview): %', SQLERRM; END $$;

-- i) Invalid round type (CHECK constraint)
DO $$ BEGIN
    UPDATE interviews SET round_type = 'COFFEE_CHAT' WHERE id = 1;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'BLOCKED (round type): %', SQLERRM; END $$;

-- j) Answering an offer twice
DO $$ BEGIN
    CALL sp_respond_to_offer(fn_get_offer_id(1, 1), FALSE);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'BLOCKED (offer already answered): %', SQLERRM; END $$;

-- Data integrity checks (both should return 0 rows)
SELECT a.id FROM applications a
LEFT JOIN offers o ON o.application_id = a.id
WHERE a.status = 'SELECTED' AND o.id IS NULL;                                   -- SELECTED without offer
SELECT o.id FROM offers o
LEFT JOIN placements p ON p.offer_id = o.id
WHERE o.status = 'ACCEPTED' AND p.id IS NULL;                                   -- ACCEPTED without placement

-- Inspect triggers and routines in the catalog
SELECT event_object_table AS table_name, trigger_name, event_manipulation AS event, action_timing AS timing
FROM information_schema.triggers WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
SELECT routine_name, routine_type FROM information_schema.routines
WHERE routine_schema = 'public' ORDER BY routine_type, routine_name;
