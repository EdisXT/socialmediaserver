from app import schemas, models
from jose import jwt
from app.config import settings
import pytest


@pytest.fixture
def test_user(client, session):
    user_data = {
        "email": "hello@example.com",
        "username": "testuser",
        "password": "password123"
    }

    res = client.post("/users/", json=user_data)

    assert res.status_code == 201

    new_user = res.json()

    # Mark test user as verified
    db_user = session.query(models.User).filter(
        models.User.id == new_user["id"]
    ).first()

    assert db_user is not None

    db_user.is_verified = True
    session.commit()
    session.refresh(db_user)

    new_user["password"] = user_data["password"]

    return new_user


def test_create_user(client):
    user_data = {
        "email": "newuser@example.com",
        "username": "newuser",
        "password": "password123"
    }

    res = client.post("/users/", json=user_data)

    assert res.status_code == 201

    new_user = schemas.UserOut(**res.json())

    assert new_user.email == user_data["email"]
    assert new_user.username == user_data["username"]


def test_login_user(client, test_user):
    res = client.post(
        "/login",
        data={
            "username": test_user["email"],
            "password": test_user["password"]
        }
    )

    assert res.status_code == 200

    login_res = schemas.Token(**res.json())

    payload = jwt.decode(
        login_res.access_token,
        settings.secret_key,
        algorithms=[settings.algorithm]
    )

    user_id = payload.get("user_id")

    assert user_id == test_user["id"]
    assert login_res.token_type == "bearer"


@pytest.mark.parametrize(
    "email, password, status_code",
    [
        ("wrong@gmail.com", "password123", 403),
        ("heloo@gmail.com", "wrong password", 403),
        ("wrong@gmail.com", "wrongpassword", 403),
        (None, "password123", 422),
        ("test@example.com", None, 422),
    ],
)
def test_incorrect_login(
    client,
    test_user,
    email,
    password,
    status_code
):
    login_data = {}

    if email is not None:
        login_data["username"] = email

    if password is not None:
        login_data["password"] = password

    res = client.post("/login", data=login_data)

    assert res.status_code == status_code