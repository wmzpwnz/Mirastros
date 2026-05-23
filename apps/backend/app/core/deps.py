"""FastAPI dependencies for authentication and database"""
from typing import AsyncGenerator, Optional
from datetime import datetime, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.config import get_settings
from app.core.security import decode_token
from app.models.user import User, SubscriptionTier

# HTTP Bearer token scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token"""
    token = credentials.credentials
    
    # Decode token
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check token type
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user ID from token
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Fetch user from database
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user (can be extended with active status check)"""
    return current_user


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Get current user if authenticated, otherwise return None"""
    if credentials is None:
        return None
    
    try:
        token = credentials.credentials
        
        # Decode token
        payload = decode_token(token)
        if payload is None:
            return None
        
        # Check token type
        if payload.get("type") != "access":
            return None
        
        # Get user ID from token
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        
        # Fetch user from database
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        return user
    except Exception:
        return None


def require_subscription(min_tier: SubscriptionTier):
    """Dependency factory to require minimum subscription tier"""
    async def check_subscription(
        current_user: User = Depends(get_current_active_user)
    ) -> User:
        # Define tier hierarchy
        tier_hierarchy = {
            SubscriptionTier.FREEMIUM: 0,
            SubscriptionTier.PREMIUM: 1,
            SubscriptionTier.PLATINUM: 2
        }
        
        user_tier_level = tier_hierarchy.get(current_user.subscription_tier, 0)
        required_tier_level = tier_hierarchy.get(min_tier, 0)
        
        if user_tier_level < required_tier_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This feature requires {min_tier.value} subscription or higher"
            )
        
        # Check if subscription is expired (for paid tiers)
        if current_user.subscription_tier != SubscriptionTier.FREEMIUM:
            if current_user.subscription_expires and current_user.subscription_expires < datetime.now(timezone.utc):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Your subscription has expired. Please renew to continue."
                )
        
        return current_user
    
    return check_subscription


# Convenience dependencies for different tiers
require_premium = require_subscription(SubscriptionTier.PREMIUM)
require_platinum = require_subscription(SubscriptionTier.PLATINUM)


async def require_admin(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Require admin role (for now, check if user has admin email or specific flag)."""
    admin_emails = list(get_settings().ADMIN_EMAILS) if get_settings().ADMIN_EMAILS else []

    if current_user.email not in admin_emails:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return current_user
