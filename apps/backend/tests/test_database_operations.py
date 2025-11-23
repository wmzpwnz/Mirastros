"""Integration tests for database operations"""

import pytest
from datetime import datetime, timedelta
from sqlalchemy import select
from app.models.user import User
from app.models.subscription import Subscription
from app.models.tarot_reading import TarotReading


class TestDatabaseOperations:
    """Test database operations"""
    
    @pytest.mark.asyncio
    async def test_create_user(self, db_session):
        """Test creating a user"""
        user = User(
            email="test@example.com",
            password_hash="hashed_password",
            full_name="Test User",
            birth_date=datetime(1990, 1, 1).date(),
            subscription_tier="freemium"
        )
        
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        
        assert user.id is not None
        assert user.email == "test@example.com"
        assert user.subscription_tier == "freemium"
    
    @pytest.mark.asyncio
    async def test_query_user(self, db_session):
        """Test querying a user"""
        # Create user
        user = User(
            email="query@example.com",
            password_hash="hashed_password",
            full_name="Query User",
            birth_date=datetime(1990, 1, 1).date(),
            subscription_tier="freemium"
        )
        
        db_session.add(user)
        await db_session.commit()
        
        # Query user
        result = await db_session.execute(
            select(User).where(User.email == "query@example.com")
        )
        found_user = result.scalar_one_or_none()
        
        assert found_user is not None
        assert found_user.email == "query@example.com"
    
    @pytest.mark.asyncio
    async def test_update_user(self, db_session):
        """Test updating a user"""
        # Create user
        user = User(
            email="update@example.com",
            password_hash="hashed_password",
            full_name="Update User",
            birth_date=datetime(1990, 1, 1).date(),
            subscription_tier="freemium"
        )
        
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        
        # Update user
        user.subscription_tier = "premium"
        await db_session.commit()
        await db_session.refresh(user)
        
        assert user.subscription_tier == "premium"
    
    @pytest.mark.asyncio
    async def test_delete_user(self, db_session):
        """Test deleting a user"""
        # Create user
        user = User(
            email="delete@example.com",
            password_hash="hashed_password",
            full_name="Delete User",
            birth_date=datetime(1990, 1, 1).date(),
            subscription_tier="freemium"
        )
        
        db_session.add(user)
        await db_session.commit()
        user_id = user.id
        
        # Delete user
        await db_session.delete(user)
        await db_session.commit()
        
        # Verify deletion
        result = await db_session.execute(
            select(User).where(User.id == user_id)
        )
        found_user = result.scalar_one_or_none()
        
        assert found_user is None
    
    @pytest.mark.asyncio
    async def test_create_subscription(self, db_session):
        """Test creating a subscription"""
        # Create user first
        user = User(
            email="sub@example.com",
            password_hash="hashed_password",
            full_name="Sub User",
            birth_date=datetime(1990, 1, 1).date(),
            subscription_tier="freemium"
        )
        
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        
        # Create subscription
        subscription = Subscription(
            user_id=user.id,
            tier="premium",
            status="active",
            payment_method="stripe",
            amount=9.99,
            currency="USD",
            starts_at=datetime.utcnow(),
            expires_at=datetime.utcnow() + timedelta(days=30),
            auto_renew=True
        )
        
        db_session.add(subscription)
        await db_session.commit()
        await db_session.refresh(subscription)
        
        assert subscription.id is not None
        assert subscription.tier == "premium"
        assert subscription.status == "active"
    
    @pytest.mark.asyncio
    async def test_query_user_with_subscription(self, db_session):
        """Test querying user with subscription relationship"""
        # Create user
        user = User(
            email="rel@example.com",
            password_hash="hashed_password",
            full_name="Rel User",
            birth_date=datetime(1990, 1, 1).date(),
            subscription_tier="premium"
        )
        
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        
        # Create subscription
        subscription = Subscription(
            user_id=user.id,
            tier="premium",
            status="active",
            payment_method="stripe",
            amount=9.99,
            currency="USD",
            starts_at=datetime.utcnow(),
            expires_at=datetime.utcnow() + timedelta(days=30),
            auto_renew=True
        )
        
        db_session.add(subscription)
        await db_session.commit()
        
        # Query with relationship
        result = await db_session.execute(
            select(User).where(User.email == "rel@example.com")
        )
        found_user = result.scalar_one_or_none()
        
        assert found_user is not None
        assert found_user.subscription_tier == "premium"
    
    @pytest.mark.asyncio
    async def test_create_tarot_reading(self, db_session):
        """Test creating a tarot reading"""
        # Create user first
        user = User(
            email="tarot@example.com",
            password_hash="hashed_password",
            full_name="Tarot User",
            birth_date=datetime(1990, 1, 1).date(),
            subscription_tier="freemium"
        )
        
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        
        # Create tarot reading
        reading = TarotReading(
            user_id=user.id,
            spread_type="three-card",
            cards=[
                {"id": 0, "name": "The Fool", "reversed": False},
                {"id": 1, "name": "The Magician", "reversed": False},
                {"id": 2, "name": "The High Priestess", "reversed": True}
            ],
            question="What does my future hold?",
            interpretation="Your reading suggests new beginnings..."
        )
        
        db_session.add(reading)
        await db_session.commit()
        await db_session.refresh(reading)
        
        assert reading.id is not None
        assert reading.spread_type == "three-card"
        assert len(reading.cards) == 3
    
    @pytest.mark.asyncio
    async def test_transaction_rollback(self, db_session):
        """Test transaction rollback on error"""
        user = User(
            email="rollback@example.com",
            password_hash="hashed_password",
            full_name="Rollback User",
            birth_date=datetime(1990, 1, 1).date(),
            subscription_tier="freemium"
        )
        
        db_session.add(user)
        
        try:
            # Simulate an error
            raise Exception("Simulated error")
        except Exception:
            await db_session.rollback()
        
        # Verify user was not created
        result = await db_session.execute(
            select(User).where(User.email == "rollback@example.com")
        )
        found_user = result.scalar_one_or_none()
        
        assert found_user is None
