import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.database.database import engine, get_db
from app.main import app


@pytest.fixture(scope="session")
def db_connection():
    connection = engine.connect()
    yield connection
    connection.close()


@pytest.fixture
def db_session(db_connection):
    transaction = db_connection.begin()
    session = Session(bind=db_connection, autoflush=False, autocommit=False)

    yield session

    session.close()
    if transaction.is_active:
        transaction.rollback()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_token(client: TestClient) -> str:
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@placetrack.com", "password": "Admin@123"},
    )
    assert res.status_code == 200, res.text
    return res.json()["access_token"]


@pytest.fixture
def admin_headers(admin_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def staff_token(client: TestClient) -> str:
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "staff@placetrack.com", "password": "Staff@123"},
    )
    assert res.status_code == 200, res.text
    return res.json()["access_token"]


@pytest.fixture
def staff_headers(staff_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {staff_token}"}


@pytest.fixture
def student_token(client: TestClient) -> str:
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "aarav.sharma@example.edu", "password": "Student@123"},
    )
    assert res.status_code == 200, res.text
    return res.json()["access_token"]


@pytest.fixture
def student_headers(student_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {student_token}"}
