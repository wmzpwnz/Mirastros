"""Subscription management service"""
from typing import Optional, Tuple
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
import uuid
from app.models.user import User, SubscriptionTier
from app.models.subscription import Subscription, SubscriptionStatus, PaymentMethod


class SubscriptionService:
    """Service for managing user subscriptions"""
    
    # Pricing configuration (in USD)
    PRICING = {
        SubscriptionTier.PREMIUM: {
            "monthly": Decimal("9.99"),
            "annual": Decimal("99.00")
        },
        SubscriptionTier.PLATINUM: {
            "monthly": Decimal("29.99"),
            "annual": Decimal("299.00")
        }
    }
    
    @staticmethod
    def get_price(tier: SubscriptionTier, billing_period: str) -> Decimal:
        """Get price for subscription tier and billing period"""
        if tier == SubscriptionTier.FREEMIUM:
            return Decimal("0.00")
        
        return SubscriptionService.PRICING.get(tier, {}).get(billing_period, Decimal("0.00"))
    
    @staticmethod
    def calculate_expiry_date(billing_period: str) -> datetime:
        """Calculate subscription expiry date"""
        now = datetime.utcnow()
        
        if billing_period == "monthly":
            # Add 30 days
            return now + timedelta(days=30)
        elif billing_period == "annual":
            # Add 365 days
            return now + timedelta(days=365)
        else:
            raise ValueError(f"Invalid billing period: {billing_period}")
    
    @staticmethod
    async def create_subscription(
        db: AsyncSession,
        user: User,
        tier: SubscriptionTier,
        payment_method: PaymentMethod,
        billing_period: str
    ) -> Subscription:
        """Create a new subscription"""
        # Validate tier
        if tier == SubscriptionTier.FREEMIUM:
            raise ValueError("Cannot create subscription for freemium tier")
        
        # Get price
        amount = SubscriptionService.get_price(tier, billing_period)
        
        # Calculate dates
        starts_at = datetime.utcnow()
        expires_at = SubscriptionService.calculate_expiry_date(billing_period)
        
        # Create subscription record
        subscription = Subscription(
            id=uuid.uuid4(),
            user_id=user.id,
            tier=tier.value,
            status=SubscriptionStatus.PENDING,
            payment_method=payment_method,
            amount=amount,
            currency="USD",
            starts_at=starts_at,
            expires_at=expires_at,
            auto_renew="true"
        )
        
        db.add(subscription)
        await db.commit()
        await db.refresh(subscription)
        
        return subscription
    
    @staticmethod
    async def activate_subscription(
        db: AsyncSession,
        subscription: Subscription,
        external_payment_id: Optional[str] = None
    ) -> Tuple[Subscription, User]:
        """Activate a pending subscription"""
        # Update subscription status
        subscription.status = SubscriptionStatus.ACTIVE
        
        # Store external payment ID
        if external_payment_id:
            if subscription.payment_method == PaymentMethod.STRIPE:
                subscription.stripe_subscription_id = external_payment_id
            elif subscription.payment_method == PaymentMethod.YOOKASSA:
                subscription.yookassa_payment_id = external_payment_id
            elif subscription.payment_method == PaymentMethod.REVENUE_CAT:
                subscription.revenue_cat_transaction_id = external_payment_id
        
        # Update user subscription tier
        result = await db.execute(select(User).where(User.id == subscription.user_id))
        user = result.scalar_one()
        
        user.subscription_tier = SubscriptionTier(subscription.tier)
        user.subscription_expires = subscription.expires_at
        
        await db.commit()
        await db.refresh(subscription)
        await db.refresh(user)
        
        return subscription, user
    
    @staticmethod
    async def get_active_subscription(
        db: AsyncSession,
        user_id: uuid.UUID
    ) -> Optional[Subscription]:
        """Get user's active subscription"""
        result = await db.execute(
            select(Subscription).where(
                and_(
                    Subscription.user_id == user_id,
                    Subscription.status == SubscriptionStatus.ACTIVE
                )
            ).order_by(Subscription.expires_at.desc())
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def cancel_subscription(
        db: AsyncSession,
        subscription: Subscription,
        immediate: bool = False
    ) -> Subscription:
        """Cancel a subscription"""
        subscription.cancelled_at = datetime.utcnow()
        subscription.auto_renew = "false"
        
        if immediate:
            # Cancel immediately
            subscription.status = SubscriptionStatus.CANCELLED
            subscription.expires_at = datetime.utcnow()
            
            # Downgrade user to freemium
            result = await db.execute(select(User).where(User.id == subscription.user_id))
            user = result.scalar_one()
            user.subscription_tier = SubscriptionTier.FREEMIUM
            user.subscription_expires = None
        else:
            # Cancel at period end (keep active until expiry)
            subscription.status = SubscriptionStatus.ACTIVE
        
        await db.commit()
        await db.refresh(subscription)
        
        return subscription
    
    @staticmethod
    async def upgrade_subscription(
        db: AsyncSession,
        user: User,
        current_subscription: Subscription,
        new_tier: SubscriptionTier,
        billing_period: str
    ) -> Subscription:
        """Upgrade user's subscription to a higher tier"""
        # Validate upgrade
        tier_hierarchy = {
            SubscriptionTier.FREEMIUM: 0,
            SubscriptionTier.PREMIUM: 1,
            SubscriptionTier.PLATINUM: 2
        }
        
        current_tier = SubscriptionTier(current_subscription.tier)
        if tier_hierarchy[new_tier] <= tier_hierarchy[current_tier]:
            raise ValueError("Can only upgrade to a higher tier")
        
        # Cancel current subscription (immediate)
        await SubscriptionService.cancel_subscription(db, current_subscription, immediate=True)
        
        # Create new subscription
        new_subscription = await SubscriptionService.create_subscription(
            db, user, new_tier, current_subscription.payment_method, billing_period
        )
        
        return new_subscription
    
    @staticmethod
    async def check_and_expire_subscriptions(db: AsyncSession) -> int:
        """
        Check for expired subscriptions and update user tiers
        This should be run as a scheduled task (cron job)
        """
        now = datetime.utcnow()
        
        # Find expired active subscriptions
        result = await db.execute(
            select(Subscription).where(
                and_(
                    Subscription.status == SubscriptionStatus.ACTIVE,
                    Subscription.expires_at <= now
                )
            )
        )
        expired_subscriptions = result.scalars().all()
        
        count = 0
        for subscription in expired_subscriptions:
            # Mark subscription as expired
            subscription.status = SubscriptionStatus.EXPIRED
            
            # Downgrade user to freemium
            result = await db.execute(select(User).where(User.id == subscription.user_id))
            user = result.scalar_one_or_none()
            
            if user:
                user.subscription_tier = SubscriptionTier.FREEMIUM
                user.subscription_expires = None
                count += 1
        
        await db.commit()
        return count
    
    @staticmethod
    def get_subscription_status(user: User, subscription: Optional[Subscription]) -> dict:
        """Get user's subscription status information"""
        if user.subscription_tier == SubscriptionTier.FREEMIUM:
            return {
                "is_active": False,
                "tier": SubscriptionTier.FREEMIUM,
                "expires_at": None,
                "days_remaining": None,
                "auto_renew": False,
                "can_upgrade": True,
                "available_upgrades": [
                    SubscriptionTier.PREMIUM.value,
                    SubscriptionTier.PLATINUM.value
                ]
            }
        
        # Calculate days remaining
        days_remaining = None
        if user.subscription_expires:
            delta = user.subscription_expires - datetime.utcnow()
            days_remaining = max(0, delta.days)
        
        # Determine available upgrades
        available_upgrades = []
        if user.subscription_tier == SubscriptionTier.PREMIUM:
            available_upgrades.append(SubscriptionTier.PLATINUM.value)
        
        return {
            "is_active": True,
            "tier": user.subscription_tier,
            "expires_at": user.subscription_expires,
            "days_remaining": days_remaining,
            "auto_renew": subscription.auto_renew == "true" if subscription else False,
            "can_upgrade": len(available_upgrades) > 0,
            "available_upgrades": available_upgrades
        }


# Singleton instance
subscription_service = SubscriptionService()
