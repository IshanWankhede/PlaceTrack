from fastapi.testclient import TestClient


def test_student_list_filters_and_paging(client: TestClient, admin_headers: dict[str, str]):
    # Default list
    res = client.get("/api/v1/students", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 12
    assert len(data["items"]) == 12

    # Paging: page=1, page_size=5
    res = client.get("/api/v1/students?page=1&page_size=5", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 12
    assert len(data["items"]) == 5
    assert data["page"] == 1
    assert data["page_size"] == 5

    # Filter by department_id = 1 (Computer Engineering has 5 students)
    res = client.get("/api/v1/students?department_id=1", headers=admin_headers)
    assert res.status_code == 200
    assert res.json()["total"] == 5

    # Filter by min_cgpa >= 8.5
    res = client.get("/api/v1/students?min_cgpa=8.5", headers=admin_headers)
    assert res.status_code == 200
    for s in res.json()["items"]:
        assert float(s["cgpa"]) >= 8.5

    # Filter by search q = "Sharma"
    res = client.get("/api/v1/students?q=Sharma", headers=admin_headers)
    assert res.status_code == 200
    assert res.json()["total"] == 1
    assert res.json()["items"][0]["name"] == "Aarav Sharma"

    # Filter by placement_status = "PLACED" (5 placed in seed)
    res = client.get("/api/v1/students?placement_status=PLACED", headers=admin_headers)
    assert res.status_code == 200
    assert res.json()["total"] == 5


def test_student_role_guards(
    client: TestClient, student_headers: dict[str, str], staff_headers: dict[str, str]
):
    # Student cannot call POST /students
    new_student = {
        "roll_number": "TEST2023001",
        "name": "Test Student",
        "email": "test.student@example.edu",
        "cgpa": 8.0,
        "graduation_year": 2027,
        "department_id": 1,
    }
    res = client.post("/api/v1/students", json=new_student, headers=student_headers)
    assert res.status_code == 403
    assert res.json()["code"] == "FORBIDDEN"

    # Student cannot delete student
    res = client.delete("/api/v1/students/1", headers=student_headers)
    assert res.status_code == 403

    # Staff cannot delete student (Admin only)
    res = client.delete("/api/v1/students/1", headers=staff_headers)
    assert res.status_code == 403


def test_student_create_and_duplicate_error_mapping(
    client: TestClient, admin_headers: dict[str, str]
):
    student_payload = {
        "roll_number": "UNIQUE999",
        "name": "Unique Student",
        "email": "unique.student@example.edu",
        "phone": "9888888888",
        "cgpa": 8.25,
        "graduation_year": 2027,
        "department_id": 1,
        "active_backlogs": 0,
    }
    res = client.post("/api/v1/students", json=student_payload, headers=admin_headers)
    assert res.status_code == 201
    created_id = res.json()["id"]

    # Attempt to create duplicate roll number -> mapped to 409
    res_dup = client.post("/api/v1/students", json=student_payload, headers=admin_headers)
    assert res_dup.status_code == 409
    assert res_dup.json()["code"] in ("CONFLICT", "UNIQUE_VIOLATION")

    # Clean up (within transaction or explicit delete)
    del_res = client.delete(f"/api/v1/students/{created_id}", headers=admin_headers)
    assert del_res.status_code == 200


def test_student_skill_replacement(
    client: TestClient, admin_headers: dict[str, str], student_headers: dict[str, str]
):
    # Aarav Sharma is student_id = 1
    new_skills = [
        {"skill_id": 1, "proficiency": "EXPERT"},
        {"skill_id": 2, "proficiency": "ADVANCED"},
    ]
    # Own student can replace skills
    res = client.put("/api/v1/students/1/skills", json=new_skills, headers=student_headers)
    assert res.status_code == 200
    skills_data = res.json()["skills"]
    assert len(skills_data) == 2
    assert any(s["skill_id"] == 1 and s["proficiency"] == "EXPERT" for s in skills_data)

    # Student cannot replace another student's skills
    res = client.put("/api/v1/students/2/skills", json=new_skills, headers=student_headers)
    assert res.status_code == 403


def test_student_me_profile_update(client: TestClient, student_headers: dict[str, str]):
    patch_data = {"phone": "9998887776", "resume_url": "https://example.com/aarav_resume.pdf"}
    res = client.patch("/api/v1/students/me", json=patch_data, headers=student_headers)
    assert res.status_code == 200
    assert res.json()["phone"] == "9998887776"
    assert res.json()["resume_url"] == "https://example.com/aarav_resume.pdf"


def test_student_cgpa_verify_procedure(client: TestClient, staff_headers: dict[str, str]):
    # Verify student 12 (Priya Bansal, cgpa_verified was False)
    res = client.patch("/api/v1/students/12/verify-cgpa?verified=true", headers=staff_headers)
    assert res.status_code == 200
    assert res.json()["cgpa_verified"] is True


def test_student_csv_export(client: TestClient, admin_headers: dict[str, str]):
    res = client.get("/api/v1/students/export.csv", headers=admin_headers)
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "Roll Number" in res.text
    assert "Aarav Sharma" in res.text
