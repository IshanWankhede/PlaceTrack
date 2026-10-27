-- =====================================================================
-- PlaceTrack | 05_triggers.sql | Triggers (data integrity + automation)
--
--  applications  BEFORE INSERT  -> trg_applications_validate_insert   (open job, deadline, eligibility)
--  applications  BEFORE UPDATE  -> trg_applications_validate_status   (legal status transitions)
--  applications  AFTER  UPDATE  -> trg_applications_create_offer      (SELECTED -> PENDING offer, tier policy)
--  applications  AFTER  INS/UPD -> trg_applications_log_status        (audit history)
--  applications  AFTER  UPDATE  -> trg_applications_notify            (student notification)
--  interviews    BEFORE INSERT  -> trg_interviews_validate_insert     (only shortlisted/interview apps)
--  interviews    AFTER  INSERT  -> trg_interviews_notify              (student notification)
--  students/users BEFORE INS/UPD-> trg_*_lowercase_email              (normalize emails)
-- AFTER triggers on the same event fire in alphabetical order of trigger name.
-- =====================================================================

-- 1) Validate a new application ----------------------------------------
CREATE OR REPLACE FUNCTION trg_fn_validate_application_insert()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_status   VARCHAR;
    v_deadline DATE;
BEGIN
    SELECT status, application_deadline INTO v_status, v_deadline FROM jobs WHERE id = NEW.job_id;

    IF v_status IS DISTINCT FROM 'OPEN' THEN
        RAISE EXCEPTION 'Job % is not open for applications', NEW.job_id;
    END IF;
    IF v_deadline IS NOT NULL AND v_deadline < CURRENT_DATE THEN
        RAISE EXCEPTION 'Application deadline for job % has passed (%)', NEW.job_id, v_deadline;
    END IF;
    IF NOT fn_is_eligible(NEW.student_id, NEW.job_id) THEN
        RAISE EXCEPTION 'Student % is not eligible for job %', NEW.student_id, NEW.job_id;
    END IF;

    IF NOT fn_policy_allows(NEW.student_id, NEW.job_id) THEN
        RAISE EXCEPTION 'Placement policy: student % already holds an offer of the same or higher tier', NEW.student_id;
    END IF;

    NEW.status := 'APPLIED';   -- an application can only ever start as APPLIED
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_applications_validate_insert
BEFORE INSERT ON applications
FOR EACH ROW EXECUTE FUNCTION trg_fn_validate_application_insert();

-- 2) Validate status transitions ----------------------------------------
--    APPLIED     -> SHORTLISTED | REJECTED | WITHDRAWN
--    SHORTLISTED -> INTERVIEW   | REJECTED | WITHDRAWN
--    INTERVIEW   -> SELECTED    | REJECTED | WITHDRAWN
--    SELECTED / REJECTED / WITHDRAWN are final (no re-apply, no reopening)
CREATE OR REPLACE FUNCTION trg_fn_validate_status_transition()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NOT (
        (OLD.status = 'APPLIED'     AND NEW.status IN ('SHORTLISTED','REJECTED','WITHDRAWN')) OR
        (OLD.status = 'SHORTLISTED' AND NEW.status IN ('INTERVIEW','REJECTED','WITHDRAWN'))   OR
        (OLD.status = 'INTERVIEW'   AND NEW.status IN ('SELECTED','REJECTED','WITHDRAWN'))
    ) THEN
        RAISE EXCEPTION 'Illegal status transition: % -> %', OLD.status, NEW.status;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_applications_validate_status
BEFORE UPDATE ON applications
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION trg_fn_validate_status_transition();

-- 3) Auto-create a PENDING offer when an application becomes SELECTED ----------
--    Tier policy: a student already placed at tier X may only receive offers from a HIGHER tier.
--    Otherwise the whole UPDATE is rolled back. The placement row itself is created later,
--    when the student accepts (sp_respond_to_offer).
CREATE OR REPLACE FUNCTION trg_fn_create_offer()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_company_id   INT;
    v_company_name VARCHAR;
    v_new_tier     VARCHAR;
    v_title        VARCHAR;
    v_package      NUMERIC;
    v_cur_tier     VARCHAR;
BEGIN
    SELECT j.company_id, c.name, c.tier, j.title, COALESCE(j.package, 0)
      INTO v_company_id, v_company_name, v_new_tier, v_title, v_package
      FROM jobs j JOIN companies c ON c.id = j.company_id
     WHERE j.id = NEW.job_id;

    SELECT c.tier INTO v_cur_tier
      FROM placements p JOIN companies c ON c.id = p.company_id
     WHERE p.student_id = NEW.student_id;

    IF v_cur_tier IS NOT NULL AND fn_tier_rank(v_cur_tier) >= fn_tier_rank(v_new_tier) THEN
        RAISE EXCEPTION 'Student % already placed at a % company; only a higher tier offer is allowed (offer policy)',
                        NEW.student_id, v_cur_tier;
    END IF;

    INSERT INTO offers (application_id, student_id, job_id, company_id, base_lpa, package)
    VALUES (NEW.id, NEW.student_id, NEW.job_id, v_company_id, v_package, v_package);

    INSERT INTO notifications (student_id, type, title, message)
    VALUES (NEW.student_id, 'OFFER', 'You have an offer!',
            v_company_name || ' selected you for ' || v_title || '. Accept or decline your offer.');

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_applications_create_offer
AFTER UPDATE ON applications
FOR EACH ROW
WHEN (NEW.status = 'SELECTED' AND OLD.status IS DISTINCT FROM 'SELECTED')
EXECUTE FUNCTION trg_fn_create_offer();

-- 4) Audit log of status changes -----------------------------------------
CREATE OR REPLACE FUNCTION trg_fn_log_application_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO application_status_history (application_id, old_status, new_status)
        VALUES (NEW.id, NULL, NEW.status);
    ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO application_status_history (application_id, old_status, new_status)
        VALUES (NEW.id, OLD.status, NEW.status);
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_applications_log_status
AFTER INSERT OR UPDATE ON applications
FOR EACH ROW EXECUTE FUNCTION trg_fn_log_application_status();

-- 5) Interviews only for shortlisted / in-interview applications ----------
CREATE OR REPLACE FUNCTION trg_fn_validate_interview_insert()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_status VARCHAR;
BEGIN
    SELECT status INTO v_status FROM applications WHERE id = NEW.application_id;
    IF v_status NOT IN ('SHORTLISTED','INTERVIEW') THEN
        RAISE EXCEPTION 'Cannot add interview: application % is %', NEW.application_id, v_status;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_interviews_validate_insert
BEFORE INSERT ON interviews
FOR EACH ROW EXECUTE FUNCTION trg_fn_validate_interview_insert();

-- 6) Normalize emails ------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_fn_lowercase_email()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.email := LOWER(TRIM(NEW.email));
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_students_lowercase_email
BEFORE INSERT OR UPDATE OF email ON students
FOR EACH ROW EXECUTE FUNCTION trg_fn_lowercase_email();

CREATE TRIGGER trg_users_lowercase_email
BEFORE INSERT OR UPDATE OF email ON users
FOR EACH ROW EXECUTE FUNCTION trg_fn_lowercase_email();

-- 7) Student notifications (status changes and interview rounds) ---------------
CREATE OR REPLACE FUNCTION trg_fn_notify_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO notifications (student_id, type, title, message)
    SELECT NEW.student_id, 'APPLICATION', 'Application update',
           'Your application for ' || j.title || ' at ' || c.name || ' is now ' || NEW.status
    FROM jobs j JOIN companies c ON c.id = j.company_id
    WHERE j.id = NEW.job_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_applications_notify
AFTER UPDATE ON applications
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION trg_fn_notify_status();

CREATE OR REPLACE FUNCTION trg_fn_notify_interview()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO notifications (student_id, type, title, message)
    SELECT a.student_id, 'INTERVIEW', 'Round ' || NEW.round_number || ' scheduled',
           NEW.round_type || ' round for ' || j.title || ' at ' || c.name
           || ' on ' || COALESCE(TO_CHAR(NEW.scheduled_at, 'DD Mon YYYY HH24:MI'), 'a date to be announced')
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    JOIN companies c ON c.id = j.company_id
    WHERE a.id = NEW.application_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_interviews_notify
AFTER INSERT ON interviews
FOR EACH ROW EXECUTE FUNCTION trg_fn_notify_interview();
