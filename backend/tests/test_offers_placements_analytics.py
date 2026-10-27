from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.models.offer import Offer
from app.models.placement import Placement


class TestOffersAndBreakdown:
    def test_list_offers_admin(self, client: TestClient, admin_headers: dict[str, str]):
        res = client.get("/api/v1/offers", headers=admin_headers)
        assert res.status_code == 200, res.text
        offers = res.json()
        assert len(offers) >= 5
        for o in offers:
            assert "offer_id" in o
            assert "company" in o
            assert "tier" in o
            assert "package" in o

    def test_get_my_offers_student(self, client: TestClient, student_headers: dict[str, str]):
        # Aarav Sharma is student 1
        res = client.get("/api/v1/offers/mine", headers=student_headers)
        assert res.status_code == 200, res.text
        offers = res.json()
        assert len(offers) >= 1
        assert all(o["student_id"] == 1 for o in offers)

    def test_set_ctc_breakdown_on_pending_offer(
        self, client: TestClient, admin_headers: dict[str, str], db_session: Session
    ):
        # 1. Create a fresh application and select it to trigger a PENDING offer for student 12 (Priya) -> job 6
        res_apply = client.post(
            "/api/v1/applications",
            json={"job_id": 6, "student_id": 12},
            headers=admin_headers,
        )
        assert res_apply.status_code == 201
        app_id = res_apply.json()["application_id"]

        # Move: APPLIED -> SHORTLISTED -> INTERVIEW -> SELECTED
        client.patch(f"/api/v1/applications/{app_id}/status", json={"status": "SHORTLISTED"}, headers=admin_headers)
        client.patch(f"/api/v1/applications/{app_id}/status", json={"status": "INTERVIEW"}, headers=admin_headers)
        client.patch(f"/api/v1/applications/{app_id}/status", json={"status": "SELECTED"}, headers=admin_headers)

        # Retrieve the auto-created PENDING offer
        stmt = select(Offer).where(Offer.application_id == app_id)
        offer = db_session.execute(stmt).scalar_one()
        assert offer.status == "PENDING"
        offer_id = offer.id

        # 2. Staff updates CTC breakdown
        res_breakdown = client.patch(
            f"/api/v1/offers/{offer_id}/breakdown",
            json={"base_lpa": 12.0, "bonus_lpa": 2.5, "esop_lpa": 1.5},
            headers=admin_headers,
        )
        assert res_breakdown.status_code == 200, res_breakdown.text
        data = res_breakdown.json()
        assert float(data["base_lpa"]) == 12.0
        assert float(data["bonus_lpa"]) == 2.5
        assert float(data["esop_lpa"]) == 1.5
        assert float(data["package"]) == 16.0

    def test_set_breakdown_on_non_pending_offer_fails(
        self, client: TestClient, admin_headers: dict[str, str]
    ):
        # Offer 1 is already ACCEPTED
        res = client.patch(
            "/api/v1/offers/1/breakdown",
            json={"base_lpa": 10.0, "bonus_lpa": 1.0, "esop_lpa": 1.0},
            headers=admin_headers,
        )
        assert res.status_code in (404, 422), res.text
        assert "no longer pending" in res.json()["detail"].lower()


class TestOfferAcceptanceAndDreamOfferPolicy:
    def test_dream_offer_upgrade_acceptance(
        self, client: TestClient, student_headers: dict[str, str], admin_headers: dict[str, str], db_session: Session
    ):
        # Aarav (student 1) is currently placed at TechNova (CORE tier, 12 LPA). Offer ID 1 is ACCEPTED.
        # Upgrade Aarav's SQL proficiency to ADVANCED
        db_session.execute(
            text("""
                UPDATE student_skills
                SET proficiency = 'ADVANCED'
                WHERE student_id = 1 AND skill_id = (SELECT id FROM skills WHERE name = 'SQL')
            """)
        )
        db_session.commit()

        # Apply Aarav to DataWave (job 2, DREAM tier, 15 LPA)
        res_apply = client.post("/api/v1/applications", json={"job_id": 2}, headers=student_headers)
        assert res_apply.status_code == 201
        app_id = res_apply.json()["application_id"]

        # Staff shortlists, interviews, and selects Aarav
        client.patch(f"/api/v1/applications/{app_id}/status", json={"status": "SHORTLISTED"}, headers=admin_headers)
        client.patch(f"/api/v1/applications/{app_id}/status", json={"status": "INTERVIEW"}, headers=admin_headers)
        res_sel = client.patch(f"/api/v1/applications/{app_id}/status", json={"status": "SELECTED"}, headers=admin_headers)
        assert res_sel.status_code == 200

        # Retrieve new offer for Aarav
        stmt = select(Offer).where(Offer.application_id == app_id)
        new_offer = db_session.execute(stmt).scalar_one()
        assert new_offer.status == "PENDING"
        new_offer_id = new_offer.id

        # Aarav accepts the higher-tier offer
        res_accept = client.post(f"/api/v1/offers/{new_offer_id}/accept", headers=student_headers)
        assert res_accept.status_code == 200, res_accept.text
        assert res_accept.json()["status"] == "ACCEPTED"

        # Assert old offer 1 (TechNova) is now SUPERSEDED
        old_offer = db_session.get(Offer, 1)
        assert old_offer.status == "SUPERSEDED"

        # Assert placement is upgraded to DataWave (15 LPA)
        placement = db_session.execute(
            select(Placement).where(Placement.student_id == 1)
        ).scalar_one()
        assert placement.offer_id == new_offer_id
        assert placement.company_id == 2  # DataWave
        assert float(placement.package) == 15.0

    def test_student_decline_offer(
        self, client: TestClient, student_headers: dict[str, str], admin_headers: dict[str, str], db_session: Session
    ):
        # Create a pending offer for student 1 (Aarav) on job 2
        db_session.execute(
            text("""
                UPDATE student_skills
                SET proficiency = 'ADVANCED'
                WHERE student_id = 1 AND skill_id = (SELECT id FROM skills WHERE name = 'SQL')
            """)
        )
        db_session.commit()

        res_apply = client.post("/api/v1/applications", json={"job_id": 2}, headers=student_headers)
        app_id = res_apply.json()["application_id"]

        client.patch(f"/api/v1/applications/{app_id}/status", json={"status": "SHORTLISTED"}, headers=admin_headers)
        client.patch(f"/api/v1/applications/{app_id}/status", json={"status": "INTERVIEW"}, headers=admin_headers)
        client.patch(f"/api/v1/applications/{app_id}/status", json={"status": "SELECTED"}, headers=admin_headers)

        stmt = select(Offer).where(Offer.application_id == app_id)
        offer = db_session.execute(stmt).scalar_one()

        # Decline offer
        res_dec = client.post(f"/api/v1/offers/{offer.id}/decline", headers=student_headers)
        assert res_dec.status_code == 200, res_dec.text
        assert res_dec.json()["status"] == "DECLINED"

        # Check DB status
        refreshed = db_session.get(Offer, offer.id)
        assert refreshed.status == "DECLINED"

    def test_student_cannot_touch_another_students_offer(
        self, client: TestClient, student_headers: dict[str, str]
    ):
        # Offer 2 belongs to Diya (student 2); Aarav is student 1
        res = client.post("/api/v1/offers/2/accept", headers=student_headers)
        assert res.status_code == 404

        res = client.post("/api/v1/offers/2/decline", headers=student_headers)
        assert res.status_code == 404


class TestPlacementsEndpoints:
    def test_list_placements_admin(self, client: TestClient, admin_headers: dict[str, str]):
        res = client.get("/api/v1/placements", headers=admin_headers)
        assert res.status_code == 200, res.text
        placements = res.json()
        assert len(placements) >= 5
        for p in placements:
            assert "student_id" in p
            assert "company" in p
            assert "package" in p
            assert "placement_date" in p

    def test_get_my_placement_student(self, client: TestClient, student_headers: dict[str, str]):
        # Aarav is placed at TechNova
        res = client.get("/api/v1/placements/mine", headers=student_headers)
        assert res.status_code == 200, res.text
        data = res.json()
        assert data["student_id"] == 1
        assert data["company"] == "TechNova Solutions"
        assert float(data["package"]) == 12.0

    def test_export_placements_csv(self, client: TestClient, admin_headers: dict[str, str]):
        res = client.get("/api/v1/placements/export.csv", headers=admin_headers)
        assert res.status_code == 200, res.text
        assert res.headers["content-type"].startswith("text/csv")
        content = res.text
        assert "student_id,roll_number,student_name,department,company,job_role,package,placement_date" in content
        assert "Aarav Sharma" in content
        assert "TechNova Solutions" in content


class TestAnalyticsEndpoints:
    def test_analytics_overview(self, client: TestClient, admin_headers: dict[str, str]):
        res = client.get("/api/v1/analytics/overview", headers=admin_headers)
        assert res.status_code == 200, res.text
        kpis = res.json()
        assert kpis["total_students"] >= 12
        assert kpis["total_placed"] >= 5
        assert float(kpis["placement_rate"]) > 0
        assert float(kpis["highest_package"]) >= 15.0

    def test_analytics_departments(self, client: TestClient, admin_headers: dict[str, str]):
        res = client.get("/api/v1/analytics/departments", headers=admin_headers)
        assert res.status_code == 200, res.text
        depts = res.json()
        assert len(depts) >= 4
        for d in depts:
            assert "department_id" in d
            assert "department" in d
            assert "total_students" in d
            assert "placed_students" in d

    def test_analytics_companies(self, client: TestClient, admin_headers: dict[str, str]):
        res = client.get("/api/v1/analytics/companies", headers=admin_headers)
        assert res.status_code == 200, res.text
        companies = res.json()
        assert len(companies) >= 4

    def test_analytics_packages(self, client: TestClient, admin_headers: dict[str, str]):
        res = client.get("/api/v1/analytics/packages", headers=admin_headers)
        assert res.status_code == 200, res.text
        packages = res.json()
        assert len(packages) == 4
        ranges = [p["tier_range"] for p in packages]
        assert "< 6 LPA" in ranges
        assert "> 15 LPA" in ranges

    def test_analytics_funnel(self, client: TestClient, admin_headers: dict[str, str]):
        res = client.get("/api/v1/analytics/funnel", headers=admin_headers)
        assert res.status_code == 200, res.text
        funnel = res.json()
        statuses = [f["status"] for f in funnel]
        assert "APPLIED" in statuses
        assert "SELECTED" in statuses

    def test_analytics_top_students(self, client: TestClient, admin_headers: dict[str, str]):
        res = client.get("/api/v1/analytics/top-students?limit=5", headers=admin_headers)
        assert res.status_code == 200, res.text
        top = res.json()
        assert len(top) <= 5
        # Verify ordered by package descending
        packages = [float(s["package"]) for s in top]
        assert packages == sorted(packages, reverse=True)

    def test_analytics_nirf_report_csv(self, client: TestClient, admin_headers: dict[str, str]):
        res = client.get("/api/v1/analytics/nirf-report.csv", headers=admin_headers)
        assert res.status_code == 200, res.text
        assert res.headers["content-type"].startswith("text/csv")
        content = res.text
        assert "department,graduation_year,total_graduating,placed_students,placement_percentage,median_package,max_package" in content

    def test_analytics_refresh(self, client: TestClient, admin_headers: dict[str, str]):
        res = client.post("/api/v1/analytics/refresh", headers=admin_headers)
        assert res.status_code == 200, res.text
        assert "refreshed" in res.json()["message"].lower()
