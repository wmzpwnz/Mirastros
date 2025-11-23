"""Unit tests for subscription logic"""

import pytest
from datetime import datetime, timedelta
from app.services.subscription import SubscriptionService


class TestSubscriptionService:
    """Test subscription service"""
    
    @pytest.mark.asyncio
    async def test_get_tier_limits_freemium(self):
        """Test getting tier limits for freemium"""
        service = SubscriptionService()
        limits = service.get_tier_limits("freemium")
        
        assert limits["horoscope_daily"] == 1
        assert limits["tarot_readings_per_week"] == 1
        assert limits["dream_interpretations_per_day"] == 1
        assert limits["clarify_enabled"] is False
    
    @pytest.mark.asyncio
    async def test_get_tier_limits_premium(self):
        """Test getting tier limits for premium"""
        service = SubscriptionService()
        limits = service.get_tier_limits("premium")
        
        assert limits["horoscope_daily"] == -1  # Unlimited
        assert limits["tarot_readings_per_week"] == -1
        assert limits["clarify_enabled"] is True
        assert limits["natal_chart"] is True
    
    @pytest.mark.asyncio
    async def test_get_tier_limits_platinum(self):
        """Test getting tier limits for platinum"""
        service = SubscriptionService()
        limits = service.get_tier_limits("platinum")
        
        assert limits["horoscope_daily"] == -1
        assert limits["clarify_enabled"] is True
        assert limits["priority_processing"] is True
        assert limits["horary_astrology"] is True
        assert limits["solar_return"] is True
    
    @pytest.mark.asyncio
    async def test_check_access_freemium_allowed(self, db_session, mocker):
        """Test access check for allowed freemium feature"""
        service = SubscriptionService()
        
        # Mock user with freemium tier
        mock_user = mocker.MagicMock()
        mock_user.subscription_tier = "freemium"
        mock_user.subscription_expires = datetime.utcnow() + timedelta(days=30)
        
        # Mock database query
        mocker.patch.object(
            db_session,
            "execute",
            return_value=mocker.MagicMock(scalar_one_or_none=lambda: mock_user)
        )
        
        has_access = await service.check_access(
            db=db_session,
            user_id="test-user",
            feature="horoscope_daily"
        )
        
        # Freemium users should have access to daily horoscope
        assert has_access is True
    
    @pytest.mark.asyncio
    async def test_check_access_freemium_blocked(self, db_session, mocker):
        """Test access check for blocked freemium feature"""
        service = SubscriptionService()
        
        # Mock user with freemium tier
        mock_user = mocker.MagicMock()
        mock_user.subscription_tier = "freemium"
        mock_user.subscription_expires = datetime.utcnow() + timedelta(days=30)
        
        mocker.patch.object(
            db_session,
            "execute",
            return_value=mocker.MagicMock(scalar_one_or_none=lambda: mock_user)
        )
        
        has_access = await service.check_access(
            db=db_session,
            user_id="test-user",
            feature="clarify_enabled"
        )
        
        # Freemium users should NOT have access to clarify feature
        assert has_access is False
    
    @pytest.mark.asyncio
    async def test_check_access_premium(self, db_session, mocker):
        """Test access check for premium user"""
        service = SubscriptionService()
        
        # Mock user with premium tier
        mock_user = mocker.MagicMock()
        mock_user.subscription_tier = "premium"
        mock_user.subscription_expires = datetime.utcnow() + timedelta(days=30)
        
        mocker.patch.object(
            db_session,
            "execute",
            return_value=mocker.MagicMock(scalar_one_or_none=lambda: mock_user)
        )
        
        has_access = await service.check_access(
            db=db_session,
            user_id="test-user",
            feature="clarify_enabled"
        )
        
        # Premium users should have access to clarify feature
        assert has_access is True
    
    @pytest.mark.asyncio
    async def test_check_access_expired_subscription(self, db_session, mocker):
        """Test access check for expired subscription"""
        service = SubscriptionService()
        
        # Mock user with expired premium subscription
        mock_user = mocker.MagicMock()
        mock_user.subscription_tier = "premium"
        mock_user.subscription_expires = datetime.utcnow() - timedelta(days=1)
        
        mocker.patch.object(
            db_session,
            "execute",
            return_value=mocker.MagicMock(scalar_one_or_none=lambda: mock_user)
        )
        
        has_access = await service.check_access(
            db=db_session,
            user_id="test-user",
            feature="clarify_enabled"
        )
        
        # Expired subscription should revert to freemium
        assert has_access is False
    
    @pytest.mark.asyncio
    async def test_upgrade_subscription(self, db_session, mocker):
        """Test subscription upgrade"""
        service = SubscriptionService()
        
        # Mock user
        mock_user = mocker.MagicMock()
        mock_user.id = "test-user"
        mock_user.subscription_tier = "freemium"
        
        mocker.patch.object(
            db_session,
            "execute",
            return_value=mocker.MagicMock(scalar_one_or_none=lambda: mock_user)
        )
        
        mocker.patch.object(db_session, "commit", return_value=None)
        
        await service.upgrade_subscription(
            db=db_session,
            user_id="test-user",
            new_tier="premium"
        )
        
        assert mock_user.subscription_tier == "premium"
    
    @pytest.mark.asyncio
    async def test_cancel_subscription(self, db_session, mocker):
        """Test subscription cancellation"""
        service = SubscriptionService()
        
        # Mock user with premium subscription
        mock_user = mocker.MagicMock()
        mock_user.id = "test-user"
        mock_user.subscription_tier = "premium"
        
        mocker.patch.object(
            db_session,
            "execute",
            return_value=mocker.MagicMock(scalar_one_or_none=lambda: mock_user)
        )
        
        mocker.patch.object(db_session, "commit", return_value=None)
        
        await service.cancel_subscription(
            db=db_session,
            user_id="test-user"
        )
        
        assert mock_user.subscription_tier == "freemium"
