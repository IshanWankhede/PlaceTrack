-- =====================================================================
-- TCL DEMO | BEGIN, COMMIT, ROLLBACK, SAVEPOINT, atomicity, isolation, locking
-- pgAdmin tip: the Query Tool runs in auto-commit mode, but an explicit BEGIN keeps the
-- transaction open for that tab until COMMIT/ROLLBACK. Select a block and press F5 to run just it.
-- =====================================================================

-- 1) ROLLBACK: changes are visible inside the transaction, then undone --------
BEGIN;
UPDATE jobs SET package = package + 1 WHERE id = 1;
SELECT id, title, package AS package_inside_txn FROM jobs WHERE id = 1;
ROLLBACK;
SELECT id, title, package AS package_after_rollback FROM jobs WHERE id = 1;     -- back to 12.00

-- 2) COMMIT: changes become permanent -----------------------------------------
BEGIN;
INSERT INTO companies (name, industry) VALUES ('TCL Demo Inc', 'Demo');
COMMIT;
SELECT id, name FROM companies WHERE name LIKE 'TCL Demo%';

-- 3) SAVEPOINT: undo only part of a transaction ---------------------------------
BEGIN;
INSERT INTO companies (name) VALUES ('TCL Demo Two');
SAVEPOINT after_two;
INSERT INTO companies (name) VALUES ('TCL Demo Three');
SELECT name FROM companies WHERE name LIKE 'TCL Demo%' ORDER BY name;          -- Inc, Three, Two
ROLLBACK TO SAVEPOINT after_two;                                                -- drops only "Three"
SELECT name FROM companies WHERE name LIKE 'TCL Demo%' ORDER BY name;          -- Inc, Two
COMMIT;

DELETE FROM companies WHERE name LIKE 'TCL Demo%';                              -- cleanup

-- 4) ATOMICITY with triggers: the 2nd placement for a student fails, whole UPDATE rolls back
--    (student 2 is already placed at DataWave; application (2,1) is still INTERVIEW)
DO $$
BEGIN
    UPDATE applications SET status = 'SELECTED' WHERE student_id = 2 AND job_id = 1;
    RAISE NOTICE 'not reached';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Rolled back automatically -> %', SQLERRM;
END $$;
SELECT status FROM applications WHERE student_id = 2 AND job_id = 1;            -- still INTERVIEW

-- 5) Isolation levels --------------------------------------------------------------
SHOW default_transaction_isolation;                                             -- read committed
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SELECT COUNT(*) AS placements_seen FROM placements;
COMMIT;

BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SELECT SUM(package) FROM placements;
COMMIT;

-- 6) Row locking (open TWO Query Tool tabs to see it) ---------------------------------
-- Tab A:  BEGIN;  SELECT * FROM applications WHERE id = 1 FOR UPDATE;      -- keep it open
-- Tab B:  UPDATE applications SET status = status WHERE id = 1;             -- waits for Tab A
-- Tab A:  COMMIT;                                                           -- Tab B continues
-- Skip locked rows (job-queue style):
--         SELECT * FROM applications WHERE status = 'APPLIED' FOR UPDATE SKIP LOCKED;

-- 7) Table lock (released at COMMIT) ----------------------------------------------------
BEGIN;
LOCK TABLE placements IN SHARE MODE;
SELECT COUNT(*) FROM placements;
COMMIT;

-- 8) Deadlock explanation (two tabs, opposite update order -> PostgreSQL aborts one):
-- Tab A: BEGIN; UPDATE jobs SET package = package WHERE id = 1;
-- Tab B: BEGIN; UPDATE jobs SET package = package WHERE id = 2;
-- Tab A: UPDATE jobs SET package = package WHERE id = 2;    -- waits
-- Tab B: UPDATE jobs SET package = package WHERE id = 1;    -- ERROR: deadlock detected
