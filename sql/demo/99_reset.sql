-- =====================================================================
-- RESET | drops every PlaceTrack object. Afterwards re-run sql/init/01..06 in order
-- (or simply:  docker compose down -v && docker compose up -d  to rebuild automatically).
-- =====================================================================
DROP MATERIALIZED VIEW IF EXISTS mv_placement_kpis;
DROP VIEW IF EXISTS v_offer_overview, v_student_status, v_company_selections, v_department_stats, v_application_overview, placement_summary;
DROP TABLE IF EXISTS placements, offers, application_status_history, interviews, applications,
                     job_departments, job_skills, jobs, company_contacts, companies, student_skills, skills,
                     notifications, email_otps, users, students, departments CASCADE;
DROP PROCEDURE IF EXISTS sp_mark_notifications_read(INT), sp_archive_job(INT), sp_verify_student_cgpa(INT, BOOLEAN),
     sp_bulk_update_status(INT, VARCHAR, VARCHAR, INT, NUMERIC), sp_respond_to_offer(INT, BOOLEAN),
     sp_set_offer_breakdown(INT, NUMERIC, NUMERIC, NUMERIC),
     sp_print_placement_report(), sp_refresh_analytics(), sp_close_expired_jobs(),
     sp_record_interview_result(INT, INT, VARCHAR, TEXT),
     sp_schedule_interview(INT, VARCHAR, TIMESTAMP, VARCHAR, VARCHAR, TEXT, TIME),
     sp_withdraw_application(INT), sp_update_application_status(INT, VARCHAR), sp_apply_to_job(INT, INT);
DROP FUNCTION IF EXISTS fn_verify_otp(VARCHAR, VARCHAR, VARCHAR), fn_generate_otp(VARCHAR, VARCHAR),
     fn_find_student_for_signup(VARCHAR, VARCHAR), fn_get_offer_id(INT, INT),
     fn_department_placement_rate(INT), fn_placement_rate(), fn_get_application_id(INT, INT),
     fn_eligible_jobs(INT), fn_eligible_students(INT), fn_match_score(INT, INT), fn_is_eligible(INT, INT),
     fn_eligibility_check(INT, INT), fn_policy_allows(INT, INT), fn_tier_rank(VARCHAR), fn_skill_rank(VARCHAR),
     trg_fn_notify_interview(), trg_fn_notify_status(), trg_fn_create_offer(), trg_fn_lowercase_email(), trg_fn_validate_interview_insert(), trg_fn_log_application_status(),
     trg_fn_validate_status_transition(), trg_fn_validate_application_insert();
