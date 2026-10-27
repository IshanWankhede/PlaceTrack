# Testing

## 1. Tests actually executed during this documentation review

**None.** The review environment had no network (so no `npm install`, no Docker pull) and no PostgreSQL. What *was* done is static analysis:

| Check | Result |
|---|---|
| Every relative import in `prototype/src` resolves to a file | Pass (scripted) |
| Every `mockApi.<method>` called from UI code exists in `mockApi.js` | Pass (scripted); 4 methods are never called |
| Every named import from `mockApi`, `eligibility`, `interactionHelpers`, `AuthContext`, `ToastContext` is exported | Pass (scripted) |
| Backend Python compiles (`python -m compileall backend`) | Pass |
| `docker-compose.yml` parses as YAML | Pass |
| SQL files: balanced parentheses, quotes and `$$` | Pass (text check only; this is **not** a syntax validation) |
| Mock seed data loads in Node (`node` import of `mockApi.js`) and has the documented counts | Pass |
| Mermaid diagrams rendered | **Not done** (no renderer available) |
| Production build, lint, browser run | **Not done** |

## 2. Existing test suites

| Suite | Location | Content | Executed? |
|---|---|---|---|
| Backend pytest | `backend/tests/test_health.py` | `GET /health`, `GET /api/v1/health` | No |
| Prototype | none | no test runner or tests in `prototype/package.json` | n/a |
| SQL | none yet | smoke test script is planned in `PHASES.md` Phase 1 | n/a |

## 3. Commands to run (recommended, to be executed by you)

```bash
# Backend tests inside the container
docker compose up -d --build
docker compose exec backend pytest -q

# Database: confirm init scripts ran without errors
docker compose logs db | tail -80
docker compose exec db psql -U placetrack -d placetrack_db -c "\dt"          # expect 17 tables
docker compose exec db psql -U placetrack -d placetrack_db -c "SELECT COUNT(*) FROM placements;"   # expect 5
curl http://localhost:8000/api/v1/health/db                                   # public_tables should be 17

# Prototype (standalone)
cd prototype && npm install && npm run build      # compile check
npm run dev                                       # http://localhost:3000
```

Note: the prototype's `lint` script runs `tsc --noEmit` and has no TypeScript sources; `clean` points at a missing file (KI-014).

## 4. Manual smoke tests for the prototype

1. Open `/`; the landing page loads without console errors.
2. `/login`: sign in as each demo account (ADMIN Ishan Wankhede, STAFF Raghav Menon, STUDENT Rohit Verma).
3. Switch identity with the header selector; confirm the sidebar, overview, profile name and notification count change each time.
4. As STUDENT open `/dashboard/user-management`: expect the restricted panel.
5. As STAFF open `/dashboard/analytics` and `/dashboard/policies`: expect the restricted panel.
6. Job drives (STUDENT): an eligible drive enables Apply; an ineligible one shows failed rules.
7. Apply, then as STAFF move the application through statuses; confirm the student receives a notification and not the admin.
8. Schedule an interview; as STUDENT confirm the meeting link button opens only for a valid link.
9. Select a candidate, release an offer, accept it as the student; confirm the tier policy message when a lower-tier offer is accepted after a higher one.
10. Open the notification popover at narrow and wide widths: it stays inside the viewport, scrolls internally, closes on Escape and outside click.
11. Toasts appear bottom-right on every page and do not shift layout.
12. Demo Inbox: open, pick a contact, send a message, confirm the preview and ordering update; confirm there is no purple styling and no "SIMULATED FRONTEND ONLY" badge; Send button icon and label are on one line.
13. Reload the page: session and data persist; Settings > Reset demo data restores the seed.

## 5. Recommended automated tests (not written)

| Level | What |
|---|---|
| Unit (prototype) | `eligibility.js`: boundary CGPA, missing skill, skill level too low, backlog limit, unverified CGPA; `getValidApplicationTransitions` |
| Component | `RoleProtectedRoute` for each role and route |
| Service | `mockApi`: duplicate application, notification recipient filtering, offer tier policy, message participant rules |
| Backend | auth, role guards, each endpoint once it exists |
| Database | `sql/tests/smoke_test.sql` covering seed counts, eligibility cases from [PRD.md](./PRD.md) section 11, each trigger guard, offer accept/upgrade/decline, OTP expiry and reuse |
| Integration | frontend against the real API after each stage in [INTEGRATION_PLAN.md](./INTEGRATION_PLAN.md) |
| Responsive | viewports 768, 1024, 1440 for sidebar, popover, toast, inbox |

## 6. Coverage limitations

No automated coverage exists for any business feature; all prototype behaviour is verified only by reading code. See KI-020 and KI-022 in [KNOWN_ISSUES.md](./KNOWN_ISSUES.md).
