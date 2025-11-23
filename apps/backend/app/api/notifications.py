"""
Notification API endpoints for push notifications
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.notifications import (
    PushTokenRegister,
    PushTokenUnregister,
    TransitSubscription,
    LunarSubscription,
    NotificationPreferences,
)
from app.services.notifications import NotificationService

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.post("/register")
async def register_push_token(
    data: PushTokenRegister,
    db: AsyncSession = Depends(get_db),
):
    """Register a push notification token for a user"""
    try:
        await NotificationService.register_push_token(
            db=db,
            user_id=data.user_id,
            push_token=data.push_token,
            platform=data.platform,
            device_type=data.device_type,
        )
        return {"message": "Push token registered successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/unregister")
async def unregister_push_token(
    data: PushTokenUnregister,
    db: AsyncSession = Depends(get_db),
):
    """Unregister a push notification token"""
    try:
        await NotificationService.unregister_push_token(
            db=db,
            user_id=data.user_id,
            push_token=data.push_token,
        )
        return {"message": "Push token unregistered successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/subscribe/transits")
async def subscribe_to_transits(
    data: TransitSubscription,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Subscribe to transit notifications (Platinum tier only)"""
    if current_user.subscription_tier != "platinum":
        raise HTTPException(
            status_code=403,
            detail="Transit notifications are only available for Platinum subscribers"
        )
    
    try:
        await NotificationService.subscribe_to_transits(
            db=db,
            user_id=data.user_id,
            transit_types=data.transit_types,
        )
        return {"message": "Subscribed to transit notifications"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/unsubscribe/transits")
async def unsubscribe_from_transits(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Unsubscribe from transit notifications"""
    try:
        await NotificationService.unsubscribe_from_transits(
            db=db,
            user_id=user_id,
        )
        return {"message": "Unsubscribed from transit notifications"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/subscribe/lunar")
async def subscribe_to_lunar(
    data: LunarSubscription,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Subscribe to lunar phase notifications (Platinum tier only)"""
    if current_user.subscription_tier != "platinum":
        raise HTTPException(
            status_code=403,
            detail="Lunar notifications are only available for Platinum subscribers"
        )
    
    try:
        await NotificationService.subscribe_to_lunar(
            db=db,
            user_id=data.user_id,
        )
        return {"message": "Subscribed to lunar notifications"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/preferences/{user_id}")
async def get_notification_preferences(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get user's notification preferences"""
    try:
        preferences = await NotificationService.get_preferences(
            db=db,
            user_id=user_id,
        )
        return preferences
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/preferences/{user_id}")
async def update_notification_preferences(
    user_id: str,
    preferences: NotificationPreferences,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update user's notification preferences"""
    try:
        await NotificationService.update_preferences(
            db=db,
            user_id=user_id,
            preferences=preferences,
        )
        return {"message": "Notification preferences updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/send/transit")
async def send_transit_notification(
    user_id: str,
    transit_name: str,
    transit_description: str,
    db: AsyncSession = Depends(get_db),
):
    """Send a transit notification to a user (internal use)"""
    try:
        await NotificationService.send_transit_notification(
            db=db,
            user_id=user_id,
            transit_name=transit_name,
            transit_description=transit_description,
        )
        return {"message": "Transit notification sent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/send/lunar")
async def send_lunar_notification(
    user_id: str,
    phase_name: str,
    phase_description: str,
    db: AsyncSession = Depends(get_db),
):
    """Send a lunar phase notification to a user (internal use)"""
    try:
        await NotificationService.send_lunar_notification(
            db=db,
            user_id=user_id,
            phase_name=phase_name,
            phase_description=phase_description,
        )
        return {"message": "Lunar notification sent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
