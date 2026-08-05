from app import schemas
from jose import jwt
from app.config import settings
import pytest

@pytest.fixture
def test_user(client):
    user_data = {"email": "hello@example.com",
                  "password": "password123"}
    res = client.post("/users/", json=user_data)
    assert res.status_code == 201
    print(res.json())
    new_user = res.json() 
    new_user['password'] = user_data['password']
    return new_user

    

#def test_root(client):
    #res = client.get("/")
    #print(res.json().get("message"))
    #assert res.json().get("message") == "oh Yeahhhhhh"
    #assert res.status_code == 200

def test_create_user(client):
    res = client.post("/users/", json={"email": "hello@example.com", "password": "password123"})
    new_user = schemas.UserOut(**res.json())
    assert res.status_code == 201
    assert new_user.email == "hello@example.com"

def test_login_user(client, test_user):
    res = client.post("/login", data={"username": test_user['email'], "password": test_user['password']})
    login_res = schemas.Token(**res.json())
    payload = jwt.decode(login_res.access_token, settings.secret_key, algorithms=[settings.algorithm])
    id = payload.get("user_id")
    assert id == test_user['id']
    assert login_res.token_type == "bearer"
    assert res.status_code == 200

@pytest.mark.parametrize("email, password, status_code", [
    ('wrong@gmail.com', 'password123', 403),
    ('heloo@gmail.com', 'wrong password', 403),
    ('wrong@gmail.com', 'wrongpassword', 403),
    (None, 'password123', 422),
    ('test@example.com', None, 422)
])
def test_incorrect_login(client, test_user, email, password, status_code):
    res = client.post("/login", data={"username": email, "password": password})
    assert res.status_code == status_code
    #assert res.json().get("detail") == "Invalid Credentials"    