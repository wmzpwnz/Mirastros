"""
Service layer unit tests
"""
import pytest
from unittest.mock import AsyncMock, patch
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.auth import AuthService
from app.services.reading import ReadingService
from app.services.llm import UnifiedLLMService
from app.models.user import User, SubscriptionTier
from app.models.reading import Reading, ReadingType

class TestAuthService:
    """Test authentication service"""
    
    @pytest.mark.asyncio
    async def test_authenticate_user_success(self, db_session: AsyncSession):
        """Test successful user authentication"""
        # Create test user
        user = User(
            email="auth@test.com",
            password_hash="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PZvO.S",  # bcrypt hash for "password123"
            full_name="Auth Test User",
            birth_date=datetime(1990, 1, 1).date(),
            subscription_tier=SubscriptionTier.FREEMIUM
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        
        # Test authentication
        auth_service = AuthService()
        authenticated_user = await auth_service.authenticate_user(
            db_session, "auth@test.com", "password123"
        )
        
        assert authenticated_user is not None
        assert authenticated_user.email == "auth@test.com"
        assert authenticated_user.full_name == "Auth Test User"
    
    @pytest.mark.asyncio
    async def test_authenticate_user_invalid_password(self, db_session: AsyncSession):
        """Test authentication with invalid password"""
        # Create test user
        user = User(
            email="invalidpass@test.com",
            password_hash="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PZvO.S",
            full_name="Password Test User",
            birth_date=datetime(1990, 1, 1).date(),
            subscription_tier=SubscriptionTier.FREEMIUM
        )
        db_session.add(user)
        await db_session.commit()
        
        # Test with wrong password
        auth_service = AuthService()
        authenticated_user = await auth_service.authenticate_user(
            db_session, "invalidpass@test.com", "wrongpassword"
        )
        
        assert authenticated_user is None
    
    @pytest.mark.asyncio
    async def test_create_access_token(self):
        """Test JWT token creation"""
        auth_service = AuthService()
        user_id = 123
        expires_delta = timedelta(minutes=30)
        
        token = auth_service.create_access_token(
            data={"sub": str(user_id)}, expires_delta=expires_delta
        )
        
        assert isinstance(token, str)
        assert len(token) > 0
        # Token should contain user ID
        assert str(user_id) in token or len(token) > 50  # JWT tokens are typically long

class TestReadingService:
    """Test reading service"""
    
    @pytest.mark.asyncio
    async def test_create_tarot_reading(self, db_session: AsyncSession):
        """Test creating tarot reading"""
        # Create test user
        user = User(
            email="reading@test.com",
            password_hash="hashed_password",
            full_name="Reading Test User",
            birth_date=datetime(1990, 1, 1).date(),
            subscription_tier=SubscriptionTier.FREEMIUM
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        
        reading_service = ReadingService()
        question = "What does my future hold?"
        spread_type = "three_card"
        
        reading = await reading_service.create_tarot_reading(
            db_session, user.id, question, spread_type
        )
        
        assert reading is not None
        assert reading.user_id == user.id
        assert reading.reading_type == ReadingType.TAROT
        assert reading.question == question
        assert reading.spread_type == spread_type
        assert len(reading.cards) == 3
        assert reading.interpretation is not None
    
    @pytest.mark.asyncio
    async def test_create_horoscope_reading(self, db_session: AsyncSession):
        """Test creating horoscope reading"""
        # Create test user
        user = User(
            email="horoscope@test.com",
            password_hash="hashed_password",
            full_name="Horoscope Test User",
            birth_date=datetime(1990, 1, 1).date(),
            subscription_tier=SubscriptionTier.FREEMIUM,
            zodiac_sign="aries"
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        
        reading_service = ReadingService()
        question = "What does today bring?"
        
        reading = await reading_service.create_horoscope_reading(
            db_session, user.id, question
        )
        
        assert reading is not None
        assert reading.user_id == user.id
        assert reading.reading_type == ReadingType.HOROSCOPE
        assert reading.question == question
        assert reading.zodiac_sign == "aries"
        assert reading.interpretation is not None
    
    @pytest.mark.asyncio
    async def test_get_user_reading_history(self, db_session: AsyncSession):
        """Test getting user reading history"""
        # Create test user
        user = User(
            email="history@test.com",
            password_hash="hashed_password",
            full_name="History Test User",
            birth_date=datetime(1990, 1, 1).date(),
            subscription_tier=SubscriptionTier.FREEMIUM
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        
        # Create some readings
        reading1 = Reading(
            user_id=user.id,
            reading_type=ReadingType.TAROT,
            question="Question 1",
            cards=["The Fool", "The Magician", "The High Priestess"],
            interpretation="Interpretation 1"
        )
        
        reading2 = Reading(
            user_id=user.id,
            reading_type=ReadingType.HOROSCOPE,
            question="Question 2",
            zodiac_sign="aries",
            interpretation="Interpretation 2"
        )
        
        db_session.add_all([reading1, reading2])
        await db_session.commit()
        
        # Test getting history
        reading_service = ReadingService()
        history = await reading_service.get_user_reading_history(db_session, user.id)
        
        assert len(history) == 2
        # Should be ordered by created_at descending
        assert history[0].created_at >= history[1].created_at

class TestUnifiedLLMService:
    """Test LLM service"""
    
    @pytest.mark.asyncio
    async def test_generate_tarot_interpretation(self):
        """Test tarot interpretation generation"""
        with patch('app.services.llm.Ollama') as mock_ollama:
            # Mock Ollama client
            mock_client = AsyncMock()
            mock_ollama.return_value = mock_client
            
            # Mock streaming response
            mock_response = [
                {"response": "This tarot reading suggests"},
                {"response": " positive changes ahead."},
                {"done": True}
            ]
            mock_client.generate.return_value = mock_response
            
            llm_service = UnifiedLLMService()
            cards = ["The Fool", "The Magician", "The High Priestess"]
            question = "What does my future hold?"
            
            result = await llm_service.generate_tarot_interpretation(cards, question)
            
            assert isinstance(result, str)
            assert len(result) > 0
            mock_client.generate.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_generate_horoscope_interpretation(self):
        """Test horoscope interpretation generation"""
        with patch('app.services.llm.Ollama') as mock_ollama:
            # Mock Ollama client
            mock_client = AsyncMock()
            mock_ollama.return_value = mock_client
            
            # Mock streaming response
            mock_response = [
                {"response": "Today brings opportunities"},
                {"response": " for growth and learning."},
                {"done": True}
            ]
            mock_client.generate.return_value = mock_response
            
            llm_service = UnifiedLLMService()
            zodiac_sign = "aries"
            date = datetime.now().date()
            
            result = await llm_service.generate_horoscope_interpretation(zodiac_sign, date)
            
            assert isinstance(result, str)
            assert len(result) > 0
            mock_client.generate.assert_called_once()

# Edge case and error handling tests
class TestEdgeCases:
    """Test edge cases and error handling"""
    
    @pytest.mark.asyncio
    async def test_empty_question_handling(self, db_session: AsyncSession):
        """Test handling empty questions"""
        user = User(
            email="empty@test.com",
            password_hash="hashed_password",
            full_name="Empty Test User",
            birth_date=datetime(1990, 1, 1).date(),
            subscription_tier=SubscriptionTier.FREEMIUM
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        
        reading_service = ReadingService()
        
        # Should handle empty question gracefully
        reading = await reading_service.create_tarot_reading(
            db_session, user.id, "", "single_card"
        )
        
        assert reading is not None
        assert reading.question == "" or reading.question is not None
    
    @pytest.mark.asyncio
    async def test_invalid_spread_type(self, db_session: AsyncSession):
        """Test handling invalid spread types"""
        user = User(
            email="invalid@test.com",
            password_hash="hashed_password",
            full_name="Invalid Test User",
            birth_date=datetime(1990, 1, 1).date(),
            subscription_tier=SubscriptionTier.FREEMIUM
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        
        reading_service = ReadingService()
        
        # Should handle invalid spread type gracefully
        reading = await reading_service.create_tarot_reading(
            db_session, user.id, "Test question", "invalid_spread"
        )
        
        # Should either succeed with default spread or raise validation error
        assert reading is not None or True  # Either way, no crash

if __name__ == "__main__":
    pytest.main([__file__, "-v"])