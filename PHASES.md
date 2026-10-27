# PlaceTrack: Phases and Real Progress

Status words follow [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md). A phase is **not** marked complete because a page or file exists: nothing below is "verified by execution" yet, because no build, test or database run has been performed in review.

## Ground rules

1. The prototype stays separate from the backend until its behaviour is reviewed and approved; integration follows [docs/INTEGRATION_PLAN.md](docs/INTEGRATION_PLAN.md).
2. PostgreSQL is the source of truth for eligibility, status transitions, tier policy and offers; the API only calls it.
3. Never commit `.env`. Document variables in `.env.example` only.
4. Commit messages follow Conventional Commits.

## Progress overview

| Phase | Scope | State |
|---|---|---|
| 0 | Monorepo, Docker Compose, env template, health endpoints, skeleton frontend | Written, not executed |
| P (parallel) | Frontend prototype: landing, auth, 20 dashboard routes on mock data | Implemented (static review), simulated |
| 1 | SQL schema, views, functions, procedures, triggers, seed, demo scripts | Written, not executed |
| 2 to 5 | Backend: models, auth, CRUD, eligibility, applications, offers, analytics APIs | **Not started** (folders exist, empty) |
| 6 to 8 | Frontend integration | **Not started** (prototype built independently) |
| 9 | Hardening, tests, demo script | Not started |
| Docs | Documentation reconstruction from real code | Done (this repository state) |

## Phase 0: Setup and Docker (written, not executed)

Deliverables: `docker-compose.yml`, Dockerfiles, `.env.example`, FastAPI health router, Docker skeleton frontend, pgAdmin registration, Mailpit service. Exit criteria not yet met: stack starts cleanly, `/api/v1/health/db` reports 17 tables, hot reload works.

Commit: `chore: initialize PlaceTrack monorepo with Docker hot-reload setup`

## Phase P: Frontend prototype (done as a simulation)

Delivered in `prototype/`: landing page, auth, role dashboards, notifications, Demo Inbox, offers with tier policy, analytics, policies. Open items before it can be called a finished front end: fix the issues KI-003 to KI-006, KI-012 to KI-017, KI-023; decide the vocabulary (KI-007); add tests.

Commit (when adopted): `feat(prototype): add AI Studio frontend prototype with mock services`

## Phase 1: Database layer (written, not executed)

Exit criteria not yet met: fresh `docker compose down -v && up -d` runs all init scripts without error; every `sql/demo` script runs; a `sql/tests/smoke_test.sql` passes; schema gaps vs prototype resolved in [docs/DB_SCHEMA.md](docs/DB_SCHEMA.md).

Commit: `feat(db): add schema, views, functions, procedures, triggers and seed data`

## Phase 2: Backend foundation

ORM models for the 17 tables (map only, no `create_all`), JWT auth with roles, OTP signup, departments, skills, students CRUD, error mapping. Depends on integration stage 2 and 4.

Commit: `feat(backend): add ORM models, JWT auth with roles and core CRUD APIs`

## Phase 3: Companies, jobs, eligibility API

Company and job CRUD, `fn_*` eligibility endpoints, criteria-gap endpoint.

Commit: `feat(backend): add companies, jobs and eligibility endpoints`

## Phase 4: Applications and interviews API

Apply, status, bulk, withdraw, history, interviews, notifications.

Commit: `feat(backend): add application workflow and interview tracking APIs`

## Phase 5: Offers, placements, analytics API

Offers (accept/decline with tier policy), placements, analytics, exports.

Commit: `feat(backend): add offers, placements and analytics endpoints`

## Phase 6: Integrate prototype auth and shell

Swap the prototype's login, `AuthContext` and route guards to the real API; remove the demo selector from production builds (stages 4 and 5).

Commit: `feat(frontend): connect prototype authentication to the FastAPI backend`

## Phase 7: Integrate feature pages

Replace mock reads and writes page by page (stages 6 to 11), keeping the approved UI.

Commit: `feat(frontend): replace mock services with API calls for students, jobs, applications, offers`

## Phase 8: Analytics and notifications integration

Commit: `feat(frontend): wire analytics dashboards and notifications to live data`

## Phase 9: Stabilization

Test suite, security review, remove mock-only code, demo walkthrough, optional production compose file.

Commit: `chore: harden, test and document PlaceTrack for release`

## Future enhancements (not scheduled)

Messaging tables, resume/scorecard storage, e-mail notifications, certificate PDFs, multi-institution support.
