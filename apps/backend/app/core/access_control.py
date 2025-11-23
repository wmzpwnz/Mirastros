"""Access control middleware for tier-based feature restrictions and usage limits"""
from typing import Callable, Optional
from datetime import datetime, timedelta
from functools import wraps
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from app.models.user import User, SubscriptionTier
from app.core.redis import redis_client
import logging

logger = logging.getLogger(__name__)


class UsageLimitExceeded(HTTPException):
    """Exception raised when user exceeds usage limits"""
    def __init__(self, detail: str, upgrade_tier: str):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=detail,
            headers={"X-Upgrade-Required": upgrade_tier}
        )


class FeatureAccessControl:
    """Feature access control based on subscription tiers"""
    
    # Define feature access by tier
    TIER_FEATURES = {
        SubscriptionTier.FREEMIUM: {
            "daily_horoscope": True,
            "weekly_horoscope": False,
            "monthly_horoscope": False,
            "tarot_reading": True,
            "natal_chart": False,
            "dream_interpretation": True,
            "numerology": True,
            "compatibility": True,
            "clarify_chat": False,
            "runes": True,
            "iching": True,
            "lenormand": True,
            "transits": False,
            "synastry": False,
            "lunar_calendar": True,
            "crystals": True,
            "rituals": True,
            "horary": False,
            "chakra": True,
            "solar_return": False,
            "karmic_tasks": True,
            "mandala": True,
            "journal": True,
            "shop": True
        },
        SubscriptionTier.PREMIUM: {
            "daily_horoscope": True,
            "weekly_horoscope": True,
            "monthly_horoscope": True,
            "tarot_reading": True,
            "natal_chart": True,
            "dream_interpretation": True,
            "numerology": True,
            "compatibility": True,
            "clarify_chat": True,
            "runes": True,
            "iching": True,
            "lenormand": True,
            "transits": True,
            "synastry": True,
            "lunar_calendar": True,
            "crystals": True,
            "rituals": True,
            "horary": False,
            "chakra": True,
            "solar_return": False,
            "karmic_tasks": True,
            "mandala": True,
            "journal": True,
            "shop": True
        },
        SubscriptionTier.PLATINUM: {
            # Platinum has access to everything
            "daily_horoscope": True,
            "weekly_horoscope": True,
            "monthly_horoscope": True,
            "tarot_reading": True,
            "natal_chart": True,
            "dream_interpretation": True,
            "numerology": True,
            "compatibility": True,
            "clarify_chat": True,
            "runes": True,
            "iching": True,
            "lenormand": True,
            "transits": True,
            "synastry": True,
            "lunar_calendar": True,
            "crystals": True,
            "rituals": True,
            "horary": True,
            "chakra": True,
            "solar_return": True,
            "karmic_tasks": True,
            "mandala": True,
            "journal": True,
            "shop": True
        }
    }
    
    # Define usage limits for Freemium tier (per day)
    FREEMIUM_LIMITS = {
        "daily_horoscope": 1,
        "tarot_reading": 1,  # 1 per week actually, but we'll track daily
        "dream_interpretation": 1,
        "numerology": 1,  # Once total, not per day
        "compatibility": 1,
        "runes": 1,
        "iching": 1,
        "lenormand": 1,
        "lunar_calendar": 3,
        "crystals": 3,
        "rituals": 1,
        "chakra": 1,
        "karmic_tasks": 1,
        "mandala": 1,
        "journal": 5  # 5 entries per day
    }
    
    @staticmethod
    def check_feature_access(user: User, feature: str) -> bool:
        """Check if user has access to a feature"""
        tier_features = FeatureAccessControl.TIER_FEATURES.get(user.subscription_tier, {})
        return tier_features.get(feature, False)
    
    @staticmethod
    def get_required_tier(feature: str) -> Optional[SubscriptionTier]:
        """Get minimum required tier for a feature"""
        for tier in [SubscriptionTier.FREEMIUM, SubscriptionTier.PREMIUM, SubscriptionTier.PLATINUM]:
            if FeatureAccessControl.TIER_FEATURES[tier].get(feature, False):
                return tier
        return None
    
    @staticmethod
    async def check_usage_limit(user: User, feature: str) -> tuple[bool, int, int]:
        """
        Check if user has exceeded usage limit for a feature
        
        Returns: (has_access, current_usage, limit)
        """
        # Premium and Platinum have unlimited access
        if user.subscription_tier in [SubscriptionTier.PREMIUM, SubscriptionTier.PLATINUM]:
            return True, 0, -1  # -1 means unlimited
        
        # Check if feature has usage limit
        limit = FeatureAccessControl.FREEMIUM_LIMITS.get(feature)
        if limit is None:
            return True, 0, -1  # No limit defined
        
        # Get current usage from Redis
        today = datetime.utcnow().date().isoformat()
        cache_key = f"usage:{user.id}:{feature}:{today}"
        
        current_usage = await redis_client.get(cache_key)
        current_usage = int(current_usage) if current_usage else 0
        
        has_access = current_usage < limit
        return has_access, current_usage, limit
    
    @staticmethod
    async def increment_usage(user: User, feature: str) -> None:
        """Increment usage counter for a feature"""
        # Only track for Freemium users
        if user.subscription_tier != SubscriptionTier.FREEMIUM:
            return
        
        # Check if feature has usage limit
        if feature not in FeatureAccessControl.FREEMIUM_LIMITS:
            return
        
        # Increment usage in Redis
        today = datetime.utcnow().date().isoformat()
        cache_key = f"usage:{user.id}:{feature}:{today}"
        
        current = await redis_client.get(cache_key)
        new_value = (int(current) if current else 0) + 1
        
        # Set with 24-hour expiry
        await redis_client.set(cache_key, new_value, ttl=86400)
        
        logger.info(f"User {user.id} usage for {feature}: {new_value}/{FeatureAccessControl.FREEMIUM_LIMITS[feature]}")


def require_feature_access(feature: str, check_usage: bool = True):
    """
    Decorator to require feature access based on subscription tier
    
    Args:
        feature: Feature name (e.g., "weekly_horoscope", "natal_chart")
        check_usage: Whether to check and enforce usage limits for Freemium users
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract user from kwargs (injected by FastAPI dependency)
            current_user = kwargs.get('current_user')
            
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            
            # Check feature access
            if not FeatureAccessControl.check_feature_access(current_user, feature):
                required_tier = FeatureAccessControl.get_required_tier(feature)
                if required_tier == SubscriptionTier.PREMIUM:
                    upgrade_message = "This feature requires Premium or Platinum subscription"
                    upgrade_tier = "premium"
                elif required_tier == SubscriptionTier.PLATINUM:
                    upgrade_message = "This feature requires Platinum subscription"
                    upgrade_tier = "platinum"
                else:
                    upgrade_message = "This feature is not available"
                    upgrade_tier = "premium"
                
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=upgrade_message,
                    headers={"X-Upgrade-Required": upgrade_tier}
                )
            
            # Check usage limits for Freemium users
            if check_usage and current_user.subscription_tier == SubscriptionTier.FREEMIUM:
                has_access, current_usage, limit = await FeatureAccessControl.check_usage_limit(
                    current_user, feature
                )
                
                if not has_access:
                    raise UsageLimitExceeded(
                        detail=f"Daily limit reached for {feature} ({current_usage}/{limit}). Upgrade to Premium for unlimited access.",
                        upgrade_tier="premium"
                    )
            
            # Execute the endpoint
            result = await func(*args, **kwargs)
            
            # Increment usage counter after successful execution
            if check_usage:
                await FeatureAccessControl.increment_usage(current_user, feature)
            
            return result
        
        return wrapper
    return decorator


async def check_subscription_active(user: User) -> None:
    """Check if user's subscription is active (not expired)"""
    if user.subscription_tier == SubscriptionTier.FREEMIUM:
        return  # Freemium never expires
    
    if user.subscription_expires and user.subscription_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your subscription has expired. Please renew to continue.",
            headers={"X-Subscription-Expired": "true"}
        )


# Convenience function to get upgrade prompt message
def get_upgrade_prompt(feature: str, current_tier: SubscriptionTier) -> dict:
    """Get upgrade prompt message for a feature"""
    required_tier = FeatureAccessControl.get_required_tier(feature)
    
    if required_tier == SubscriptionTier.PREMIUM:
        return {
            "message": "Upgrade to Premium to unlock this feature",
            "required_tier": "premium",
            "price_monthly": "$9.99/month",
            "price_annual": "$99/year",
            "features": [
                "Unlimited horoscopes (daily, weekly, monthly)",
                "Full natal chart analysis",
                "Unlimited Tarot readings",
                "Clarify with Mirastros AI",
                "Planetary transits",
                "Compatibility analysis",
                "No ads"
            ]
        }
    elif required_tier == SubscriptionTier.PLATINUM:
        return {
            "message": "Upgrade to Platinum to unlock this feature",
            "required_tier": "platinum",
            "price_monthly": "$29.99/month",
            "price_annual": "$299/year",
            "features": [
                "All Premium features",
                "Horary astrology (specific questions)",
                "Solar return chart (yearly forecast)",
                "Priority AI processing",
                "Personalized rituals and meditations",
                "Live astrologer consultation (1/month)",
                "Priority support"
            ]
        }
    
    return {
        "message": "This feature is not available",
        "required_tier": "unknown"
    }
