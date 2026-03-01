import os
import json
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app, get_db
from models import Base, User, Project, ContentItem
from auth import get_password_hash, create_access_token

# Setup test db
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/geo_agent"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def run_around_tests():
    # Setup
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Create User A
    user_a = User(email="user_a@test.com", hashed_password=get_password_hash("password"), name="User A")
    db.add(user_a)
    db.commit()
    db.refresh(user_a)
    
    # Create User B
    user_b = User(email="user_b@test.com", hashed_password=get_password_hash("password"), name="User B")
    db.add(user_b)
    db.commit()
    db.refresh(user_b)

    # Create Project for User A
    project_a = Project(name="Project A", user_id=user_a.id)
    db.add(project_a)
    
    # Create Project for User B 
    project_b = Project(name="Project B", user_id=user_b.id)
    db.add(project_b)
    
    db.commit()
    db.refresh(project_a)
    db.refresh(project_b)
    
    # Create content item for project A
    item_a = ContentItem(project_id=project_a.id, url="http://a.com", content="Test A")
    db.add(item_a)
    db.commit()
    
    yield
    # Teardown
    db.close()
    Base.metadata.drop_all(bind=engine)

def get_token(user_id, email):
    return create_access_token(data={"sub": str(user_id), "email": email})

def test_user_a_cannot_see_user_b_project():
    token = get_token(1, "user_a@test.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Try fetching project B
    response = client.get("/api/projects/2", headers=headers)
    assert response.status_code == 404
    
    # Try fetching project A
    response = client.get("/api/projects/1", headers=headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Project A"

def test_user_a_cannot_see_user_b_content_history():
    token = get_token(2, "user_b@test.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    # History endpoint should only show User B's items (0)
    response = client.get("/api/history", headers=headers)
    assert response.status_code == 200
    assert len(response.json()["items"]) == 0
    
    token_a = get_token(1, "user_a@test.com")
    headers_a = {"Authorization": f"Bearer {token_a}"}
    response_a = client.get("/api/history", headers=headers_a)
    assert response_a.status_code == 200
    assert len(response_a.json()["items"]) == 1
