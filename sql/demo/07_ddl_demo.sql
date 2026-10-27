-- =====================================================================
-- DDL DEMO | CREATE / ALTER / DROP / TRUNCATE / comments / sequences
-- Uses a scratch table so real data is untouched. Safe to re-run.
-- (The real schema DDL is in sql/init/01_ddl.sql)
-- =====================================================================

DROP TABLE IF EXISTS demo_scratch;
DROP SEQUENCE IF EXISTS demo_seq;

-- CREATE TABLE with PK, NOT NULL, UNIQUE, DEFAULT, CHECK, FK
CREATE TABLE demo_scratch (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(50)  NOT NULL UNIQUE,
    score       INTEGER      NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
    dept_id     INTEGER      REFERENCES departments(id) ON DELETE SET NULL,
    created_at  TIMESTAMP    DEFAULT NOW()
);

-- ALTER TABLE: add / modify / rename / drop column, add / drop constraint
ALTER TABLE demo_scratch ADD COLUMN notes TEXT;
ALTER TABLE demo_scratch ALTER COLUMN title TYPE VARCHAR(200);
ALTER TABLE demo_scratch ALTER COLUMN score SET DEFAULT 10;
ALTER TABLE demo_scratch RENAME COLUMN notes TO remarks;
ALTER TABLE demo_scratch ADD CONSTRAINT chk_title_len CHECK (char_length(title) >= 3);
ALTER TABLE demo_scratch DROP CONSTRAINT chk_title_len;
ALTER TABLE demo_scratch DROP COLUMN remarks;
ALTER TABLE demo_scratch RENAME TO demo_scratch_renamed;
ALTER TABLE demo_scratch_renamed RENAME TO demo_scratch;

-- Describe structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'demo_scratch'
ORDER BY ordinal_position;

-- Index, sequence, comment
CREATE INDEX idx_demo_scratch_score ON demo_scratch(score);
CREATE SEQUENCE demo_seq START 100 INCREMENT 5;
SELECT nextval('demo_seq'), nextval('demo_seq');
COMMENT ON TABLE demo_scratch IS 'Scratch table used in DDL demo';

-- CREATE TABLE AS (CTAS) and TEMP table
CREATE TEMP TABLE temp_top_students AS
SELECT id, name, cgpa FROM students WHERE cgpa >= 8.5;
SELECT * FROM temp_top_students;

-- TRUNCATE vs DROP
INSERT INTO demo_scratch (title) VALUES ('alpha'), ('beta');
TRUNCATE TABLE demo_scratch RESTART IDENTITY;      -- removes all rows, resets SERIAL
SELECT COUNT(*) AS rows_after_truncate FROM demo_scratch;

DROP TABLE demo_scratch;
DROP SEQUENCE demo_seq;
DROP TABLE temp_top_students;

-- ALTER on a real table (added then removed again)
ALTER TABLE students ADD COLUMN linkedin_url VARCHAR(255);
ALTER TABLE students DROP COLUMN linkedin_url;
