"""Analytics API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from typing import Optional
from app.core.deps import get_db, get_current_user, require_admin
from app.services.analytics import AnalyticsService
from app.models.user import User
from app.models.analytics_event import EventType
from pydantic import BaseModel

router = APIRouter(prefix="/analytics", tags=["analytics"])


class TrackEventRequest(BaseModel):
    """Request model for tracking events."""
    event_type: EventType
    metadata: Optional[dict] = None
    platform: Optional[str] = None
    session_id: Optional[str] = None
    response_time_ms: Optional[int] = None


@router.post("/track")
async def track_event(
    request: TrackEventRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Track an analytics event.
    
    This endpoint can be called from frontend applications to track user actions.
    """
    try:
        event = await AnalyticsService.track_event(
            db=db,
            event_type=request.event_type,
            user_id=current_user.id if current_user else None,
            metadata=request.metadata,
            platform=request.platform,
            session_id=request.session_id,
            response_time_ms=request.response_time_ms
        )
        
        return {
            "success": True,
            "event_id": event.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/registrations")
async def get_registrations(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    platform: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    Get user registration statistics.
    
    Requires admin role.
    """
    try:
        stats = await AnalyticsService.get_user_registrations(
            db=db,
            start_date=start_date,
            end_date=end_date,
            platform=platform
        )
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversions")
async def get_conversions(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    Get subscription conversion statistics.
    
    Requires admin role.
    """
    try:
        stats = await AnalyticsService.get_subscription_conversions(
            db=db,
            start_date=start_date,
            end_date=end_date
        )
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/service-usage")
async def get_service_usage(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    user_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get service usage statistics.
    
    Admin users can see all usage. Regular users can only see their own.
    """
    try:
        # Non-admin users can only see their own stats
        if not current_user.is_admin and user_id != current_user.id:
            user_id = current_user.id
        
        stats = await AnalyticsService.get_service_usage(
            db=db,
            start_date=start_date,
            end_date=end_date,
            user_id=user_id
        )
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/retention")
async def get_retention(
    cohort_date: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    Get user retention statistics.
    
    Requires admin role.
    """
    try:
        stats = await AnalyticsService.get_user_retention(
            db=db,
            cohort_date=cohort_date
        )
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ai-performance")
async def get_ai_performance(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    Get AI performance metrics.
    
    Requires admin role.
    """
    try:
        stats = await AnalyticsService.get_ai_performance_metrics(
            db=db,
            start_date=start_date,
            end_date=end_date
        )
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
