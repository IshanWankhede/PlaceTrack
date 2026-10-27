from fastapi.testclient import TestClient


def test_login_success_admin(client: TestClient):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@placetrack.com", "password": "Admin@123"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["role"] == "ADMIN"
    assert data["user"]["email"] == "admin@placetrack.com"


def test_login_success_student(client: TestClient):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "aarav.sharma@example.edu", "password": "Student@123"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["user"]["role"] == "STUDENT"
    assert data["user"]["student_id"] == 1
    assert data["user"]["student"]["name"] == "Aarav Sharma"


def test_login_failure_wrong_password(client: TestClient):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@placetrack.com", "password": "WrongPassword123"},
    )
    assert res.status_code == 401
    assert res.json()["code"] == "UNAUTHORIZED"


def test_login_failure_unknown_user(client: TestClient):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@example.com", "password": "Password@123"},
    )
    assert res.status_code == 401
    assert res.json()["code"] == "UNAUTHORIZED"


def test_get_me_unauthorized(client: TestClient):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401
    assert res.json()["code"] == "UNAUTHORIZED"


def test_get_me_authorized(client: TestClient, admin_headers: dict[str, str]):
    res = client.get("/api/v1/auth/me", headers=admin_headers)
    assert res.status_code == 200
    assert res.json()["email"] == "admin@placetrack.com"
    assert res.json()["role"] == "ADMIN"


def test_signup_otp_roster_found(client: TestClient):
    # Priya Bansal (CE2023005) is in students but not in users
    res = client.post(
        "/api/v1/auth/signup/request-otp",
        json={"roll_number": "CE2023005", "email": "priya.bansal@example.edu"},
    )
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_signup_otp_already_registered(client: TestClient):
    # Aarav Sharma is already registered
    res = client.post(
        "/api/v1/auth/signup/request-otp",
        json={"roll_number": "CE2023001", "email": "aarav.sharma@example.edu"},
    )
    assert res.status_code == 409
    assert res.json()["code"] == "CONFLICT"


def test_signup_otp_not_on_roster(client: TestClient):
    res = client.post(
        "/api/v1/auth/signup/request-otp",
        json={"roll_number": "FAKE99999", "email": "fake.student@example.edu"},
    )
    assert res.status_code == 404
    assert res.json()["code"] == "NOT_FOUND"


def test_signup_verify_invalid_otp(client: TestClient):
    res = client.post(
        "/api/v1/auth/signup/verify",
        json={
            "email": "priya.bansal@example.edu",
            "otp": "000000",
            "password": "NewPassword@123",
        },
    )
    assert res.status_code == 400
    assert res.json()["code"] == "INVALID_OTP"
