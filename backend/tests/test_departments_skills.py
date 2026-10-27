from fastapi.testclient import TestClient


def test_departments_crud(
    client: TestClient, admin_headers: dict[str, str], student_headers: dict[str, str]
):
    # Student can read departments
    res = client.get("/api/v1/departments", headers=student_headers)
    assert res.status_code == 200
    assert len(res.json()) >= 4

    # Student cannot create department
    res = client.post(
        "/api/v1/departments",
        json={"name": "Chemical Engineering", "code": "CHEM"},
        headers=student_headers,
    )
    assert res.status_code == 403

    # Admin creates department
    res = client.post(
        "/api/v1/departments",
        json={"name": "Chemical Engineering", "code": "CHEM"},
        headers=admin_headers,
    )
    assert res.status_code == 201
    created_id = res.json()["id"]

    # Duplicate code fails
    res_dup = client.post(
        "/api/v1/departments",
        json={"name": "Another Chem", "code": "CHEM"},
        headers=admin_headers,
    )
    assert res_dup.status_code == 409

    # Admin updates department
    res_up = client.put(
        f"/api/v1/departments/{created_id}",
        json={"name": "Chemical Engineering & Materials", "code": "CHEM"},
        headers=admin_headers,
    )
    assert res_up.status_code == 200
    assert res_up.json()["name"] == "Chemical Engineering & Materials"

    # Admin deletes department
    res_del = client.delete(f"/api/v1/departments/{created_id}", headers=admin_headers)
    assert res_del.status_code == 200


def test_skills_crud(
    client: TestClient, admin_headers: dict[str, str], student_headers: dict[str, str]
):
    # Student can read skills
    res = client.get("/api/v1/skills", headers=student_headers)
    assert res.status_code == 200
    assert len(res.json()) >= 12

    # Student cannot create skill
    res = client.post("/api/v1/skills", json={"name": "GraphQL"}, headers=student_headers)
    assert res.status_code == 403

    # Admin creates skill
    res = client.post("/api/v1/skills", json={"name": "GraphQL"}, headers=admin_headers)
    assert res.status_code == 201
    created_id = res.json()["id"]

    # Duplicate name fails
    res_dup = client.post("/api/v1/skills", json={"name": "GraphQL"}, headers=admin_headers)
    assert res_dup.status_code == 409

    # Admin updates skill
    res_up = client.put(
        f"/api/v1/skills/{created_id}",
        json={"name": "GraphQL API"},
        headers=admin_headers,
    )
    assert res_up.status_code == 200
    assert res_up.json()["name"] == "GraphQL API"

    # Admin deletes skill
    res_del = client.delete(f"/api/v1/skills/{created_id}", headers=admin_headers)
    assert res_del.status_code == 200
