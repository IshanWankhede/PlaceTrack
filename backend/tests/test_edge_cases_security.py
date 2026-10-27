import pytest
from fastapi.testclient import TestClient


class TestSecurityAndEdgeCases:
    def test_analytics_student_forbidden(self, client: TestClient, student_headers: dict[str, str]):
        endpoints = [
            "/api/v1/analytics/overview",
            "/api/v1/analytics/departments",
            "/api/v1/analytics/companies",
            "/api/v1/analytics/packages",
            "/api/v1/analytics/funnel",
            "/api/v1/analytics/top-students",
            "/api/v1/analytics/nirf-report.csv",
        ]
        for ep in endpoints:
            res = client.get(ep, headers=student_headers)
            assert res.status_code == 403, f"{ep} returned {res.status_code} for student"
            assert res.json()["code"] == "FORBIDDEN"

    def test_analytics_refresh_student_forbidden(self, client: TestClient, student_headers: dict[str, str]):
        res = client.post("/api/v1/analytics/refresh", headers=student_headers)
        assert res.status_code == 403
        assert res.json()["code"] == "FORBIDDEN"

    def test_unauthenticated_requests_return_401(self, client: TestClient):
        protected = [
            ("/api/v1/auth/me", "GET"),
            ("/api/v1/students", "GET"),
            ("/api/v1/analytics/overview", "GET"),
            ("/api/v1/offers/mine", "GET"),
            ("/api/v1/placements/mine", "GET"),
        ]
        for url, method in protected:
            if method == "GET":
                res = client.get(url)
            else:
                res = client.post(url)
            assert res.status_code == 401, f"{url} returned {res.status_code} unauthenticated"
            assert res.json()["code"] == "UNAUTHORIZED"

    def test_malformed_token_returns_401(self, client: TestClient):
        res = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid.jwt.token"})
        assert res.status_code == 401
        assert res.json()["code"] == "UNAUTHORIZED"

    def test_no_password_hash_leaked_in_auth_me(self, client: TestClient, admin_headers: dict[str, str], student_headers: dict[str, str]):
        for h in [admin_headers, student_headers]:
            res = client.get("/api/v1/auth/me", headers=h)
            assert res.status_code == 200
            data = res.json()
            assert "password" not in data
            assert "password_hash" not in data
            assert "hashed_password" not in data

    def test_no_password_hash_in_students_list(self, client: TestClient, admin_headers: dict[str, str]):
        res = client.get("/api/v1/students", headers=admin_headers)
        assert res.status_code == 200
        items = res.json()["items"]
        assert len(items) > 0
        for s in items:
            assert "password" not in s
            assert "password_hash" not in s

    def test_pagination_page_size_zero_fails_422(self, client: TestClient, admin_headers: dict[str, str]):
        res = client.get("/api/v1/students?page_size=0", headers=admin_headers)
        assert res.status_code == 422

    def test_pagination_page_zero_fails_422(self, client: TestClient, admin_headers: dict[str, str]):
        res = client.get("/api/v1/students?page=0", headers=admin_headers)
        assert res.status_code == 422

    def test_pagination_large_page_size(self, client: TestClient, admin_headers: dict[str, str]):
        res = client.get("/api/v1/students?page_size=100", headers=admin_headers)
        assert res.status_code == 200
        data = res.json()
        assert len(data["items"]) <= 100

    def test_student_filter_nonexistent_department(self, client: TestClient, admin_headers: dict[str, str]):
        res = client.get("/api/v1/students?department_id=9999", headers=admin_headers)
        assert res.status_code == 200
        assert res.json()["total"] == 0
        assert res.json()["items"] == []

    def test_student_filter_invalid_cgpa_range_422(self, client: TestClient, admin_headers: dict[str, str]):
        # min_cgpa > 10 should fail validation if constrained, or return 0 items
        res = client.get("/api/v1/students?min_cgpa=15.0", headers=admin_headers)
        # Either 422 or 200 with 0 items
        if res.status_code == 200:
            assert res.json()["total"] == 0
        else:
            assert res.status_code == 422
