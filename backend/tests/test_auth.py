"""Tests for /api/auth — registration, login, and the current-user endpoint."""


def test_register_creates_user(client, test_user_payload):
    response = client.post("/api/auth/register", json=test_user_payload)

    assert response.status_code == 200
    body = response.json()
    assert body["email"] == test_user_payload["email"]
    assert body["full_name"] == test_user_payload["full_name"]
    assert body["streak_count"] == 1
    assert "hashed_password" not in body
    assert "password" not in body


def test_register_rejects_duplicate_email(client, test_user_payload):
    client.post("/api/auth/register", json=test_user_payload)

    response = client.post("/api/auth/register", json=test_user_payload)

    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"


def test_login_succeeds_with_correct_credentials(client, test_user_payload):
    client.post("/api/auth/register", json=test_user_payload)

    response = client.post(
        "/api/auth/login",
        data={
            "username": test_user_payload["email"],
            "password": test_user_payload["password"],
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


def test_login_rejects_wrong_password(client, test_user_payload):
    client.post("/api/auth/register", json=test_user_payload)

    response = client.post(
        "/api/auth/login",
        data={
            "username": test_user_payload["email"],
            "password": "TotallyWrongPassword",
        },
    )

    assert response.status_code == 400


def test_login_rejects_unknown_email(client):
    response = client.post(
        "/api/auth/login",
        data={"username": "nobody@example.com", "password": "whatever123"},
    )

    assert response.status_code == 400


def test_me_requires_authentication(client):
    response = client.get("/api/auth/me")

    assert response.status_code == 401


def test_me_returns_current_user(auth_client, test_user_payload):
    response = auth_client.get("/api/auth/me")

    assert response.status_code == 200
    assert response.json()["email"] == test_user_payload["email"]