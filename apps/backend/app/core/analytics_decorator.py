"""Decorator for tracking service usage analytics."""
import time
from functools import wraps
from typing import Callable
from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.analytics_event import EventType
from app.services.analytics import AnalyticsService
import logging

logger = logging.getLogger(__name__)


def track_service_usage(service_type: EventType):
    """
    Decorator to track service usage analytics.
    
    Usage:
        @track_service_usage(EventType.SERVICE_TAROT)
        async def get_tarot_reading(...):
            ...
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Start timer
            start_time = time.time()
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Calculate response time
            response_time_ms = int((time.time() - start_time) * 1000)
            
            # Extract db and user from kwargs
            db: AsyncSession = kwargs.get('db')
            current_user = kwargs.get('current_user')
            request: Request = kwargs.get('request')
            
            if db and current_user:
                try:
                    # Get platform from request headers
                    platform = None
                    if request:
                        platform = request.headers.get("X-Platform", "web")
                    
                    # Track event
                    await AnalyticsService.track_event(
                        db=db,
                        event_type=service_type,
                        user_id=current_user.id,
                        platform=platform,
                        response_time_ms=response_time_ms,
                        metadata={
                            "service": service_type.value.replace("service_", "")
                        }
                    )
                except Exception as e:
                    # Don't fail the request if analytics tracking fails
                    logger.error(f"Failed to track analytics: {e}")
            
            return result
        
        return wrapper
    return decorator
