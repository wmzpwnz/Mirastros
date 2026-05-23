"""
API endpoint integration tests
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    @pytest.mark.asyncio
    async def test_register_user_success(self, client: AsyncClient):
        """Test successful user registration"""
        data = {
            "email": "newuser@example.com",
            "password": "securepassword123",
            "full_name": "New User",
            "birth_date": "1995-05-15"
        }
        
        response = await client.post("/auth/register", json=data)

        assert response.status_code == 201
        json_response = response.json()
        assert "user" in json_response
        assert "access_token" in json_response
        assert "refresh_token" in json_response
        user = json_response["user"]
        assert "id" in user
        assert user["email"] == data["email"]
        assert "password_hash" not in json_response
        assert "password_hash" not in user
    
    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, client: AsyncClient):
        """Test registration with duplicate email"""
        # First registration
        data = {
            "email": "duplicate@test.com",
            "password": "password123",
            "full_name": "Test User",
            "birth_date": "1990-01-01"
        }
        
        await client.post("/auth/register", json=data)
        
        # Second registration with same email
        response = await client.post("/auth/register", json=data)
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()
    
    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient):
        """Test successful login"""
        # Register user first
        register_data = {
            "email": "loginuser@example.com",
            "password": "loginpassword123",
            "full_name": "Login User",
            "birth_date": "1992-03-20"
        }
        
        await client.post("/auth/register", json=register_data)
        
        # Login
        login_data = {
            "email": "loginuser@example.com",
            "password": "loginpassword123"
        }
        
        response = await client.post("/auth/login", json=login_data)
        
        assert response.status_code == 200
        json_response = response.json()
        assert "access_token" in json_response
        assert "refresh_token" in json_response
        assert json_response["token_type"] == "bearer"
    
    @pytest.mark.asyncio
    async def test_login_invalid_credentials(self, client: AsyncClient):
        """Test login with invalid credentials"""
        data = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        response = await client.post("/auth/login", json=data)
        
        assert response.status_code == 401
        assert "incorrect email or password" in response.json()["detail"].lower()

class TestProtectedEndpoints:
    """Test endpoints that require authentication"""
    
    @pytest.mark.asyncio
    async def test_get_profile_authenticated(self, client: AsyncClient, auth_headers: dict):
        """Test getting user profile with valid token"""
        response = await client.get("/auth/me", headers=auth_headers)
        
        assert response.status_code == 200
        json_response = response.json()
        assert "id" in json_response
        assert "email" in json_response
        assert "full_name" in json_response
    
    @pytest.mark.asyncio
    async def test_get_profile_unauthenticated(self, client: AsyncClient):
        """Test getting user profile without token"""
        response = await client.get("/auth/profile")
        
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_get_profile_invalid_token(self, client: AsyncClient):
        """Test getting user profile with invalid token"""
        headers = {"Authorization": "Bearer invalid_token"}
        response = await client.get("/auth/profile", headers=headers)
        
        assert response.status_code == 401

class TestHealthEndpoint:
    """Test health check endpoint"""
    
    @pytest.mark.asyncio
    async def test_health_check(self, client: AsyncClient):
        """Test health check endpoint"""
        response = await client.get("/health")
        
        assert response.status_code == 200
        json_response = response.json()
        assert json_response["status"] == "healthy"
        assert "timestamp" in json_response
        assert "services" in json_response

class TestReadingEndpoints:
    """Test reading service endpoints"""
    
    @pytest.mark.asyncio
    async def test_create_tarot_reading(self, client: AsyncClient, auth_headers: dict):
        """Test creating tarot reading"""
        data = {
            "reading_type": "tarot",
            "question": "What does my future hold?",
            "spread_type": "three_card"
        }
        
        response = await client.post("/readings/", json=data, headers=auth_headers)
        
        assert response.status_code == 201
        json_response = response.json()
        assert "id" in json_response
        assert json_response["reading_type"] == "tarot"
        assert json_response["question"] == data["question"]
        assert "cards" in json_response
        assert len(json_response["cards"]) == 3  # three_card spread
    
    @pytest.mark.asyncio
    async def test_get_reading_history(self, client: AsyncClient, auth_headers: dict):
        """Test getting reading history"""
        # Create a reading first
        reading_data = {
            "reading_type": "horoscope",
            "question": "Daily horoscope",
            "zodiac_sign": "aries"
        }
        
        await client.post("/readings/", json=reading_data, headers=auth_headers)
        
        # Get history
        response = await client.get("/readings/history", headers=auth_headers)
        
        assert response.status_code == 200
        json_response = response.json()
        assert isinstance(json_response, list)
        assert len(json_response) >= 1

# Performance and stress tests
class TestPerformance:
    """Performance and stress tests"""
    
    @pytest.mark.asyncio
    async def test_concurrent_requests(self, client: AsyncClient, auth_headers: dict):
        """Test handling concurrent requests"""
        import asyncio
        
        async def make_request():
            return await client.get("/health")
        
        # Make 10 concurrent health check requests
        tasks = [make_request() for _ in range(10)]
        responses = await asyncio.gather(*tasks)
        
        # All should succeed
        assert all(response.status_code == 200 for response in responses)
    
    @pytest.mark.asyncio
    async def test_large_payload_handling(self, client: AsyncClient):
        """Test handling large payloads"""
        large_question = "A" * 10000  # 10KB question
        
        data = {
            "reading_type": "tarot",
            "question": large_question,
            "spread_type": "single_card"
        }
        
        response = await client.post("/readings/", json=data, headers=auth_headers)
        
        # Should either succeed or return appropriate error
        assert response.status_code in [201, 413, 422]  # Created, Payload Too Large, or Validation Error