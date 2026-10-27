# PlaceTrack SQL (DBMS project scripts)

Database: `placetrack_db` · PostgreSQL 16 · pgAdmin host/port: `localhost:5433` (user `placetrack`)

## How the scripts are used

| Folder | When it runs | Purpose |
|---|---|---|
| `init/` | Automatically, once, when the db container starts with an **empty** volume (alphabetical order) | Builds the whole database: tables, views, functions, procedures, triggers, sample data |
| `demo/` | Manually in pgAdmin **Query Tool** (open file -> F5) | Everything you show your sir: DML, DQL, joins, aggregates, DCL, TCL, plans |
| `tests/` | Automated test suite / CI | `smoke_test.sql`: single idempotent script validating all constraints, procedures, and rules |

To rebuild from scratch: `docker compose down -v && docker compose up -d`.
To verify init worked: `docker compose logs db | tail -50`, or in pgAdmin run `SELECT COUNT(*) FROM placements;` (expect 5) and `SELECT COUNT(*) FROM offers;` (expect 5).
To run automated smoke test:
```bash
docker compose exec -T db psql -U placetrack -d placetrack_db -v ON_ERROR_STOP=1 < sql/tests/smoke_test.sql
```
*(Windows PowerShell: `Get-Content sql/tests/smoke_test.sql -Raw | docker compose exec -T db psql -U placetrack -d placetrack_db -v ON_ERROR_STOP=1`)*

**Running tips in pgAdmin:** select a block and press F5 to run only that block. Messages from `RAISE NOTICE` appear in the **Messages** tab. In `14_tcl.sql`, run each numbered section on its own so the transactions behave as described.


## File index

| File | Category | Contents |
|---|---|---|
| `init/01_ddl.sql` | **DDL** | CREATE TABLE with PK/FK/UNIQUE/CHECK/DEFAULT/NOT NULL, composite keys, indexes |
| `init/02_views.sql` | Views | 6 views + 1 materialized view |
| `init/03_functions.sql` | Functions | Eligibility engine + criteria-gap report, tier policy, match score, OTP, helpers |
| `init/04_procedures.sql` | Procedures | Apply, status, interviews, offers (accept/decline), bulk shortlist, verify CGPA, cursor report |
| `init/05_triggers.sql` | Triggers | Validation, tier policy, auto offer, audit log, notifications, email normalization |
| `init/06_seed.sql` | **DML** | Seed data through real triggers/procedures |
| `demo/07_ddl_demo.sql` | **DDL** | CREATE/ALTER/DROP/TRUNCATE/RENAME, sequence, CTAS, temp table |
| `demo/08_dml_demo.sql` | **DML** | INSERT/UPDATE/DELETE, upsert, RETURNING, cascade |
| `demo/09_dql_basic.sql` | **DQL** | SELECT, filters, CASE, string/date functions |
| `demo/10_dql_joins.sql` | **DQL** | INNER/LEFT/RIGHT/FULL/CROSS/SELF joins, anti-join |
| `demo/11_dql_aggregates.sql` | **DQL** | Aggregates, GROUP BY/HAVING, ROLLUP, FILTER, window functions |
| `demo/12_dql_subqueries_cte.sql` | **DQL** | Subqueries, EXISTS, ANY/ALL, CTE, recursive CTE, set operations |
| `demo/13_dcl.sql` | **DCL** | Roles, GRANT, REVOKE, column-level privileges |
| `demo/14_tcl.sql` | **TCL** | BEGIN/COMMIT/ROLLBACK, SAVEPOINT, isolation, locks, deadlock |
| `demo/15_procedures_triggers_demo.sql` | Procedures/Triggers | Calling everything + blocked-action demos |
| `demo/16_indexes_explain.sql` | Performance | Indexes, EXPLAIN ANALYZE |
| `demo/17_analytics_queries.sql` | Analytics | Dashboard queries used by the API |
| `demo/99_reset.sql` | Maintenance | Drop all objects |
| `tests/smoke_test.sql` | **Test Suite** | Single idempotent validation script for constraints, triggers, procedures, and rules |

## DBMS concept -> where to show it

| Concept | Where |
|---|---|
| Primary / Foreign / Composite keys | `01_ddl.sql` (`student_skills`, `job_skills`, `job_departments`) |
| UNIQUE, NOT NULL, CHECK, DEFAULT | `01_ddl.sql` |
| ON DELETE CASCADE / SET NULL | `01_ddl.sql`, `demo/08`, `demo/07` |
| 1:M and M:M relationships | `01_ddl.sql`, `docs/ER_DIAGRAM.md` |
| Normalization (3NF) | all tables; `placements.package` is a deliberate offer snapshot |
| DDL / DML / DQL / DCL / TCL | `07` / `08` / `09-12` / `13` / `14` |
| Joins (all types) | `demo/10` |
| Aggregate functions, GROUP BY, HAVING | `demo/11` |
| Window functions, ROLLUP, FILTER | `demo/11` |
| Subqueries, EXISTS, CTE, recursive CTE, set ops | `demo/12` |
| Views, materialized views | `02_views.sql` |
| User-defined functions | `03_functions.sql` |
| Stored procedures, cursor, exception handling | `04_procedures.sql` |
| Triggers (BEFORE / AFTER, row-level, WHEN) | `05_triggers.sql` |
| Transactions, savepoints, isolation, locking | `demo/14` |
| Indexes (B-tree, composite, partial, expression), EXPLAIN | `01_ddl.sql`, `demo/16` |
| Roles and privileges | `demo/13` |
| Data integrity enforcement | `demo/15` (blocked-action section), `tests/smoke_test.sql` |
| SECURITY DEFINER, row/column privileges | `04_procedures.sql` (`sp_respond_to_offer`), `demo/13` |
| pgcrypto (bcrypt hashing, OTP) | `01_ddl.sql`, `03_functions.sql`, `06_seed.sql` |
| Automated database test assertions | `tests/smoke_test.sql` |


## Schema changes vs the original DB_SCHEMA.md

| Change | Why |
|---|---|
| `users` (ADMIN / STAFF / STUDENT) | Auth needs a table; students can log in |
| `email_otps` + `fn_generate_otp` / `fn_verify_otp` | OTP signup and password reset (hash only, 10 min expiry, 5 attempts) |
| `students`: `active_backlogs`, `cgpa_verified`, `resume_url`, `photo_url` | Backlog rule, CDC verification, profile and ID card |
| `jobs`: `package_max`, `max_backlogs`, `drive_date`, status `ARCHIVED` | CTC range, backlog cutoff, drive date, archiving |
| `job_departments` | Department-restricted jobs (no rows = open to all) |
| `companies`: `tier` (CORE / DREAM / SUPER_DREAM), `logo_url` + `company_contacts` | Dream-offer policy, HR contacts |
| `interviews`: `meeting_link`, `venue`, `panelists`, `reporting_time`, round types CHECK | Round tracker details (Online Test, Technical, HR, Group Discussion) |
| `offers` (PENDING / ACCEPTED / DECLINED / LOCKED / SUPERSEDED) | Offer letters with base + bonus + ESOP, accept/decline |
| `placements` now = accepted offers only (`offer_id`, `application_id`) | Placed means the student accepted |
| `notifications` (written by triggers) | In-app notifications on status, interview and offer events |
| `application_status_history` | Audit trail written by a trigger |
| `fn_eligibility_check` | Rule-by-rule report: CGPA, backlogs, department, each skill level, tier policy |
| `fn_match_score` | 0-100 score: 60% skill coverage + 40% CGPA margin; jobs sorted by it |
| Single-offer and dream-offer policy (`fn_policy_allows`, `trg_applications_create_offer`, `sp_respond_to_offer`) | A placed student may only take a higher-tier offer; accepting upgrades the placement and supersedes the old offer |
| `sp_bulk_update_status` | Batch shortlisting in one atomic statement |
| `v_student_status`, `v_offer_overview` | Placed / In interview / Unplaced roster; offer letters |
| Application insert/status triggers | Closed job, deadline, eligibility, tier policy and legal transitions enforced inside the DB |

## Placement policy in one picture

```
Application SELECTED --trigger--> offer PENDING (blocked if student already holds same/higher tier)
Student ACCEPTS   --> placement row created (or UPGRADED), old accepted offer SUPERSEDED,
                      other pending offers of same/lower tier LOCKED, higher-tier pending offers stay open
Student DECLINES  --> offer DECLINED, student stays unplaced
```
