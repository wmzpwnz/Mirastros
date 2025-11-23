"""Pydantic schemas for subscription management"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal
from app.models.subscription import SubscriptionStatus, PaymentMethod
from app.models.user import SubscriptionTier


class SubscriptionCreate(BaseModel):
    """Create subscription request"""
    tier: SubscriptionTier
    payment_method: PaymentMethod
    billing_period: str = Field(..., pattern="^(monthly|annual)$")  # monthly or annual


class SubscriptionResponse(BaseModel):
    """Subscription response schema"""
    id: str
    user_id: str
    tier: str
    status: SubscriptionStatus
    payment_method: PaymentMethod
    amount: Decimal
    currency: str
    starts_at: datetime
    expires_at: datetime
    cancelled_at: Optional[datetime] = None
    auto_renew: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class SubscriptionStatusResponse(BaseModel):
    """User subscription status response"""
    is_active: bool
    tier: SubscriptionTier
    expires_at: Optional[datetime] = None
    days_remaining: Optional[int] = None
    auto_renew: bool
    can_upgrade: bool
    available_upgrades: list[str]


class SubscriptionUpgradeRequest(BaseModel):
    """Upgrade subscription request"""
    new_tier: SubscriptionTier
    billing_period: str = Field(..., pattern="^(monthly|annual)$")


class SubscriptionCancelRequest(BaseModel):
    """Cancel subscription request"""
    reason: Optional[str] = None
    immediate: bool = False  # If True, cancel immediately; if False, cancel at period end


class PaymentIntentResponse(BaseModel):
    """Payment intent response for frontend"""
    client_secret: Optional[str] = None  # For Stripe
    payment_url: Optional[str] = None  # For YooKassa, VK Pay, etc.
    subscription_id: str
