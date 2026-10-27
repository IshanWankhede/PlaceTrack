-- =====================================================================
-- PlaceTrack | 04_procedures.sql | Stored procedures (CALL ...)
-- Business rules live in triggers (05_triggers.sql); procedures wrap workflows.
-- =====================================================================

-- Student applies to a job. Eligibility/deadline/status checks are enforced by
-- trigger trg_applications_validate_insert; here we add friendly error handling.
CREATE OR REPLACE PROCEDURE sp_apply_to_job(p_student_id INT, p_job_id INT)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO applications (student_id, job_id) VALUES (p_student_id, p_job_id);
    RAISE NOTICE 'Application created for student % on job %', p_student_id, p_job_id;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Student % has already applied to job %', p_student_id, p_job_id;
END;
$$;

-- Staff moves an application to a new status (transition rules enforced by trigger).
CREATE OR REPLACE PROCEDURE sp_update_application_status(p_application_id INT, p_new_status VARCHAR)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE applications SET status = p_new_status WHERE id = p_application_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application % not found', p_application_id;
    END IF;
    RAISE NOTICE 'Application % is now %', p_application_id, p_new_status;
END;
$$;

-- Student withdraws (allowed from any non-terminal state; trigger enforces).
CREATE OR REPLACE PROCEDURE sp_withdraw_application(p_application_id INT)
LANGUAGE plpgsql AS $$
BEGIN
    CALL sp_update_application_status(p_application_id, 'WITHDRAWN');
END;
$$;

-- Schedule the next interview round. SHORTLISTED applications move to INTERVIEW automatically.
-- Optional logistics: meeting link / venue / panelists / reporting time.
CREATE OR REPLACE PROCEDURE sp_schedule_interview(
    p_application_id INT,
    p_round_type     VARCHAR,
    p_scheduled_at   TIMESTAMP,
    p_meeting_link   VARCHAR DEFAULT NULL,
    p_venue          VARCHAR DEFAULT NULL,
    p_panelists      TEXT    DEFAULT NULL,
    p_reporting_time TIME    DEFAULT NULL
)
LANGUAGE plpgsql AS $$
DECLARE
    v_status VARCHAR;
    v_round  INT;
BEGIN
    SELECT status INTO v_status FROM applications WHERE id = p_application_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application % not found', p_application_id;
    END IF;

    IF v_status = 'SHORTLISTED' THEN
        UPDATE applications SET status = 'INTERVIEW' WHERE id = p_application_id;
    ELSIF v_status <> 'INTERVIEW' THEN
        RAISE EXCEPTION 'Cannot schedule interview: application % is %', p_application_id, v_status;
    END IF;

    SELECT COALESCE(MAX(round_number), 0) + 1 INTO v_round
    FROM interviews WHERE application_id = p_application_id;

    INSERT INTO interviews (application_id, round_number, round_type, scheduled_at,
                            meeting_link, venue, panelists, reporting_time)
    VALUES (p_application_id, v_round, p_round_type, p_scheduled_at,
            p_meeting_link, p_venue, p_panelists, p_reporting_time);

    RAISE NOTICE 'Round % (%) scheduled for application %', v_round, p_round_type, p_application_id;
END;
$$;

-- Record a round result. A REJECTED round rejects the whole application.
CREATE OR REPLACE PROCEDURE sp_record_interview_result(
    p_application_id INT,
    p_round_number   INT,
    p_result         VARCHAR,
    p_remarks        TEXT DEFAULT NULL
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE interviews
       SET result = p_result, remarks = COALESCE(p_remarks, remarks)
     WHERE application_id = p_application_id AND round_number = p_round_number;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Round % not found for application %', p_round_number, p_application_id;
    END IF;

    IF p_result = 'REJECTED' THEN
        UPDATE applications SET status = 'REJECTED'
         WHERE id = p_application_id AND status = 'INTERVIEW';
    END IF;
END;
$$;

-- Close every OPEN job whose deadline has passed.
CREATE OR REPLACE PROCEDURE sp_close_expired_jobs()
LANGUAGE plpgsql AS $$
DECLARE
    v_count INT;
BEGIN
    UPDATE jobs SET status = 'CLOSED'
     WHERE status = 'OPEN' AND application_deadline < CURRENT_DATE;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE '% job(s) closed', v_count;
END;
$$;

-- Refresh the materialized KPI view.
CREATE OR REPLACE PROCEDURE sp_refresh_analytics()
LANGUAGE plpgsql AS $$
BEGIN
    REFRESH MATERIALIZED VIEW mv_placement_kpis;
END;
$$;

-- Cursor demo: prints a placement report to the Messages tab of pgAdmin.
CREATE OR REPLACE PROCEDURE sp_print_placement_report()
LANGUAGE plpgsql AS $$
DECLARE
    cur CURSOR FOR
        SELECT student_name, company, package FROM placement_summary ORDER BY package DESC;
    rec RECORD;
BEGIN
    OPEN cur;
    LOOP
        FETCH cur INTO rec;
        EXIT WHEN NOT FOUND;
        RAISE NOTICE '% -> % (% LPA)', rec.student_name, rec.company, rec.package;
    END LOOP;
    CLOSE cur;
END;
$$;

-- Staff sets the CTC breakdown of a PENDING offer; total package = base + bonus + ESOP.
CREATE OR REPLACE PROCEDURE sp_set_offer_breakdown(
    p_offer_id INT, p_base NUMERIC, p_bonus NUMERIC, p_esop NUMERIC
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE offers
       SET base_lpa = p_base, bonus_lpa = p_bonus, esop_lpa = p_esop,
           package  = p_base + p_bonus + p_esop
     WHERE id = p_offer_id AND status = 'PENDING';
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Offer % not found or no longer pending', p_offer_id;
    END IF;
END;
$$;

-- Student accepts or declines an offer.
--  * Accepting creates (or UPGRADES) the placement row and supersedes a lower-tier accepted offer.
--  * Other PENDING offers of the same or lower tier are LOCKED (single-offer rule);
--    pending offers of a higher tier stay open (dream-offer rule).
CREATE OR REPLACE PROCEDURE sp_respond_to_offer(p_offer_id INT, p_accept BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_offer offers%ROWTYPE;
    v_rank  INT;
BEGIN
    SELECT * INTO v_offer FROM offers WHERE id = p_offer_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Offer % not found', p_offer_id;
    END IF;
    IF v_offer.status <> 'PENDING' THEN
        RAISE EXCEPTION 'Offer % is already %', p_offer_id, v_offer.status;
    END IF;

    IF NOT p_accept THEN
        UPDATE offers SET status = 'DECLINED', responded_at = NOW() WHERE id = p_offer_id;
        RAISE NOTICE 'Offer % declined', p_offer_id;
        RETURN;
    END IF;

    IF NOT fn_policy_allows(v_offer.student_id, v_offer.job_id) THEN
        RAISE EXCEPTION 'Offer policy: student % already holds an offer of the same or higher tier', v_offer.student_id;
    END IF;

    -- an earlier accepted offer (lower tier) is superseded by this one
    UPDATE offers SET status = 'SUPERSEDED'
     WHERE student_id = v_offer.student_id AND status = 'ACCEPTED';

    UPDATE offers SET status = 'ACCEPTED', responded_at = NOW() WHERE id = p_offer_id;

    IF EXISTS (SELECT 1 FROM placements WHERE student_id = v_offer.student_id) THEN
        UPDATE placements
           SET offer_id = v_offer.id, application_id = v_offer.application_id,
               job_id = v_offer.job_id, company_id = v_offer.company_id,
               package = v_offer.package, placement_date = CURRENT_DATE
         WHERE student_id = v_offer.student_id;
    ELSE
        INSERT INTO placements (student_id, application_id, offer_id, job_id, company_id, package)
        VALUES (v_offer.student_id, v_offer.application_id, v_offer.id,
                v_offer.job_id, v_offer.company_id, v_offer.package);
    END IF;

    SELECT fn_tier_rank(tier) INTO v_rank FROM companies WHERE id = v_offer.company_id;

    UPDATE offers o SET status = 'LOCKED', responded_at = NOW()
      FROM companies c
     WHERE c.id = o.company_id
       AND o.student_id = v_offer.student_id
       AND o.status = 'PENDING'
       AND o.id <> v_offer.id
       AND fn_tier_rank(c.tier) <= v_rank;

    INSERT INTO notifications (student_id, type, title, message)
    VALUES (v_offer.student_id, 'OFFER', 'Placement confirmed',
            'You accepted an offer of ' || v_offer.package || ' LPA. Congratulations!');
    RAISE NOTICE 'Offer % accepted', p_offer_id;
END;
$$;

-- Bulk-move all applications of a job from one status to another (optionally per department / min CGPA).
-- One statement = atomic: if any row breaks a trigger rule, nothing changes.
CREATE OR REPLACE PROCEDURE sp_bulk_update_status(
    p_job_id        INT,
    p_from_status   VARCHAR,
    p_to_status     VARCHAR,
    p_department_id INT     DEFAULT NULL,
    p_min_cgpa      NUMERIC DEFAULT NULL
)
LANGUAGE plpgsql AS $$
DECLARE
    v_count INT;
BEGIN
    UPDATE applications a
       SET status = p_to_status
      FROM students s
     WHERE s.id = a.student_id
       AND a.job_id = p_job_id
       AND a.status = p_from_status
       AND (p_department_id IS NULL OR s.department_id = p_department_id)
       AND (p_min_cgpa IS NULL OR s.cgpa >= p_min_cgpa);
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE '% application(s) moved % -> %', v_count, p_from_status, p_to_status;
END;
$$;

-- CDC verifies (or un-verifies) a student's scorecard.
CREATE OR REPLACE PROCEDURE sp_verify_student_cgpa(p_student_id INT, p_verified BOOLEAN DEFAULT TRUE)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE students SET cgpa_verified = p_verified WHERE id = p_student_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Student % not found', p_student_id;
    END IF;
END;
$$;

-- Archive a drive (no new applications, hidden from active lists).
CREATE OR REPLACE PROCEDURE sp_archive_job(p_job_id INT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE jobs SET status = 'ARCHIVED' WHERE id = p_job_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Job % not found', p_job_id;
    END IF;
END;
$$;

-- Mark all of a student's notifications as read.
CREATE OR REPLACE PROCEDURE sp_mark_notifications_read(p_student_id INT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE notifications SET is_read = TRUE WHERE student_id = p_student_id AND NOT is_read;
END;
$$;
