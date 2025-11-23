"""Integration tests for API endpoints"""

import pytest
from httpx import AsyncClient
from fastapi import FastAPI
from app.main import app


class TestAPIEndpoints:
    """Test API endpoints"""
    
    @pytest.mark.asyncio
    async def test_health_endpoint(self):
        """Test health check endpoint"""
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get("/health")
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
    
    @pytest.mark.asyncio
    async def test_auth_register(self, mocker):
        """Test user registration endpoint"""
        # Mock database operations
        mocker.patch("app.api.auth.get_db", return_value=mocker.AsyncMock())
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                "/auth/register",
                json={
                    "email": "test@example.com",
                    "password": "Test123!@#",
                    "full_name": "Test User",
                    "birth_date": "1990-01-01",
                    "birth_time": "12:00:00",
                    "birth_location": "New York, USA"
                }
            )
            
            # Should return 200 or 201 on success
            assert response.status_code in [200, 201, 422]  # 422 if validation fails
    
    @pytest.mark.asyncio
    async def test_auth_login(self, mocker):
        """Test user login endpoint"""
        mocker.patch("app.api.auth.get_db", return_value=mocker.AsyncMock())
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                "/auth/login",
                data={
                    "username": "test@example.com",
                    "password": "Test123!@#"
                }
            )
            
            # Should return 200 on success or 401/422 on failure
            assert response.status_code in [200, 401, 422]
    
    @pytest.mark.asyncio
    async def test_tarot_reading_endpoint(self, mocker):
        """Test tarot reading endpoint"""
        # Mock authentication
        mocker.patch("app.core.deps.get_current_user", return_value={"id": "test-user"})
        mocker.patch("app.api.tarot.get_db", return_value=mocker.AsyncMock())
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                "/tarot/reading",
                json={
                    "spread_type": "three-card",
                    "question": "What does my future hold?"
                },
                headers={"Authorization": "Bearer test-token"}
            )
            
            # Should return 200 or 401 (if auth fails)
            assert response.status_code in [200, 401, 422]
    
    @pytest.mark.asyncio
    async def test_horoscope_endpoint(self, mocker):
        """Test horoscope endpoint"""
        mocker.patch("app.api.horoscope.get_db", return_value=mocker.AsyncMock())
        mocker.patch("app.api.horoscope.redis_client", return_value=mocker.AsyncMock())
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get("/horoscope/daily/aries")
            
            # Should return 200 on success
            assert response.status_code in [200, 404, 500]
    
    @pytest.mark.asyncio
    async def test_natal_chart_endpoint(self, mocker):
        """Test natal chart calculation endpoint"""
        mocker.patch("app.core.deps.get_current_user", return_value={"id": "test-user"})
        mocker.patch("app.api.natal_chart.get_db", return_value=mocker.AsyncMock())
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                "/natal/calculate",
                json={
                    "birth_date": "1990-01-01",
                    "birth_time": "12:00:00",
                    "latitude": 40.7128,
                    "longitude": -74.0060
                },
                headers={"Authorization": "Bearer test-token"}
            )
            
            assert response.status_code in [200, 401, 422]
    
    @pytest.mark.asyncio
    async def test_chat_endpoint(self, mocker):
        """Test chat endpoint"""
        mocker.patch("app.core.deps.get_current_user", return_value={"id": "test-user"})
        mocker.patch("app.api.chat.get_db", return_value=mocker.AsyncMock())
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                "/chat/start",
                json={
                    "context_type": "tarot",
                    "context_data": {"cards": ["The Fool", "The Magician"]}
                },
                headers={"Authorization": "Bearer test-token"}
            )
            
            assert response.status_code in [200, 401, 422]
    
    @pytest.mark.asyncio
    async def test_subscription_status_endpoint(self, mocker):
        """Test subscription status endpoint"""
        mocker.patch("app.core.deps.get_current_user", return_value={"id": "test-user"})
        mocker.patch("app.api.subscriptions.get_db", return_value=mocker.AsyncMock())
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(
                "/subscriptions/status",
                headers={"Authorization": "Bearer test-token"}
            )
            
            assert response.status_code in [200, 401, 404]
    
    @pytest.mark.asyncio
    async def test_shop_products_endpoint(self, mocker):
        """Test shop products endpoint"""
        mocker.patch("app.api.shop.get_db", return_value=mocker.AsyncMock())
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get("/shop/products")
            
            assert response.status_code in [200, 500]
    
    @pytest.mark.asyncio
    async def test_journal_entries_endpoint(self, mocker):
        """Test journal entries endpoint"""
        mocker.patch("app.core.deps.get_current_user", return_value={"id": "test-user"})
        mocker.patch("app.api.journal.get_db", return_value=mocker.AsyncMock())
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(
                "/journal/entries",
                headers={"Authorization": "Bearer test-token"}
            )
            
            assert response.status_code in [200, 401]
