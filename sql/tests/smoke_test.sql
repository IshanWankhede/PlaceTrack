-- =====================================================================
-- PlaceTrack | sql/tests/smoke_test.sql
-- Comprehensive database smoke test suite.
--
-- Validates:
--  1. Baseline schema counts & data integrity
--  2. Eligibility engine (CGPA boundary, backlogs, skills, department scope)
--  3. Trigger guards (negative testing: each illegal mutation is blocked)
--  4. Full application lifecycle + offer auto-creation + acceptance
--  5. Tier policy enforcement & dream-offer upgrade
--  6. Bulk shortlisting procedure
--  7. OTP generation, verification, and single-use consumption
--  8. Idempotence verification (data unchanged after run)
--
-- Execution:
--  docker compose exec -T db psql -U placetrack -d placetrack_db -v ON_ERROR_STOP=1 < sql/tests/smoke_test.sql
-- =====================================================================

DO $$
DECLARE
    v_cnt               INT;
    v_rate              NUMERIC;
    v_bool              BOOLEAN;
    v_guard_ok          BOOLEAN;
    v_app_id            INT;
    v_offer_id          INT;
    v_otp               TEXT;
    v_rec               RECORD;
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Starting PlaceTrack Database Smoke Test Suite...';
    RAISE NOTICE '==================================================';

    -- -----------------------------------------------------------------
    -- 1. BASELINE COUNTS & DATA INTEGRITY
    -- -----------------------------------------------------------------
    SELECT COUNT(*) INTO v_cnt FROM students;
    IF v_cnt <> 12 THEN
        RAISE EXCEPTION 'Expected 12 students, found %', v_cnt;
    END IF;

    SELECT COUNT(*) INTO v_cnt FROM jobs;
    IF v_cnt <> 7 THEN
        RAISE EXCEPTION 'Expected 7 jobs, found %', v_cnt;
    END IF;

    SELECT COUNT(*) INTO v_cnt FROM applications;
    IF v_cnt <> 14 THEN
        RAISE EXCEPTION 'Expected 14 applications, found %', v_cnt;
    END IF;

    SELECT COUNT(*) INTO v_cnt FROM offers;
    IF v_cnt <> 5 THEN
        RAISE EXCEPTION 'Expected 5 offers, found %', v_cnt;
    END IF;

    SELECT COUNT(*) INTO v_cnt FROM offers WHERE status <> 'ACCEPTED';
    IF v_cnt <> 0 THEN
        RAISE EXCEPTION 'Expected 0 unaccepted offers in seed, found %', v_cnt;
    END IF;

    SELECT COUNT(*) INTO v_cnt FROM placements;
    IF v_cnt <> 5 THEN
        RAISE EXCEPTION 'Expected 5 placements, found %', v_cnt;
    END IF;

    v_rate := fn_placement_rate();
    IF v_rate <> 41.67 THEN
        RAISE EXCEPTION 'Expected placement rate 41.67, found %', v_rate;
    END IF;

    -- Integrity: no SELECTED application without offer
    SELECT COUNT(*) INTO v_cnt
    FROM applications a
    LEFT JOIN offers o ON o.application_id = a.id
    WHERE a.status = 'SELECTED' AND o.id IS NULL;
    IF v_cnt <> 0 THEN
        RAISE EXCEPTION 'Found % SELECTED applications without offers', v_cnt;
    END IF;

    -- Integrity: no ACCEPTED offer without placement
    SELECT COUNT(*) INTO v_cnt
    FROM offers o
    LEFT JOIN placements p ON p.offer_id = o.id
    WHERE o.status = 'ACCEPTED' AND p.id IS NULL;
    IF v_cnt <> 0 THEN
        RAISE EXCEPTION 'Found % ACCEPTED offers without placements', v_cnt;
    END IF;

    RAISE NOTICE '[PASS] Baseline counts and referential integrity verified.';

    -- -----------------------------------------------------------------
    -- 2. ELIGIBILITY ENGINE & RULES CHECK
    -- -----------------------------------------------------------------
    -- Student 1 (Aarav) on Job 1: fully eligible
    IF NOT fn_is_eligible(1, 1) THEN
        RAISE EXCEPTION 'Student 1 should be eligible for Job 1';
    END IF;

    -- Student 3 (Rohan) on Job 1: ineligible (CGPA 7.9 < 8.0 and 1 backlog)
    IF fn_is_eligible(3, 1) THEN
        RAISE EXCEPTION 'Student 3 should NOT be eligible for Job 1';
    END IF;

    -- Verify fn_eligibility_check report for student 3 on job 1
    SELECT COUNT(*) INTO v_cnt
    FROM fn_eligibility_check(3, 1)
    WHERE (rule = 'CGPA' AND NOT passed) OR (rule = 'Active backlogs' AND NOT passed);
    IF v_cnt <> 2 THEN
        RAISE EXCEPTION 'fn_eligibility_check(3, 1) should show CGPA and backlogs failing';
    END IF;

    -- Student 4 (Sneha) on Job 1: ineligible (missing required Git skill)
    IF fn_is_eligible(4, 1) THEN
        RAISE EXCEPTION 'Student 4 should NOT be eligible for Job 1 (missing Git)';
    END IF;

    -- Student 1 (Aarav) on Job 2: ineligible (SQL INTERMEDIATE < ADVANCED)
    IF fn_is_eligible(1, 2) THEN
        RAISE EXCEPTION 'Student 1 should NOT be eligible for Job 2 (SQL skill gap)';
    END IF;
    SELECT COUNT(*) INTO v_cnt
    FROM fn_eligibility_check(1, 2)
    WHERE rule = 'Skill: SQL' AND NOT passed;
    IF v_cnt <> 1 THEN
        RAISE EXCEPTION 'fn_eligibility_check(1, 2) should show SQL skill failing';
    END IF;

    -- Student 5 (Kabir) on Job 1: eligible (boundary CGPA 8.0, all skills present, dept IT allowed)
    IF NOT fn_is_eligible(5, 1) THEN
        RAISE EXCEPTION 'Student 5 should be eligible for Job 1 on CGPA 8.0 boundary';
    END IF;

    -- Department scope: Student 7 (ENTC) on Job 1 (open only to CE, IT)
    IF fn_is_eligible(7, 1) THEN
        RAISE EXCEPTION 'Student 7 (ENTC) should be department-restricted from Job 1';
    END IF;

    -- fn_eligible_students(1) must return exactly 4 students: 1, 2, 5, 12
    SELECT COUNT(*) INTO v_cnt FROM fn_eligible_students(1);
    IF v_cnt <> 4 THEN
        RAISE EXCEPTION 'fn_eligible_students(1) expected 4 students, got %', v_cnt;
    END IF;

    SELECT COUNT(*) INTO v_cnt
    FROM fn_eligible_students(1)
    WHERE (student_id IN (1, 2) AND NOT policy_ok)
       OR (student_id IN (5, 12) AND policy_ok);
    IF v_cnt <> 4 THEN
        RAISE EXCEPTION 'fn_eligible_students(1) policy_ok flags do not match expectations';
    END IF;

    -- fn_eligible_students(2) must return exactly 2 students: 2 and 4
    SELECT COUNT(*) INTO v_cnt FROM fn_eligible_students(2);
    IF v_cnt <> 2 THEN
        RAISE EXCEPTION 'fn_eligible_students(2) expected 2 students, got %', v_cnt;
    END IF;

    SELECT COUNT(*) INTO v_cnt
    FROM fn_eligible_students(2)
    WHERE (student_id = 2 AND NOT policy_ok)
       OR (student_id = 4 AND policy_ok);
    IF v_cnt <> 2 THEN
        RAISE EXCEPTION 'fn_eligible_students(2) policy_ok flags do not match expectations';
    END IF;

    RAISE NOTICE '[PASS] Eligibility engine rules and reports verified.';

    -- -----------------------------------------------------------------
    -- 3. TRIGGER GUARDS (NEGATIVE TESTING)
    -- -----------------------------------------------------------------
    -- Guard a: Ineligible application insert (CGPA/backlog)
    v_guard_ok := FALSE;
    BEGIN
        INSERT INTO applications (student_id, job_id) VALUES (3, 1);
    EXCEPTION WHEN OTHERS THEN
        v_guard_ok := TRUE;
    END;
    IF NOT v_guard_ok THEN
        RAISE EXCEPTION 'Trigger guard failed: Ineligible student application was not blocked';
    END IF;

    -- Guard b: Application to closed job
    v_guard_ok := FALSE;
    BEGIN
        INSERT INTO applications (student_id, job_id) VALUES (1, 7);
    EXCEPTION WHEN OTHERS THEN
        v_guard_ok := TRUE;
    END;
    IF NOT v_guard_ok THEN
        RAISE EXCEPTION 'Trigger guard failed: Application to closed job was not blocked';
    END IF;

    -- Guard c: Duplicate application
    v_guard_ok := FALSE;
    BEGIN
        INSERT INTO applications (student_id, job_id) VALUES (1, 1);
    EXCEPTION WHEN OTHERS THEN
        v_guard_ok := TRUE;
    END;
    IF NOT v_guard_ok THEN
        RAISE EXCEPTION 'Trigger guard failed: Duplicate application was not blocked';
    END IF;

    -- Guard d: Illegal status transition (APPLIED -> SELECTED)
    v_guard_ok := FALSE;
    BEGIN
        UPDATE applications SET status = 'SELECTED' WHERE student_id = 12 AND job_id = 1;
    EXCEPTION WHEN OTHERS THEN
        v_guard_ok := TRUE;
    END;
    IF NOT v_guard_ok THEN
        RAISE EXCEPTION 'Trigger guard failed: Illegal transition APPLIED -> SELECTED was not blocked';
    END IF;

    -- Guard e: Reopening terminal status (SELECTED -> INTERVIEW)
    v_guard_ok := FALSE;
    BEGIN
        UPDATE applications SET status = 'INTERVIEW' WHERE student_id = 1 AND job_id = 1;
    EXCEPTION WHEN OTHERS THEN
        v_guard_ok := TRUE;
    END;
    IF NOT v_guard_ok THEN
        RAISE EXCEPTION 'Trigger guard failed: Transition from terminal SELECTED was not blocked';
    END IF;

    -- Guard f: Offer tier policy at selection (Diya on CORE job 1)
    v_guard_ok := FALSE;
    BEGIN
        UPDATE applications SET status = 'SELECTED' WHERE student_id = 2 AND job_id = 1;
    EXCEPTION WHEN OTHERS THEN
        v_guard_ok := TRUE;
    END;
    IF NOT v_guard_ok THEN
        RAISE EXCEPTION 'Trigger guard failed: Lower/same tier selection was not blocked';
    END IF;

    -- Guard g: Apply tier policy (Diya placed at DREAM applying to CORE job 6)
    v_guard_ok := FALSE;
    BEGIN
        INSERT INTO applications (student_id, job_id) VALUES (2, 6);
    EXCEPTION WHEN OTHERS THEN
        v_guard_ok := TRUE;
    END;
    IF NOT v_guard_ok THEN
        RAISE EXCEPTION 'Trigger guard failed: Application to lower tier company was not blocked';
    END IF;

    -- Guard h: Interview on non-shortlisted application
    v_guard_ok := FALSE;
    BEGIN
        INSERT INTO interviews (application_id, round_number, round_type)
        VALUES (fn_get_application_id(12, 1), 1, 'TECHNICAL');
    EXCEPTION WHEN OTHERS THEN
        v_guard_ok := TRUE;
    END;
    IF NOT v_guard_ok THEN
        RAISE EXCEPTION 'Trigger guard failed: Interview on APPLIED status was not blocked';
    END IF;

    -- Guard i: Invalid round type
    v_guard_ok := FALSE;
    BEGIN
        UPDATE interviews SET round_type = 'INVALID_ROUND' WHERE id = 1;
    EXCEPTION WHEN OTHERS THEN
        v_guard_ok := TRUE;
    END;
    IF NOT v_guard_ok THEN
        RAISE EXCEPTION 'Trigger guard failed: Invalid round_type CHECK constraint not enforced';
    END IF;

    -- Guard j: Responding to already answered offer
    v_guard_ok := FALSE;
    BEGIN
        CALL sp_respond_to_offer(fn_get_offer_id(1, 1), FALSE);
    EXCEPTION WHEN OTHERS THEN
        v_guard_ok := TRUE;
    END;
    IF NOT v_guard_ok THEN
        RAISE EXCEPTION 'Trigger guard failed: Responding to already answered offer was not blocked';
    END IF;

    RAISE NOTICE '[PASS] All 10 trigger guards and integrity constraints verified.';

    -- -----------------------------------------------------------------
    -- 4. APPLICATION LIFECYCLE, AUTO-OFFER & ACCEPTANCE (IDEMPOTENT)
    -- -----------------------------------------------------------------
    BEGIN
        -- Student 12 (Priya) applies to job 6 (TechNova Intern PPO)
        CALL sp_apply_to_job(12, 6);
        v_app_id := fn_get_application_id(12, 6);

        CALL sp_update_application_status(v_app_id, 'SHORTLISTED');
        CALL sp_schedule_interview(v_app_id, 'TECHNICAL', LOCALTIMESTAMP + INTERVAL '1 day');
        CALL sp_record_interview_result(v_app_id, 1, 'CLEARED', 'Good performance');
        CALL sp_update_application_status(v_app_id, 'SELECTED');

        -- Offer must be auto-created in PENDING status
        v_offer_id := fn_get_offer_id(12, 6);
        SELECT COUNT(*) INTO v_cnt FROM offers WHERE id = v_offer_id AND status = 'PENDING';
        IF v_cnt <> 1 THEN
            RAISE EXCEPTION 'Auto-created offer not found or not PENDING';
        END IF;

        -- Set breakdown and accept
        CALL sp_set_offer_breakdown(v_offer_id, 3.50, 0.80, 0.50);
        CALL sp_respond_to_offer(v_offer_id, TRUE);

        -- Verify placement row was created
        SELECT COUNT(*) INTO v_cnt FROM placements WHERE student_id = 12 AND offer_id = v_offer_id;
        IF v_cnt <> 1 THEN
            RAISE EXCEPTION 'Placement row was not created upon offer acceptance';
        END IF;

        -- Verify notification was created
        SELECT COUNT(*) INTO v_cnt FROM notifications WHERE student_id = 12 AND title = 'Placement confirmed';
        IF v_cnt < 1 THEN
            RAISE EXCEPTION 'Confirmation notification was not sent';
        END IF;

        -- Intentionally abort this subtransaction to leave database unchanged
        RAISE EXCEPTION USING errcode = '99001';
    EXCEPTION WHEN SQLSTATE '99001' THEN
        -- Expected rollback
    END;

    -- Verify state rolled back cleanly
    IF EXISTS (SELECT 1 FROM applications WHERE student_id = 12 AND job_id = 6) THEN
        RAISE EXCEPTION 'Lifecycle test failed to roll back application';
    END IF;

    RAISE NOTICE '[PASS] Full application lifecycle, auto-offer and acceptance verified.';

    -- -----------------------------------------------------------------
    -- 5. TIER POLICY & DREAM-OFFER UPGRADE (IDEMPOTENT)
    -- -----------------------------------------------------------------
    BEGIN
        -- Diya (student 2) currently placed at DataWave (DREAM, offer_id 2).
        -- Job 3 (CloudNest) is SUPER_DREAM. Application 7 is currently SHORTLISTED.
        v_app_id := fn_get_application_id(2, 3);
        IF v_app_id IS NULL THEN
            RAISE EXCEPTION 'Application (2, 3) not found for upgrade test';
        END IF;

        CALL sp_schedule_interview(v_app_id, 'TECHNICAL', LOCALTIMESTAMP + INTERVAL '1 day');
        CALL sp_update_application_status(v_app_id, 'SELECTED');

        v_offer_id := fn_get_offer_id(2, 3);
        IF v_offer_id IS NULL THEN
            RAISE EXCEPTION 'Upgrade offer for CloudNest not created';
        END IF;

        -- Accept SUPER_DREAM offer
        CALL sp_respond_to_offer(v_offer_id, TRUE);

        -- Previous offer must now be SUPERSEDED
        SELECT status INTO v_rec FROM offers WHERE id = 2;
        IF v_rec.status <> 'SUPERSEDED' THEN
            RAISE EXCEPTION 'Previous DREAM offer was not SUPERSEDED (status=%)', v_rec.status;
        END IF;

        -- Placement must now point to CloudNest (company 3)
        SELECT company_id, package INTO v_rec FROM placements WHERE student_id = 2;
        IF v_rec.company_id <> 3 OR v_rec.package <> 10.50 THEN
            RAISE EXCEPTION 'Placement was not upgraded to CloudNest (company=%, package=%)',
                            v_rec.company_id, v_rec.package;
        END IF;

        RAISE EXCEPTION USING errcode = '99002';
    EXCEPTION WHEN SQLSTATE '99002' THEN
        -- Expected rollback
    END;

    -- Verify Diya is still placed at DataWave (offer 2 still ACCEPTED)
    SELECT status INTO v_rec FROM offers WHERE id = 2;
    IF v_rec.status <> 'ACCEPTED' THEN
        RAISE EXCEPTION 'Tier upgrade test failed to restore original offer state';
    END IF;

    RAISE NOTICE '[PASS] Tier policy and dream-offer upgrade verified.';

    -- -----------------------------------------------------------------
    -- 6. BULK SHORTLISTING PROCEDURE (IDEMPOTENT)
    -- -----------------------------------------------------------------
    BEGIN
        -- Job 1: move all APPLIED students with CGPA >= 8.0 to SHORTLISTED
        CALL sp_bulk_update_status(1, 'APPLIED', 'SHORTLISTED', NULL, 8.0);

        -- Student 12 (Priya, CGPA 8.4) was APPLIED; should now be SHORTLISTED
        SELECT status INTO v_rec FROM applications WHERE student_id = 12 AND job_id = 1;
        IF v_rec.status <> 'SHORTLISTED' THEN
            RAISE EXCEPTION 'sp_bulk_update_status failed to shortlist eligible applicant';
        END IF;

        RAISE EXCEPTION USING errcode = '99003';
    EXCEPTION WHEN SQLSTATE '99003' THEN
        -- Expected rollback
    END;

    SELECT status INTO v_rec FROM applications WHERE student_id = 12 AND job_id = 1;
    IF v_rec.status <> 'APPLIED' THEN
        RAISE EXCEPTION 'Bulk update test failed to restore original application state';
    END IF;

    RAISE NOTICE '[PASS] Bulk status update procedure verified.';

    -- -----------------------------------------------------------------
    -- 7. OTP LIFECYCLE (EXPIRY, WRONG CODE, SINGLE USE)
    -- -----------------------------------------------------------------
    v_otp := fn_generate_otp('smoke.test@example.edu', 'SIGNUP');
    IF LENGTH(v_otp) <> 6 THEN
        RAISE EXCEPTION 'Generated OTP must be 6 digits, got %', v_otp;
    END IF;

    IF fn_verify_otp('smoke.test@example.edu', 'SIGNUP', '000000') THEN
        RAISE EXCEPTION 'Wrong OTP was erroneously accepted';
    END IF;

    IF NOT fn_verify_otp('smoke.test@example.edu', 'SIGNUP', v_otp) THEN
        RAISE EXCEPTION 'Correct OTP was rejected';
    END IF;

    IF fn_verify_otp('smoke.test@example.edu', 'SIGNUP', v_otp) THEN
        RAISE EXCEPTION 'Consumed OTP was accepted twice (single use violation)';
    END IF;

    DELETE FROM email_otps WHERE email = 'smoke.test@example.edu';
    RAISE NOTICE '[PASS] OTP generation, verification and single-use verified.';

    -- -----------------------------------------------------------------
    -- 8. FINAL IDEMPOTENCE CHECK
    -- -----------------------------------------------------------------
    SELECT COUNT(*) INTO v_cnt FROM students;
    IF v_cnt <> 12 THEN RAISE EXCEPTION 'Post-check failed: student count altered'; END IF;

    SELECT COUNT(*) INTO v_cnt FROM jobs;
    IF v_cnt <> 7 THEN RAISE EXCEPTION 'Post-check failed: job count altered'; END IF;

    SELECT COUNT(*) INTO v_cnt FROM applications;
    IF v_cnt <> 14 THEN RAISE EXCEPTION 'Post-check failed: application count altered'; END IF;

    SELECT COUNT(*) INTO v_cnt FROM offers;
    IF v_cnt <> 5 THEN RAISE EXCEPTION 'Post-check failed: offer count altered'; END IF;

    SELECT COUNT(*) INTO v_cnt FROM placements;
    IF v_cnt <> 5 THEN RAISE EXCEPTION 'Post-check failed: placement count altered'; END IF;

    IF fn_placement_rate() <> 41.67 THEN
        RAISE EXCEPTION 'Post-check failed: placement rate altered';
    END IF;

    RAISE NOTICE '==================================================';
    RAISE NOTICE 'ALL SMOKE TESTS PASSED';
    RAISE NOTICE '==================================================';
END $$;
