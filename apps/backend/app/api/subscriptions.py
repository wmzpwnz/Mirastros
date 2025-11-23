"""Subscription management API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user import User, SubscriptionTier
from app.models.subscription import PaymentMethod
from app.models.analytics_event import EventType
from app.services.analytics import AnalyticsService
from app.schemas.subscription import (
    SubscriptionCreate,
    SubscriptionResponse,
    SubscriptionStatusResponse,
    SubscriptionUpgradeRequest,
    SubscriptionCancelRequest,
    PaymentIntentResponse
)
from app.services.subscription import subscription_service

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


@router.post("/create", response_model=PaymentIntentResponse)
async def create_subscription(
    subscription_data: SubscriptionCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new subscription
    
    This creates a pending subscription and returns payment information.
    The subscription will be activated after successful payment.
    """
    # Check if user already has an active subscription
    active_subscription = await subscription_service.get_active_subscription(db, current_user.id)
    
    if active_subscription:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has an active subscription. Use upgrade endpoint instead."
        )
    
    # Validate tier
    if subscription_data.tier == SubscriptionTier.FREEMIUM:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create subscription for freemium tier"
        )
    
    try:
        # Create subscription
        subscription = await subscription_service.create_subscription(
            db,
            current_user,
            subscription_data.tier,
            subscription_data.payment_method,
            subscription_data.billing_period
        )
        
        # In a real implementation, you would:
        # 1. Create payment intent with Stripe/YooKassa/etc.
        # 2. Return client_secret or payment_url
        # For now, return placeholder
        
        return PaymentIntentResponse(
            subscription_id=str(subscription.id),
            payment_url=f"/payment/complete/{subscription.id}"  # Placeholder
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/status", response_model=SubscriptionStatusResponse)
async def get_subscription_status(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's subscription status"""
    active_subscription = await subscription_service.get_active_subscription(db, current_user.id)
    status_info = subscription_service.get_subscription_status(current_user, active_subscription)
    
    return SubscriptionStatusResponse(**status_info)


@router.post("/cancel", response_model=SubscriptionResponse)
async def cancel_subscription(
    cancel_data: SubscriptionCancelRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Cancel user's subscription
    
    - immediate=False: Cancel at period end (default)
    - immediate=True: Cancel immediately and downgrade to freemium
    """
    # Get active subscription
    active_subscription = await subscription_service.get_active_subscription(db, current_user.id)
    
    if not active_subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found"
        )
    
    # Cancel subscription
    cancelled_subscription = await subscription_service.cancel_subscription(
        db,
        active_subscription,
        immediate=cancel_data.immediate
    )
    
    # Track subscription cancellation event
    await AnalyticsService.track_event(
        db=db,
        event_type=EventType.SUBSCRIPTION_CANCELLED,
        user_id=current_user.id,
        metadata={
            "tier": cancelled_subscription.tier.value,
            "immediate": cancel_data.immediate
        }
    )
    
    return SubscriptionResponse.model_validate(cancelled_subscription)


@router.post("/upgrade", response_model=PaymentIntentResponse)
async def upgrade_subscription(
    upgrade_data: SubscriptionUpgradeRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upgrade user's subscription to a higher tier
    
    This will:
    1. Cancel the current subscription immediately
    2. Create a new subscription with the higher tier
    3. Return payment information for the upgrade
    """
    # Get active subscription
    active_subscription = await subscription_service.get_active_subscription(db, current_user.id)
    
    if not active_subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found. Use create endpoint instead."
        )
    
    try:
        # Upgrade subscription
        new_subscription = await subscription_service.upgrade_subscription(
            db,
            current_user,
            active_subscription,
            upgrade_data.new_tier,
            upgrade_data.billing_period
        )
        
        # Track subscription upgrade event
        await AnalyticsService.track_event(
            db=db,
            event_type=EventType.SUBSCRIPTION_UPGRADED,
            user_id=current_user.id,
            metadata={
                "old_tier": active_subscription.tier.value,
                "new_tier": upgrade_data.new_tier.value,
                "billing_period": upgrade_data.billing_period
            }
        )
        
        # In a real implementation, create payment intent for upgrade
        return PaymentIntentResponse(
            subscription_id=str(new_subscription.id),
            payment_url=f"/payment/complete/{new_subscription.id}"  # Placeholder
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/activate/{subscription_id}", response_model=SubscriptionResponse)
async def activate_subscription(
    subscription_id: str,
    external_payment_id: str = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Activate a pending subscription after successful payment
    
    This endpoint should be called by payment webhooks or after payment confirmation.
    In production, this should be protected and only callable by payment providers.
    """
    from sqlalchemy import select
    from app.models.subscription import Subscription
    import uuid
    
    # Get subscription
    result = await db.execute(
        select(Subscription).where(Subscription.id == uuid.UUID(subscription_id))
    )
    subscription = result.scalar_one_or_none()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    
    # Verify subscription belongs to current user
    if subscription.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to activate this subscription"
        )
    
    # Activate subscription
    activated_subscription, updated_user = await subscription_service.activate_subscription(
        db,
        subscription,
        external_payment_id
    )
    
    # Track subscription creation event
    await AnalyticsService.track_event(
        db=db,
        event_type=EventType.SUBSCRIPTION_CREATED,
        user_id=current_user.id,
        metadata={
            "tier": activated_subscription.tier.value,
            "billing_period": activated_subscription.billing_period,
            "amount": float(activated_subscription.amount)
        }
    )
    
    return SubscriptionResponse.model_validate(activated_subscription)


@router.get("/pricing")
async def get_pricing():
    """Get subscription pricing information"""
    return {
        "premium": {
            "monthly": {
                "amount": float(subscription_service.PRICING[SubscriptionTier.PREMIUM]["monthly"]),
                "currency": "USD",
                "period": "month"
            },
            "annual": {
                "amount": float(subscription_service.PRICING[SubscriptionTier.PREMIUM]["annual"]),
                "currency": "USD",
                "period": "year",
                "savings": "17%"  # (9.99*12 - 99) / (9.99*12) * 100
            }
        },
        "platinum": {
            "monthly": {
                "amount": float(subscription_service.PRICING[SubscriptionTier.PLATINUM]["monthly"]),
                "currency": "USD",
                "period": "month"
            },
            "annual": {
                "amount": float(subscription_service.PRICING[SubscriptionTier.PLATINUM]["annual"]),
                "currency": "USD",
                "period": "year",
                "savings": "17%"  # (29.99*12 - 299) / (29.99*12) * 100
            }
        }
    }
