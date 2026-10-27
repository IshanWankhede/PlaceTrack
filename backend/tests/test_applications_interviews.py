from datetime import datetime
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.history import ApplicationStatusHistory
from app.models.interview import Interview
from app.models.notification import Notification
from app.models.offer import Offer
from app.models.placement import Placement


class TestApplicationLifecycle:
    """Full lifecycle with a fresh application: Priya (student 12) -> job 6."""

    def test_full_lifecycle_and_offer_creation(self, client: TestClient, admin_headers: dict[str, str], db_session: Session):
        # 1. Apply: Priya (student 12) to FinEdge (job 6)
        res = client.post(
            "/api/v1/applications",
            json={"job_id": 6, "student_id": 12},
            headers=admin_headers,
        )
        assert res.status_code == 201, res.text
        app_data = res.json()
        app_id = app_data["application_id"]
        assert app_data["status"] == "APPLIED"
        assert app_data["student_name"] == "Priya Bansal"

        # 2. Shortlist: APPLIED -> SHORTLISTED
        res = client.patch(
            f"/api/v1/applications/{app_id}/status",
            json={"status": "SHORTLISTED"},
            headers=admin_headers,
        )
        assert res.status_code == 200, res.text
        assert res.json()["status"] == "SHORTLISTED"

        # 3. Schedule round 1 with a meeting link
        # Notice: scheduling an interview automatically moves SHORTLISTED -> INTERVIEW in SQL
        res = client.post(
            f"/api/v1/applications/{app_id}/interviews",
            json={
                "round_type": "TECHNICAL",
                "scheduled_at": "2026-11-05T14:00:00",
                "meeting_link": "https://meet.google.com/xyz-test",
                "venue": "Virtual Room 3",
                "panelists": "Dr. Smith, Er. Jane",
            },
            headers=admin_headers,
        )
        assert res.status_code == 201, res.text
        interview = res.json()
        assert interview["round_number"] == 1
        assert interview["round_type"] == "TECHNICAL"
        assert interview["meeting_link"] == "https://meet.google.com/xyz-test"
        assert interview["result"] == "PENDING"

        # Check application status is now INTERVIEW
        res = client.get(f"/api/v1/applications?student_id=12&job_id=6", headers=admin_headers)
        assert res.status_code == 200
        apps = res.json()
        matching_app = next(a for a in apps if a["application_id"] == app_id)
        assert matching_app["status"] == "INTERVIEW"

        # 4. Record CLEARED for round 1
        res = client.patch(
            f"/api/v1/applications/{app_id}/interviews/1",
            json={"result": "CLEARED", "remarks": "Excellent problem solving"},
            headers=admin_headers,
        )
        assert res.status_code == 200, res.text
        assert res.json()["result"] == "CLEARED"

        # 5. Select: INTERVIEW -> SELECTED
        res = client.patch(
            f"/api/v1/applications/{app_id}/status",
            json={"status": "SELECTED"},
            headers=admin_headers,
        )
        assert res.status_code == 200, res.text
        assert res.json()["status"] == "SELECTED"

        # Assert a PENDING offer exists in offers table
        stmt = select(Offer).where(Offer.application_id == app_id)
        offer = db_session.execute(stmt).scalar_one_or_none()
        assert offer is not None
        assert offer.status == "PENDING"
        assert offer.student_id == 12
        assert offer.job_id == 6

        # Assert notifications exist
        stmt_notif = select(Notification).where(Notification.student_id == 12)
        notifs = list(db_session.execute(stmt_notif).scalars().all())
        assert len(notifs) >= 1
        assert any(n.type == "OFFER" for n in notifs)

        # Assert no placement exists yet (only created when student accepts in Phase 5)
        stmt_place = select(Placement).where(Placement.application_id == app_id)
        place = db_session.execute(stmt_place).scalar_one_or_none()
        assert place is None

        # History check
        res_hist = client.get(f"/api/v1/applications/{app_id}/history", headers=admin_headers)
        assert res_hist.status_code == 200
        hist = res_hist.json()
        transitions = [(h["old_status"], h["new_status"]) for h in hist]
        # Initial INSERT -> (None, APPLIED), then APPLIED->SHORTLISTED, SHORTLISTED->INTERVIEW, INTERVIEW->SELECTED
        assert (None, "APPLIED") in transitions
        assert ("APPLIED", "SHORTLISTED") in transitions
        assert ("SHORTLISTED", "INTERVIEW") in transitions
        assert ("INTERVIEW", "SELECTED") in transitions


class TestApplicationValidationsAndErrors:
    """Verification of all edge cases and SQL trigger error translations."""

    def test_ineligible_apply_fails_422(self, client: TestClient, admin_headers: dict[str, str]):
        # Rohan (student 3) has active_backlogs = 1; job 1 requires max_backlogs = 0
        res = client.post(
            "/api/v1/applications",
            json={"student_id": 3, "job_id": 1},
            headers=admin_headers,
        )
        assert res.status_code == 422, res.text
        assert "not eligible" in res.json()["detail"].lower()

    def test_duplicate_apply_fails_409(self, client: TestClient, admin_headers: dict[str, str]):
        # Kabir (student 5) already has an application for job 1
        res = client.post(
            "/api/v1/applications",
            json={"student_id": 5, "job_id": 1},
            headers=admin_headers,
        )
        assert res.status_code == 409, res.text
        assert "already applied" in res.json()["detail"].lower()

    def test_closed_job_apply_fails_422(self, client: TestClient, admin_headers: dict[str, str]):
        # Job 7 is CLOSED
        res = client.post(
            "/api/v1/applications",
            json={"student_id": 12, "job_id": 7},
            headers=admin_headers,
        )
        assert res.status_code == 422, res.text
        assert "not open" in res.json()["detail"].lower()

    def test_apply_time_tier_policy_fails_422(self, client: TestClient, admin_headers: dict[str, str]):
        # Diya (student 2) is already placed at DataWave (DREAM tier)
        # Job 6 is FinEdge (PRODUCT_BASED tier) or Job 1 is TechNova (CORE tier)
        # Placement policy blocks applying to same or lower tier
        res = client.post(
            "/api/v1/applications",
            json={"student_id": 2, "job_id": 6},
            headers=admin_headers,
        )
        assert res.status_code == 422, res.text
        detail = res.json()["detail"].lower()
        assert "policy" in detail or "tier" in detail

    def test_illegal_status_jump_fails_422(self, client: TestClient, admin_headers: dict[str, str]):
        # Application 4 is currently APPLIED. Trying to jump directly to SELECTED is illegal.
        res = client.patch(
            "/api/v1/applications/4/status",
            json={"status": "SELECTED"},
            headers=admin_headers,
        )
        assert res.status_code == 422, res.text
        assert "illegal status transition" in res.json()["detail"].lower()

    def test_selecting_diya_at_technova_core_fails_422_leaves_status_unchanged(
        self, client: TestClient, admin_headers: dict[str, str], db_session: Session
    ):
        # Application 2 is Diya Patil (student 2) at TechNova (job 1, CORE). Currently INTERVIEW.
        # Transition INTERVIEW -> SELECTED is syntactically legal, but trg_fn_create_offer
        # rejects because Diya is already placed at DataWave (DREAM tier).
        res = client.patch(
            "/api/v1/applications/2/status",
            json={"status": "SELECTED"},
            headers=admin_headers,
        )
        assert res.status_code == 422, res.text
        detail = res.json()["detail"].lower()
        assert "offer policy" in detail or "higher tier" in detail

        # Assert status remains unchanged (INTERVIEW)
        app = db_session.get(Application, 2)
        assert app.status == "INTERVIEW"


class TestBulkShortlistAndAtomicity:
    def test_bulk_shortlist_job1_min_cgpa_8(self, client: TestClient, admin_headers: dict[str, str], db_session: Session):
        # For job 1, only Priya (student 12, CGPA 8.40) is in APPLIED status.
        res = client.post(
            "/api/v1/applications/bulk-status",
            json={
                "job_id": 1,
                "from_status": "APPLIED",
                "to_status": "SHORTLISTED",
                "min_cgpa": 8.0,
            },
            headers=admin_headers,
        )
        assert res.status_code == 200, res.text
        data = res.json()
        assert data["updated_count"] == 1

        # Application 4 (Priya -> job 1) is now SHORTLISTED
        app = db_session.get(Application, 4)
        assert app.status == "SHORTLISTED"


class TestOwnershipAndStudentAccess:
    def test_student_cannot_see_or_touch_another_application(
        self, client: TestClient, student_headers: dict[str, str]
    ):
        # Aarav Sharma is student 1. Application 2 belongs to Diya (student 2).
        # Withdraw:
        res = client.post("/api/v1/applications/2/withdraw", headers=student_headers)
        assert res.status_code == 404

        # View interviews:
        res = client.get("/api/v1/applications/2/interviews", headers=student_headers)
        assert res.status_code == 404

    def test_student_can_withdraw_own_application(
        self, client: TestClient, student_headers: dict[str, str], db_session: Session
    ):
        # Update Aarav's SQL skill to ADVANCED so he qualifies for DataWave (job 2, DREAM tier)
        db_session.execute(
            text("""
                UPDATE student_skills
                SET proficiency = 'ADVANCED'
                WHERE student_id = 1 AND skill_id = (SELECT id FROM skills WHERE name = 'SQL')
            """)
        )
        db_session.commit()

        # Aarav Sharma applies to job 2 (DataWave, DREAM tier)
        res_apply = client.post(
            "/api/v1/applications",
            json={"job_id": 2},
            headers=student_headers,
        )
        assert res_apply.status_code == 201, res_apply.text
        app_id = res_apply.json()["application_id"]

        # Withdraw own application
        res_withdraw = client.post(
            f"/api/v1/applications/{app_id}/withdraw",
            headers=student_headers,
        )
        assert res_withdraw.status_code == 200, res_withdraw.text
        assert res_withdraw.json()["status"] == "WITHDRAWN"

    def test_student_get_mine_endpoint(self, client: TestClient, student_headers: dict[str, str]):
        res = client.get("/api/v1/applications/mine", headers=student_headers)
        assert res.status_code == 200, res.text
        apps = res.json()
        assert isinstance(apps, list)
        for a in apps:
            assert "application_id" in a
            assert "interviews" in a
            assert isinstance(a["interviews"], list)


class TestNotifications:
    def test_notifications_list_and_read_all(self, client: TestClient, student_headers: dict[str, str]):
        # Get notifications for student 1 (Aarav)
        res = client.get("/api/v1/notifications", headers=student_headers)
        assert res.status_code == 200, res.text
        notifs = res.json()
        assert isinstance(notifs, list)

        # Mark all read
        res_read = client.post("/api/v1/notifications/read-all", headers=student_headers)
        assert res_read.status_code == 200, res_read.text

        # Verify unread filter returns empty
        res_unread = client.get("/api/v1/notifications?unread=true", headers=student_headers)
        assert res_unread.status_code == 200
        assert len(res_unread.json()) == 0
