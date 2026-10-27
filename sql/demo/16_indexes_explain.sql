-- =====================================================================
-- INDEXES & QUERY PLANS | EXPLAIN, EXPLAIN ANALYZE, index types
-- With tiny demo data PostgreSQL prefers sequential scans; we disable them to show index plans.
-- =====================================================================

-- Existing indexes
SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;

-- Plan for a filtered query
EXPLAIN SELECT * FROM applications WHERE status = 'SELECTED';
EXPLAIN ANALYZE SELECT * FROM applications WHERE status = 'SELECTED';

-- Force the planner to use an index and compare
SET enable_seqscan = off;
EXPLAIN ANALYZE SELECT * FROM applications WHERE status = 'SELECTED';
EXPLAIN ANALYZE SELECT * FROM students WHERE department_id = 1;
RESET enable_seqscan;

-- Join plan
EXPLAIN ANALYZE
SELECT s.name, c.name, p.package
FROM placements p JOIN students s ON s.id = p.student_id JOIN companies c ON c.id = p.company_id;

-- Composite, partial and expression indexes
CREATE INDEX IF NOT EXISTS idx_demo_apps_student_status ON applications (student_id, status);
CREATE INDEX IF NOT EXISTS idx_demo_open_jobs ON jobs (minimum_cgpa) WHERE status = 'OPEN';       -- partial
CREATE INDEX IF NOT EXISTS idx_demo_students_lower_name ON students (LOWER(name));                -- expression
SELECT indexname, indexdef FROM pg_indexes WHERE indexname LIKE 'idx_demo_%';

SET enable_seqscan = off;
EXPLAIN SELECT * FROM students WHERE LOWER(name) = 'aarav sharma';
RESET enable_seqscan;

-- Table / index size
SELECT relname AS table_name, pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_catalog.pg_statio_user_tables ORDER BY pg_total_relation_size(relid) DESC;

-- Cleanup demo indexes
DROP INDEX IF EXISTS idx_demo_apps_student_status;
DROP INDEX IF EXISTS idx_demo_open_jobs;
DROP INDEX IF EXISTS idx_demo_students_lower_name;
