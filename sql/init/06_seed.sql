-- =====================================================================
-- PlaceTrack | 06_seed.sql | Sample data (DML) - fires the real triggers/procedures
-- IDs below rely on a fresh database (SERIAL starts at 1, rows inserted in order).
-- Dev-only logins:  admin@placetrack.com / Admin@123   staff@placetrack.com / Staff@123
--                   aarav.sharma@example.edu / Student@123
-- =====================================================================

INSERT INTO departments (name, code) VALUES
    ('Computer Engineering',         'CE'),     -- 1
    ('Information Technology',       'IT'),     -- 2
    ('Electronics & Telecommunication','ENTC'), -- 3
    ('Mechanical Engineering',       'ME');     -- 4

INSERT INTO skills (name) VALUES
    ('Python'), ('SQL'), ('Git'), ('Java'), ('React'), ('C++'),
    ('Docker'), ('Data Structures'), ('Machine Learning'), ('Embedded C'),
    ('AutoCAD'), ('Communication');

INSERT INTO students (roll_number, name, email, phone, cgpa, graduation_year, department_id) VALUES
    ('CE2023001', 'Aarav Sharma',    'aarav.sharma@example.edu',    '9000000001', 8.70, 2027, 1),  -- 1
    ('CE2023002', 'Diya Patil',      'diya.patil@example.edu',      '9000000002', 9.10, 2027, 1),  -- 2
    ('CE2023003', 'Rohan Kulkarni',  'rohan.kulkarni@example.edu',  '9000000003', 7.90, 2027, 1),  -- 3
    ('IT2023001', 'Sneha Joshi',     'sneha.joshi@example.edu',     '9000000004', 8.50, 2027, 2),  -- 4
    ('IT2023002', 'Kabir Mehta',     'kabir.mehta@example.edu',     '9000000005', 8.00, 2027, 2),  -- 5
    ('IT2023003', 'Ananya Deshmukh', 'ananya.deshmukh@example.edu', '9000000006', 8.90, 2027, 2),  -- 6
    ('EN2023001', 'Vikram Rao',      'vikram.rao@example.edu',      '9000000007', 7.50, 2027, 3),  -- 7
    ('EN2023002', 'Isha Nair',       'isha.nair@example.edu',       '9000000008', 8.30, 2027, 3),  -- 8
    ('ME2023001', 'Arjun Singh',     'arjun.singh@example.edu',     '9000000009', 7.20, 2027, 4),  -- 9
    ('ME2023002', 'Meera Iyer',      'meera.iyer@example.edu',      '9000000010', 8.10, 2027, 4),  -- 10
    ('CE2023004', 'Neel Gupta',      'neel.gupta@example.edu',      '9000000011', 6.80, 2027, 1),  -- 11
    ('CE2023005', 'Priya Bansal',    'priya.bansal@example.edu',    '9000000012', 8.40, 2027, 1);  -- 12

-- Backlogs and CDC verification (all verified except two recent students)
UPDATE students SET active_backlogs = 1 WHERE roll_number = 'CE2023003';
UPDATE students SET active_backlogs = 2 WHERE roll_number = 'CE2023004';
UPDATE students SET cgpa_verified = TRUE WHERE roll_number NOT IN ('CE2023004', 'CE2023005');

INSERT INTO student_skills (student_id, skill_id, proficiency)
SELECT s.id, k.id, v.prof
FROM (VALUES
    ('CE2023001','Python','ADVANCED'), ('CE2023001','SQL','INTERMEDIATE'), ('CE2023001','Git','INTERMEDIATE'),
    ('CE2023001','React','INTERMEDIATE'), ('CE2023001','Data Structures','ADVANCED'),
    ('CE2023002','Python','EXPERT'), ('CE2023002','SQL','ADVANCED'), ('CE2023002','Git','ADVANCED'),
    ('CE2023002','Machine Learning','ADVANCED'), ('CE2023002','Data Structures','ADVANCED'), ('CE2023002','Docker','INTERMEDIATE'),
    ('CE2023003','Python','INTERMEDIATE'), ('CE2023003','SQL','INTERMEDIATE'), ('CE2023003','Git','INTERMEDIATE'),
    ('IT2023001','Python','ADVANCED'), ('IT2023001','SQL','ADVANCED'), ('IT2023001','Java','INTERMEDIATE'),
    ('IT2023002','Python','INTERMEDIATE'), ('IT2023002','SQL','INTERMEDIATE'), ('IT2023002','Git','INTERMEDIATE'), ('IT2023002','React','ADVANCED'),
    ('IT2023003','Java','ADVANCED'), ('IT2023003','SQL','ADVANCED'), ('IT2023003','Git','ADVANCED'),
    ('IT2023003','Data Structures','ADVANCED'), ('IT2023003','Docker','INTERMEDIATE'),
    ('EN2023001','Embedded C','ADVANCED'), ('EN2023001','C++','INTERMEDIATE'),
    ('EN2023002','Embedded C','EXPERT'), ('EN2023002','C++','ADVANCED'), ('EN2023002','Python','BEGINNER'),
    ('ME2023001','AutoCAD','ADVANCED'),
    ('ME2023002','AutoCAD','EXPERT'), ('ME2023002','Python','BEGINNER'),
    ('CE2023004','Python','BEGINNER'), ('CE2023004','Git','BEGINNER'),
    ('CE2023005','Java','INTERMEDIATE'), ('CE2023005','SQL','INTERMEDIATE'), ('CE2023005','Git','INTERMEDIATE'),
    ('CE2023005','Python','INTERMEDIATE'), ('CE2023005','Communication','ADVANCED')
) AS v(roll, skill, prof)
JOIN students s ON s.roll_number = v.roll
JOIN skills   k ON k.name = v.skill;

INSERT INTO companies (name, industry, location, website, description, tier) VALUES
    ('TechNova Solutions',  'IT Services',   'Pune',      'https://technova.example.com',    'Software services and product engineering', 'CORE'),         -- 1
    ('DataWave Analytics',  'Data & AI',     'Mumbai',    'https://datawave.example.com',    'Analytics and ML consulting',               'DREAM'),        -- 2
    ('CloudNest Systems',   'Cloud',         'Bengaluru', 'https://cloudnest.example.com',   'Cloud infrastructure and DevOps',           'SUPER_DREAM'),  -- 3
    ('Mechano Dynamics',    'Manufacturing', 'Chennai',   'https://mechano.example.com',     'Industrial design and manufacturing',       'CORE'),         -- 4
    ('Embedded Edge Labs',  'Electronics',   'Hyderabad', 'https://embeddededge.example.com','Firmware and embedded systems',             'CORE');         -- 5

INSERT INTO company_contacts (company_id, name, designation, email, phone) VALUES
    (1, 'Neha Kapoor',   'Campus Hiring Lead', 'neha.kapoor@technova.example.com',  '9100000001'),
    (2, 'Rahul Menon',   'Talent Partner',     'rahul.menon@datawave.example.com',  '9100000002'),
    (2, 'Sara Dsouza',   'HR Executive',       'sara.dsouza@datawave.example.com',  '9100000003'),
    (3, 'Vivek Anand',   'University Recruiter','vivek.anand@cloudnest.example.com','9100000004'),
    (4, 'Pooja Shetty',  'HR Manager',         'pooja.shetty@mechano.example.com',  '9100000005'),
    (5, 'Karan Malhotra','Engineering Manager','karan.m@embeddededge.example.com',  '9100000006');

INSERT INTO jobs (company_id, title, description, minimum_cgpa, package, package_max, max_backlogs,
                  job_type, location, drive_date, application_deadline, status) VALUES
    (1, 'Software Engineer',          'Backend and API development',    8.00, 12.00, 14.00, 0, 'FULL_TIME', 'Pune',      CURRENT_DATE + 70, CURRENT_DATE + 60, 'OPEN'),    -- 1
    (2, 'Data Analyst',               'Dashboards and analytics',       8.50, 15.00, 18.00, 0, 'FULL_TIME', 'Mumbai',    CURRENT_DATE + 55, CURRENT_DATE + 45, 'OPEN'),    -- 2
    (3, 'Cloud / DevOps Engineer',    'CI/CD and container platforms',  8.00, 10.50, 12.00, 0, 'FULL_TIME', 'Bengaluru', CURRENT_DATE + 60, CURRENT_DATE + 50, 'OPEN'),    -- 3
    (4, 'Design Engineer',            'CAD design for components',      7.00,  5.50,  6.50, 0, 'FULL_TIME', 'Chennai',   CURRENT_DATE + 50, CURRENT_DATE + 40, 'OPEN'),    -- 4
    (5, 'Embedded Software Engineer', 'Firmware for IoT devices',       7.50,  7.20,  8.50, 0, 'FULL_TIME', 'Hyderabad', CURRENT_DATE + 65, CURRENT_DATE + 55, 'OPEN'),    -- 5
    (1, 'Software Intern (PPO)',      '6-month internship with PPO',    7.00,  4.80,  NULL, 1, 'PPO',       'Pune',      CURRENT_DATE + 40, CURRENT_DATE + 30, 'OPEN'),    -- 6
    (2, 'Junior Analyst',             'Closed drive (used in demos)',   7.00,  6.00,  NULL, 0, 'FULL_TIME', 'Mumbai',    CURRENT_DATE - 5,  CURRENT_DATE - 10, 'CLOSED');  -- 7

INSERT INTO job_skills (job_id, skill_id, required_level)
SELECT v.job_id, k.id, v.lvl
FROM (VALUES
    (1,'Python','INTERMEDIATE'), (1,'SQL','INTERMEDIATE'), (1,'Git','BEGINNER'),
    (2,'Python','ADVANCED'),     (2,'SQL','ADVANCED'),
    (3,'Docker','INTERMEDIATE'), (3,'Git','INTERMEDIATE'),
    (4,'AutoCAD','INTERMEDIATE'),
    (5,'Embedded C','ADVANCED'), (5,'C++','INTERMEDIATE'),
    (6,'Python','BEGINNER'),     (6,'Git','BEGINNER'),
    (7,'SQL','BEGINNER')
) AS v(job_id, skill, lvl)
JOIN skills k ON k.name = v.skill;

-- Department scope (jobs 2, 6, 7 have no rows => open to all departments)
INSERT INTO job_departments (job_id, department_id) VALUES
    (1, 1), (1, 2),     -- Software Engineer: CE, IT
    (3, 1), (3, 2),     -- Cloud/DevOps: CE, IT
    (4, 4),             -- Design Engineer: ME
    (5, 3);             -- Embedded: ENTC

-- Login accounts (bcrypt via pgcrypto; compatible with passlib in FastAPI)
INSERT INTO users (email, password_hash, role, student_id) VALUES
    ('admin@placetrack.com',       crypt('Admin@123',   gen_salt('bf', 10)), 'ADMIN',   NULL),
    ('staff@placetrack.com',       crypt('Staff@123',   gen_salt('bf', 10)), 'STAFF',   NULL),
    ('aarav.sharma@example.edu',   crypt('Student@123', gen_salt('bf', 10)), 'STUDENT', 1);

-- ---------------------------------------------------------------- applications
-- Each INSERT is validated by trg_applications_validate_insert (eligibility etc.)
INSERT INTO applications (student_id, job_id) VALUES
    (1, 1), (2, 1), (5, 1), (12, 1),
    (2, 2), (4, 2),
    (2, 3), (6, 3),
    (9, 4), (10, 4),
    (7, 5), (8, 5),
    (3, 6), (1, 6);

-- ---------------------------------------------------------------- lifecycle (legal transitions only)
UPDATE applications SET status = 'SHORTLISTED'
WHERE (student_id, job_id) IN ((1,1),(2,1),(5,1),(2,2),(4,2),(2,3),(6,3),(9,4),(7,5),(8,5));

-- Interview rounds via stored procedures (SHORTLISTED -> INTERVIEW happens inside the procedure).
-- Optional arguments: meeting link, venue, panelists, reporting time.
CALL sp_schedule_interview(fn_get_application_id(1,1), 'ONLINE_TEST', LOCALTIMESTAMP - INTERVAL '22 days',
                           'https://meet.example.com/technova-ot', NULL, 'Automated assessment', TIME '09:30');
CALL sp_record_interview_result(fn_get_application_id(1,1), 1, 'CLEARED', 'Scored in the top 10 percent');
CALL sp_schedule_interview(fn_get_application_id(1,1), 'TECHNICAL', LOCALTIMESTAMP - INTERVAL '20 days',
                           'https://meet.example.com/technova-tech', NULL, 'Ms. Kapoor, Mr. Das', TIME '11:00');
CALL sp_record_interview_result(fn_get_application_id(1,1), 2, 'CLEARED', 'Strong DSA and problem solving');
CALL sp_schedule_interview(fn_get_application_id(1,1), 'HR',        LOCALTIMESTAMP - INTERVAL '15 days');
CALL sp_record_interview_result(fn_get_application_id(1,1), 3, 'CLEARED', 'Good culture fit');

CALL sp_schedule_interview(fn_get_application_id(2,2), 'TECHNICAL', LOCALTIMESTAMP - INTERVAL '18 days');
CALL sp_record_interview_result(fn_get_application_id(2,2), 1, 'CLEARED', 'Excellent SQL and Python');
CALL sp_schedule_interview(fn_get_application_id(2,2), 'HR',        LOCALTIMESTAMP - INTERVAL '12 days');
CALL sp_record_interview_result(fn_get_application_id(2,2), 2, 'CLEARED', 'Offer recommended');

CALL sp_schedule_interview(fn_get_application_id(2,1), 'TECHNICAL', LOCALTIMESTAMP - INTERVAL '10 days');
CALL sp_record_interview_result(fn_get_application_id(2,1), 1, 'CLEARED', 'Strong; second offer in progress');

CALL sp_schedule_interview(fn_get_application_id(4,2), 'TECHNICAL', LOCALTIMESTAMP - INTERVAL '17 days');
CALL sp_record_interview_result(fn_get_application_id(4,2), 1, 'REJECTED', 'Needs deeper analytics experience');  -- auto-rejects the application

CALL sp_schedule_interview(fn_get_application_id(6,3), 'TECHNICAL', LOCALTIMESTAMP - INTERVAL '14 days');
CALL sp_record_interview_result(fn_get_application_id(6,3), 1, 'CLEARED', 'Solid containers knowledge');
CALL sp_schedule_interview(fn_get_application_id(6,3), 'HR',        LOCALTIMESTAMP - INTERVAL '9 days');
CALL sp_record_interview_result(fn_get_application_id(6,3), 2, 'CLEARED', 'Selected');

CALL sp_schedule_interview(fn_get_application_id(9,4), 'ONLINE_TEST', LOCALTIMESTAMP - INTERVAL '13 days');
CALL sp_record_interview_result(fn_get_application_id(9,4), 1, 'CLEARED', 'Top aptitude score');
CALL sp_schedule_interview(fn_get_application_id(9,4), 'HR',        LOCALTIMESTAMP - INTERVAL '8 days');
CALL sp_record_interview_result(fn_get_application_id(9,4), 2, 'CLEARED', 'Selected');

CALL sp_schedule_interview(fn_get_application_id(7,5), 'TECHNICAL', LOCALTIMESTAMP - INTERVAL '11 days',
                           NULL, 'Block C, Room 204', 'Dr. Rao, Ms. Kulkarni', TIME '10:00');
CALL sp_record_interview_result(fn_get_application_id(7,5), 1, 'CLEARED', 'Great firmware fundamentals');

-- Final outcomes. SELECTED fires trg_applications_create_offer -> a PENDING offer per student.
UPDATE applications SET status = 'SELECTED'
WHERE (student_id, job_id) IN ((1,1),(2,2),(6,3),(9,4),(7,5));

UPDATE applications SET status = 'REJECTED'  WHERE (student_id, job_id) = (5,1);
UPDATE applications SET status = 'WITHDRAWN' WHERE (student_id, job_id) IN ((10,4),(1,6));

-- Offer letters: CTC breakdown (total = base + bonus + ESOP), then each student accepts.
-- Accepting creates the row in placements.
CALL sp_set_offer_breakdown(fn_get_offer_id(1,1),  9.00, 2.00, 1.00);   -- 12.00 LPA
CALL sp_set_offer_breakdown(fn_get_offer_id(2,2), 11.00, 3.00, 1.00);   -- 15.00 LPA

CALL sp_respond_to_offer(fn_get_offer_id(1,1), TRUE);
CALL sp_respond_to_offer(fn_get_offer_id(2,2), TRUE);
CALL sp_respond_to_offer(fn_get_offer_id(6,3), TRUE);
CALL sp_respond_to_offer(fn_get_offer_id(9,4), TRUE);
CALL sp_respond_to_offer(fn_get_offer_id(7,5), TRUE);

-- Left as-is on purpose for demos:
--   (2,1) INTERVIEW  -> selecting it raises the offer-policy error (student 2 already placed at a DREAM company, job 1 is CORE)
--   (2,3) SHORTLISTED at CloudNest (SUPER_DREAM) -> selecting + accepting it UPGRADES student 2's placement (dream-offer rule)
--   (8,5) SHORTLISTED, (12,1) APPLIED, (3,6) APPLIED

CALL sp_refresh_analytics();
ANALYZE;
