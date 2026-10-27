"""
Phase 3 acceptance tests:
  - Company CRUD and HR contact management
  - Job CRUD with atomic skill / department replacement
  - Eligibility acceptance: seeded data (job 1 / job 2)
  - Criteria-gap endpoint
  - Tier-policy enforcement (Diya placed at DREAM, fails CORE)
  - Skill-level rejection (Aarav on job 2 needs ADVANCED Python; has ADVANCED)
  - Department restriction (ENTC student on job 1: CE/IT only)
  - Backlog rule (Rohan has 1 backlog; job 1 allows 0)
  - Close-expired jobs
  - 401 / 403 behaviour
"""
import pytest
from fastapi.testclient import TestClient


# ─── Helpers ────────────────────────────────────────────────────────────────

def _login(client, email, password="Student@123"):
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, res.text
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


# ─── Company CRUD ────────────────────────────────────────────────────────────

class TestCompanyCRUD:
    def test_list_companies_authenticated(self, client, staff_headers):
        res = client.get("/api/v1/companies", headers=staff_headers)
        assert res.status_code == 200
        body = res.json()
        assert "items" in body
        assert body["total"] >= 5  # 5 seeded

    def test_list_companies_unauthenticated(self, client):
        res = client.get("/api/v1/companies")
        assert res.status_code == 401

    def test_create_company_admin(self, client, admin_headers):
        res = client.post(
            "/api/v1/companies",
            json={"name": "TestCo Phase3", "tier": "CORE"},
            headers=admin_headers,
        )
        assert res.status_code == 201
        body = res.json()
        assert body["name"] == "TestCo Phase3"
        assert body["id"] > 0

    def test_create_company_student_forbidden(self, client, student_headers):
        res = client.post(
            "/api/v1/companies",
            json={"name": "Should Fail", "tier": "CORE"},
            headers=student_headers,
        )
        assert res.status_code == 403

    def test_create_company_unauthenticated(self, client):
        res = client.post("/api/v1/companies", json={"name": "X", "tier": "CORE"})
        assert res.status_code == 401

    def test_duplicate_company_name_409(self, client, admin_headers):
        # TechNova Solutions is already seeded
        res = client.post(
            "/api/v1/companies",
            json={"name": "TechNova Solutions", "tier": "CORE"},
            headers=admin_headers,
        )
        assert res.status_code == 409

    def test_get_company(self, client, staff_headers):
        res = client.get("/api/v1/companies/1", headers=staff_headers)
        assert res.status_code == 200
        assert res.json()["name"] == "TechNova Solutions"

    def test_get_company_not_found(self, client, staff_headers):
        res = client.get("/api/v1/companies/99999", headers=staff_headers)
        assert res.status_code == 404

    def test_update_company(self, client, admin_headers):
        res = client.put(
            "/api/v1/companies/1",
            json={"location": "Pune Updated"},
            headers=admin_headers,
        )
        assert res.status_code == 200
        assert res.json()["location"] == "Pune Updated"
        # Restore
        client.put("/api/v1/companies/1", json={"location": "Pune"}, headers=admin_headers)

    def test_invalid_tier(self, client, admin_headers):
        res = client.post(
            "/api/v1/companies",
            json={"name": "BadTierCo", "tier": "PLATINUM"},
            headers=admin_headers,
        )
        assert res.status_code == 422


# ─── HR Contacts ─────────────────────────────────────────────────────────────

class TestHRContacts:
    def test_list_contacts(self, client, staff_headers):
        res = client.get("/api/v1/companies/2/contacts", headers=staff_headers)
        assert res.status_code == 200
        assert len(res.json()) >= 2  # 2 seeded for company 2

    def test_create_and_delete_contact(self, client, admin_headers):
        res = client.post(
            "/api/v1/companies/1/contacts",
            json={"name": "Test HR", "email": "hr@test.com"},
            headers=admin_headers,
        )
        assert res.status_code == 201
        cid = res.json()["id"]

        # Update it
        up = client.put(
            f"/api/v1/companies/1/contacts/{cid}",
            json={"designation": "VP HR"},
            headers=admin_headers,
        )
        assert up.status_code == 200
        assert up.json()["designation"] == "VP HR"

        # Delete
        del_res = client.delete(f"/api/v1/companies/1/contacts/{cid}", headers=admin_headers)
        assert del_res.status_code == 204

    def test_contact_wrong_company_404(self, client, admin_headers):
        # Contact 1 belongs to company 1; accessing via company 2 -> 404
        res = client.put(
            "/api/v1/companies/2/contacts/1",
            json={"name": "X"},
            headers=admin_headers,
        )
        assert res.status_code == 404


# ─── Job CRUD ─────────────────────────────────────────────────────────────────

class TestJobCRUD:
    def test_list_jobs(self, client, student_headers):
        res = client.get("/api/v1/jobs", headers=student_headers)
        assert res.status_code == 200
        body = res.json()
        assert body["total"] >= 7  # 7 seeded

    def test_get_job_1(self, client, staff_headers):
        res = client.get("/api/v1/jobs/1", headers=staff_headers)
        assert res.status_code == 200
        j = res.json()
        assert j["title"] == "Software Engineer"
        assert j["company_name"] == "TechNova Solutions"
        assert len(j["skills"]) == 3  # Python, SQL, Git
        assert len(j["departments"]) == 2  # CE, IT

    def test_filter_by_status(self, client, staff_headers):
        res = client.get("/api/v1/jobs?status=CLOSED", headers=staff_headers)
        assert res.status_code == 200
        items = res.json()["items"]
        assert all(j["status"] == "CLOSED" for j in items)

    def test_filter_by_min_cgpa(self, client, staff_headers):
        # min_cgpa=8.5 means: jobs whose minimum_cgpa <= 8.5
        res = client.get("/api/v1/jobs?min_cgpa=8.5", headers=staff_headers)
        items = res.json()["items"]
        for j in items:
            assert float(j["minimum_cgpa"]) <= 8.5

    def test_create_job_with_skills_and_departments(self, client, admin_headers):
        res = client.post(
            "/api/v1/jobs",
            json={
                "company_id": 1,
                "title": "Test Role",
                "minimum_cgpa": "7.5",
                "max_backlogs": 1,
                "job_type": "FULL_TIME",
                "status": "OPEN",
                "skills": [
                    {"skill_id": 1, "required_level": "INTERMEDIATE"},  # Python
                    {"skill_id": 2, "required_level": "BEGINNER"},      # SQL
                ],
                "department_ids": [1, 2],  # CE, IT
            },
            headers=admin_headers,
        )
        assert res.status_code == 201
        j = res.json()
        assert j["title"] == "Test Role"
        assert len(j["skills"]) == 2
        assert j["id"] > 0

    def test_atomic_skill_replace(self, client, admin_headers):
        """Creating a job then replacing skills atomically."""
        # Create
        res = client.post(
            "/api/v1/jobs",
            json={
                "company_id": 1,
                "title": "Skill Replace Test",
                "minimum_cgpa": "7.0",
                "skills": [{"skill_id": 1, "required_level": "BEGINNER"}],
                "department_ids": [],
            },
            headers=admin_headers,
        )
        assert res.status_code == 201
        job_id = res.json()["id"]

        # Replace skills with completely different set
        res = client.put(
            f"/api/v1/jobs/{job_id}",
            json={
                "skills": [
                    {"skill_id": 3, "required_level": "INTERMEDIATE"},  # Git
                    {"skill_id": 4, "required_level": "ADVANCED"},      # Java
                ]
            },
            headers=admin_headers,
        )
        assert res.status_code == 200
        skills = res.json()["skills"]
        skill_ids = {s["skill_id"] for s in skills}
        assert skill_ids == {3, 4}
        assert 1 not in skill_ids  # Python was removed

    def test_archive_job(self, client, admin_headers):
        # Use job 6 (Software Intern PPO, OPEN)
        res = client.patch("/api/v1/jobs/6/archive", headers=admin_headers)
        assert res.status_code == 200
        assert res.json()["status"] == "ARCHIVED"

    def test_job_not_found(self, client, staff_headers):
        res = client.get("/api/v1/jobs/99999", headers=staff_headers)
        assert res.status_code == 404

    def test_create_job_student_forbidden(self, client, student_headers):
        res = client.post(
            "/api/v1/jobs",
            json={"company_id": 1, "title": "X", "minimum_cgpa": "7.0"},
            headers=student_headers,
        )
        assert res.status_code == 403


# ─── Eligibility Acceptance Tests (Job 1: TechNova Software Engineer) ─────────
# Job 1: min_cgpa=8.0, max_backlogs=0, departments=[CE, IT]
# Skills: Python(INTERMEDIATE), SQL(INTERMEDIATE), Git(BEGINNER)
#
# Expected eligible_students result (fn_eligible_students(1)):
#   student 1 (Aarav, CE, 8.70, Python ADVANCED >=INT, SQL INT >=INT, Git INT >=BEG)  -> eligible
#   student 2 (Diya,  CE, 9.10, ...)                                                  -> eligible, policy_ok=FALSE (placed at DREAM)
#   student 5 (Kabir, IT, 8.00, exactly 8.0, Git INT >=BEG, SQL INT >=INT, Python INT >=INT) -> eligible
#   student 12 (Priya, CE, 8.40, Git INT >=BEG, SQL INT >=INT, Python INT >=INT)       -> eligible
#   student 3 (Rohan, CE, 7.90) -> NOT eligible (cgpa < 8.0, has 1 backlog)

class TestEligibilityJob1:
    def test_eligible_students_job1(self, client, staff_headers):
        res = client.get("/api/v1/jobs/1/eligible-students", headers=staff_headers)
        assert res.status_code == 200
        items = res.json()
        student_ids = {s["student_id"] for s in items}
        # Must contain 1, 2, 5, 12
        assert {1, 2, 5, 12}.issubset(student_ids), f"Missing students: {student_ids}"
        # Rohan (3) must NOT be eligible
        assert 3 not in student_ids

    def test_diya_policy_false_on_job1(self, client, staff_headers):
        """Diya (student 2) is placed at DataWave (DREAM); job 1 is CORE -> policy_ok=False."""
        res = client.get("/api/v1/jobs/1/eligible-students", headers=staff_headers)
        assert res.status_code == 200
        diya = next((s for s in res.json() if s["student_id"] == 2), None)
        assert diya is not None
        assert diya["policy_ok"] is False

    def test_aarav_policy_true_on_job1(self, client, staff_headers):
        """Aarav (student 1) is placed at TechNova (CORE); job 1 is CORE -> policy_ok=False (same tier)."""
        res = client.get("/api/v1/jobs/1/eligible-students", headers=staff_headers)
        assert res.status_code == 200
        aarav = next((s for s in res.json() if s["student_id"] == 1), None)
        assert aarav is not None
        # Aarav is placed at CORE (TechNova), job 1 is CORE -> same tier -> policy_ok=False
        assert aarav["policy_ok"] is False

    def test_kabir_exactly_8_eligible(self, client, staff_headers):
        """Kabir (student 5, IT, 8.00) exactly meets minimum_cgpa 8.0."""
        res = client.get("/api/v1/jobs/1/eligible-students", headers=staff_headers)
        assert res.status_code == 200
        kabir = next((s for s in res.json() if s["student_id"] == 5), None)
        assert kabir is not None, "Kabir should be eligible (exactly 8.0)"

    def test_rohan_not_eligible_job1(self, client, staff_headers):
        """Rohan (student 3, CE, 7.90, 1 backlog) fails both CGPA and backlogs for job 1."""
        res = client.get("/api/v1/jobs/1/eligible-students", headers=staff_headers)
        assert res.status_code == 200
        ids = {s["student_id"] for s in res.json()}
        assert 3 not in ids


# ─── Eligibility Acceptance Tests (Job 2: DataWave Data Analyst) ──────────────
# Job 2: min_cgpa=8.5, max_backlogs=0, departments=[] (all)
# Skills: Python(ADVANCED), SQL(ADVANCED)
# Expected: student 2 (Diya, Python EXPERT, SQL ADVANCED), student 4 (Sneha, Python ADVANCED, SQL ADVANCED)

class TestEligibilityJob2:
    def test_eligible_students_job2(self, client, staff_headers):
        res = client.get("/api/v1/jobs/2/eligible-students", headers=staff_headers)
        assert res.status_code == 200
        items = res.json()
        student_ids = {s["student_id"] for s in items}
        assert 2 in student_ids, f"Diya should be eligible for job 2, got {student_ids}"
        assert 4 in student_ids, f"Sneha should be eligible for job 2, got {student_ids}"

    def test_aarav_not_eligible_job2_skill_level(self, client, staff_headers):
        """Aarav (student 1): Python ADVANCED meets requirement, SQL INTERMEDIATE < ADVANCED -> fails."""
        res = client.get("/api/v1/jobs/2/eligible-students", headers=staff_headers)
        ids = {s["student_id"] for s in res.json()}
        assert 1 not in ids, "Aarav should NOT be eligible for job 2 (SQL level too low)"


# ─── Department Restriction ───────────────────────────────────────────────────

class TestDepartmentRestriction:
    def test_entc_student_not_eligible_job1(self, client, staff_headers):
        """Job 1 is CE/IT only. Vikram (student 7, ENTC, 7.50 < 8.0) must not appear."""
        res = client.get("/api/v1/jobs/1/eligible-students", headers=staff_headers)
        ids = {s["student_id"] for s in res.json()}
        assert 7 not in ids  # Vikram: ENTC AND cgpa 7.5 < 8.0

    def test_eligibility_check_entc_on_job1(self, client, staff_headers):
        """fn_eligibility_check for Vikram on job 1 should show Department = FAILED."""
        res = client.get(
            "/api/v1/jobs/1/eligibility",
            params={"student_id": 7},
            headers=staff_headers,
        )
        assert res.status_code == 200
        body = res.json()
        dept_row = next(
            (r for r in body["criteria"] if r["rule"] == "Department"), None
        )
        assert dept_row is not None
        assert dept_row["passed"] is False
        assert body["eligible"] is False


# ─── Criteria Gap Endpoint ────────────────────────────────────────────────────

class TestCriteriaGap:
    def test_criteria_gap_aarav_job1(self, client, staff_headers):
        """Aarav (student 1) is eligible for job 1; all ACADEMIC rows should pass."""
        res = client.get(
            "/api/v1/jobs/1/eligibility",
            params={"student_id": 1},
            headers=staff_headers,
        )
        assert res.status_code == 200
        body = res.json()
        assert body["student_id"] == 1
        assert body["job_id"] == 1
        assert body["eligible"] is True
        # Each criteria row should have category, rule, required, actual, passed
        for row in body["criteria"]:
            assert "category" in row
            assert "rule" in row
            assert "required" in row
            assert "actual" in row
            assert "passed" in row

    def test_criteria_gap_rohan_job1(self, client, staff_headers):
        """Rohan (student 3): 7.90 CGPA fails, 1 backlog fails -> eligible=False."""
        res = client.get(
            "/api/v1/jobs/1/eligibility",
            params={"student_id": 3},
            headers=staff_headers,
        )
        assert res.status_code == 200
        body = res.json()
        assert body["eligible"] is False
        cgpa_row = next((r for r in body["criteria"] if r["rule"] == "CGPA"), None)
        assert cgpa_row is not None
        assert cgpa_row["passed"] is False
        backlog_row = next((r for r in body["criteria"] if "backlog" in r["rule"].lower()), None)
        assert backlog_row is not None
        assert backlog_row["passed"] is False

    def test_criteria_gap_student_can_check_own(self, client, student_headers):
        """Aarav (student 1) checks own eligibility for job 1 -> allowed."""
        res = client.get(
            "/api/v1/jobs/1/eligibility",
            params={"student_id": 1},
            headers=student_headers,
        )
        assert res.status_code == 200

    def test_criteria_gap_student_cannot_check_other(self, client, student_headers):
        """Aarav (student 1) checks Diya's (student 2) eligibility -> 403."""
        res = client.get(
            "/api/v1/jobs/1/eligibility",
            params={"student_id": 2},
            headers=student_headers,
        )
        assert res.status_code == 403


# ─── Tier Policy (Diya placed at DREAM, fn_eligible_jobs excludes CORE) ───────

class TestTierPolicy:
    def test_diya_eligible_jobs_excludes_core(self, client, staff_headers):
        """
        Diya (student 2) is placed at DataWave (DREAM).
        fn_eligible_jobs filters by policy_allows -> no CORE jobs should appear.
        """
        res = client.get("/api/v1/students/2/eligible-jobs", headers=staff_headers)
        assert res.status_code == 200
        jobs = res.json()
        tiers = [j["tier"] for j in jobs]
        assert "CORE" not in tiers, f"Diya should not see CORE jobs, got tiers: {tiers}"

    def test_diya_policy_false_job1_eligibility(self, client, staff_headers):
        """Diya's criteria-gap for job 1 should show policy_ok = False."""
        res = client.get(
            "/api/v1/jobs/1/eligibility",
            params={"student_id": 2},
            headers=staff_headers,
        )
        assert res.status_code == 200
        body = res.json()
        assert body["policy_ok"] is False
        policy_row = next((r for r in body["criteria"] if r["category"] == "POLICY"), None)
        assert policy_row is not None
        assert policy_row["passed"] is False


# ─── Eligible Jobs for Student ────────────────────────────────────────────────

class TestEligibleJobs:
    def test_eligible_jobs_admin_can_query_any(self, client, admin_headers):
        res = client.get("/api/v1/students/5/eligible-jobs", headers=admin_headers)
        assert res.status_code == 200

    def test_eligible_jobs_student_own(self, client, student_headers):
        """Aarav (student 1) can query their own eligible jobs."""
        res = client.get("/api/v1/students/1/eligible-jobs", headers=student_headers)
        assert res.status_code == 200

    def test_eligible_jobs_student_cannot_query_other(self, client, student_headers):
        """Aarav (student 1) trying to view Diya's (student 2) eligible jobs -> 403."""
        res = client.get("/api/v1/students/2/eligible-jobs", headers=student_headers)
        assert res.status_code == 403

    def test_eligible_jobs_has_match_score(self, client, admin_headers):
        res = client.get("/api/v1/students/1/eligible-jobs", headers=admin_headers)
        assert res.status_code == 200
        for j in res.json():
            assert "match_score" in j
            assert j["match_score"] >= 0


# ─── Close Expired Jobs ───────────────────────────────────────────────────────

class TestCloseExpiredJobs:
    def test_close_expired_admin_only(self, client, staff_headers):
        res = client.post("/api/v1/jobs/close-expired", headers=staff_headers)
        assert res.status_code == 403

    def test_close_expired_student_forbidden(self, client, student_headers):
        res = client.post("/api/v1/jobs/close-expired", headers=student_headers)
        assert res.status_code == 403

    def test_close_expired_returns_count(self, client, admin_headers):
        res = client.post("/api/v1/jobs/close-expired", headers=admin_headers)
        assert res.status_code == 200
        assert "closed" in res.json()
        # Running again should return 0
        res2 = client.post("/api/v1/jobs/close-expired", headers=admin_headers)
        assert res2.json()["closed"] == 0


# ─── Company History ──────────────────────────────────────────────────────────

class TestCompanyHistory:
    def test_company1_history(self, client, staff_headers):
        """TechNova (company 1) has Aarav placed there."""
        res = client.get("/api/v1/companies/1/history", headers=staff_headers)
        assert res.status_code == 200
        body = res.json()
        assert body["company_id"] == 1
        assert body["total_recruited"] >= 1

    def test_company_history_not_found(self, client, staff_headers):
        res = client.get("/api/v1/companies/99999/history", headers=staff_headers)
        assert res.status_code == 404


# ─── 401 / 403 behaviour ─────────────────────────────────────────────────────

class TestAuthBehavior:
    def test_no_token_401(self, client):
        for url in ["/api/v1/jobs", "/api/v1/companies", "/api/v1/students"]:
            res = client.get(url)
            assert res.status_code == 401, f"Expected 401 for {url}"

    def test_invalid_token_401(self, client):
        headers = {"Authorization": "Bearer invalid.token.here"}
        res = client.get("/api/v1/jobs", headers=headers)
        assert res.status_code == 401

    def test_student_cannot_write_jobs(self, client, student_headers):
        res = client.post(
            "/api/v1/jobs",
            json={"company_id": 1, "title": "X", "minimum_cgpa": "7.0"},
            headers=student_headers,
        )
        assert res.status_code == 403

    def test_student_cannot_write_companies(self, client, student_headers):
        res = client.post(
            "/api/v1/companies",
            json={"name": "X", "tier": "CORE"},
            headers=student_headers,
        )
        assert res.status_code == 403

    def test_student_can_read_jobs(self, client, student_headers):
        res = client.get("/api/v1/jobs", headers=student_headers)
        assert res.status_code == 200

    def test_student_can_read_companies(self, client, student_headers):
        res = client.get("/api/v1/companies", headers=student_headers)
        assert res.status_code == 200

    def test_eligible_students_student_forbidden(self, client, student_headers):
        res = client.get("/api/v1/jobs/1/eligible-students", headers=student_headers)
        assert res.status_code == 403
