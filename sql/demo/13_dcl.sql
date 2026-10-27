-- =====================================================================
-- DCL DEMO | CREATE ROLE, GRANT, REVOKE, column-level privileges, SET ROLE
-- Run as the owner (placetrack). Re-runnable. Cleanup block at the bottom.
-- Roles are cluster-wide, so they show up under "Login/Group Roles" in pgAdmin.
-- =====================================================================

-- 1) Create group roles (no login) and one login user ------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'pt_admin_role')   THEN CREATE ROLE pt_admin_role   NOLOGIN; END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'pt_staff_role')   THEN CREATE ROLE pt_staff_role   NOLOGIN; END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'pt_student_role') THEN CREATE ROLE pt_student_role NOLOGIN; END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'pt_viewer_role')  THEN CREATE ROLE pt_viewer_role  NOLOGIN; END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'pt_demo_staff')   THEN
        CREATE ROLE pt_demo_staff LOGIN PASSWORD 'staff_demo_123' IN ROLE pt_staff_role;
    END IF;
END $$;

-- 2) Connection + schema access ---------------------------------------
GRANT CONNECT ON DATABASE placetrack_db TO pt_admin_role, pt_staff_role, pt_student_role, pt_viewer_role;
GRANT USAGE   ON SCHEMA public          TO pt_admin_role, pt_staff_role, pt_student_role, pt_viewer_role;

-- 3) Admin: everything --------------------------------------------------
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO pt_admin_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pt_admin_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO pt_admin_role;
GRANT EXECUTE ON ALL PROCEDURES IN SCHEMA public TO pt_admin_role;

-- 4) Staff: day-to-day data entry, but NO deletes on students/placements -
GRANT SELECT ON ALL TABLES IN SCHEMA public TO pt_staff_role;
GRANT INSERT, UPDATE ON students, student_skills, companies, company_contacts, jobs, job_skills,
                        job_departments, applications, interviews TO pt_staff_role;
-- triggers run with the caller's rights, so staff must be able to write what the triggers write:
GRANT INSERT, UPDATE ON placements, offers, notifications, application_status_history TO pt_staff_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO pt_staff_role;
GRANT EXECUTE ON ALL FUNCTIONS  IN SCHEMA public TO pt_staff_role;
GRANT EXECUTE ON ALL PROCEDURES IN SCHEMA public TO pt_staff_role;

-- 5) Student: read-only on public catalogue data + their own applications
GRANT SELECT ON jobs, companies, skills, job_skills, job_departments, departments, v_application_overview TO pt_student_role;
GRANT EXECUTE ON FUNCTION fn_eligible_jobs(INT), fn_eligibility_check(INT, INT) TO pt_student_role;
GRANT SELECT ON v_offer_overview TO pt_student_role;
-- Students accept offers through a SECURITY DEFINER procedure: it runs with the owner's rights,
-- so students need NO direct write access to offers or placements.
ALTER PROCEDURE sp_respond_to_offer(INT, BOOLEAN) SECURITY DEFINER SET search_path = public;
GRANT EXECUTE ON PROCEDURE sp_respond_to_offer(INT, BOOLEAN) TO pt_student_role;

-- 6) Viewer (e.g. department head): column-level privilege hides contact details
GRANT SELECT (id, roll_number, name, cgpa, department_id, graduation_year) ON students TO pt_viewer_role;
GRANT SELECT ON placement_summary, v_department_stats, v_company_selections TO pt_viewer_role;

-- 7) REVOKE ---------------------------------------------------------------
REVOKE UPDATE ON companies FROM pt_staff_role;      -- take a privilege back
GRANT  UPDATE ON companies TO   pt_staff_role;      -- and restore it

-- 8) Inspect privileges ------------------------------------------------------
SELECT grantee, table_name, STRING_AGG(privilege_type, ', ' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants
WHERE grantee LIKE 'pt\_%' AND table_schema = 'public'
GROUP BY grantee, table_name
ORDER BY grantee, table_name;

SELECT grantee, table_name, column_name, privilege_type
FROM information_schema.column_privileges
WHERE grantee = 'pt_viewer_role' AND table_name = 'students';

-- 9) Prove the privileges work (blocked actions are caught and printed as NOTICE) --
DO $$
BEGIN
    SET LOCAL ROLE pt_viewer_role;
    PERFORM name, cgpa FROM students LIMIT 1;
    RAISE NOTICE 'viewer CAN read students.name / cgpa';
    PERFORM email FROM students LIMIT 1;
    RAISE NOTICE 'this line is never reached';
EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'viewer blocked from students.email -> %', SQLERRM;
END $$;

DO $$
BEGIN
    SET LOCAL ROLE pt_staff_role;
    DELETE FROM students WHERE id = -1;
EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'staff blocked from DELETE on students -> %', SQLERRM;
END $$;

DO $$
BEGIN
    SET LOCAL ROLE pt_student_role;
    PERFORM * FROM users LIMIT 1;
EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'student blocked from users table -> %', SQLERRM;
END $$;

-- 10) Default privileges for future tables -----------------------------------
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO pt_viewer_role;

-- 11) CLEANUP (uncomment to remove everything created above) ------------------
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE SELECT ON TABLES FROM pt_viewer_role;
-- ALTER PROCEDURE sp_respond_to_offer(INT, BOOLEAN) SECURITY INVOKER RESET search_path;
-- DROP OWNED BY pt_demo_staff, pt_admin_role, pt_staff_role, pt_student_role, pt_viewer_role;
-- DROP ROLE pt_demo_staff, pt_admin_role, pt_staff_role, pt_student_role, pt_viewer_role;
