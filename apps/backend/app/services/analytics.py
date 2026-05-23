"""Analytics service for tracking events and generating metrics."""
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy import func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.analytics_event import AnalyticsEvent, EventType
from app.models.user import User, SubscriptionTier
from app.models.subscription import Subscription, SubscriptionStatus
from app.services.external_analytics import external_analytics
import logging

logger = logging.getLogger(__name__)


class AnalyticsService:
    """Service for tracking analytics events and generating metrics."""
    
    @staticmethod
    async def track_event(
        db: AsyncSession,
        event_type: EventType,
        user_id: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None,
        platform: Optional[str] = None,
        session_id: Optional[str] = None,
        response_time_ms: Optional[int] = None
    ) -> AnalyticsEvent:
        """
        Track an analytics event.
        
        Args:
            db: Database session
            event_type: Type of event
            user_id: User ID (optional for anonymous events)
            metadata: Additional event data
            platform: Platform (web, mobile, telegram, vk)
            session_id: Session identifier
            response_time_ms: Response time in milliseconds
            
        Returns:
            Created analytics event
        """
        try:
            event = AnalyticsEvent(
                event_type=event_type.value,
                user_id=user_id,
                metadata=metadata or {},
                platform=platform,
                session_id=session_id,
                response_time_ms=response_time_ms,
                timestamp=datetime.now(timezone.utc)
            )
            
            db.add(event)
            await db.commit()
            await db.refresh(event)
            
            logger.info(f"Tracked event: {event_type.value} for user {user_id}")
            
            # Also send to external analytics (Mixpanel/Amplitude)
            # This is fire-and-forget, we don't wait for it
            try:
                properties = metadata.copy() if metadata else {}
                if response_time_ms:
                    properties['response_time_ms'] = response_time_ms
                
                await external_analytics.track_event(
                    event_name=event_type.value,
                    user_id=str(user_id) if user_id else None,
                    properties=properties,
                    platform=platform
                )
            except Exception as ext_error:
                # Don't fail the main tracking if external analytics fails
                logger.warning(f"Failed to send to external analytics: {ext_error}")
            
            return event
            
        except Exception as e:
            logger.error(f"Error tracking event: {e}")
            await db.rollback()
            raise
    
    @staticmethod
    async def get_user_registrations(
        db: AsyncSession,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        platform: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get user registration statistics.
        
        Args:
            db: Database session
            start_date: Start date for filtering
            end_date: End date for filtering
            platform: Platform filter
            
        Returns:
            Registration statistics
        """
        # Default to last 30 days
        if not start_date:
            start_date = datetime.now(timezone.utc) - timedelta(days=30)
        if not end_date:
            end_date = datetime.now(timezone.utc)
        
        # Build query
        query = db.query(
            func.date(AnalyticsEvent.timestamp).label('date'),
            func.count(AnalyticsEvent.id).label('count')
        ).filter(
            AnalyticsEvent.event_type == EventType.USER_REGISTERED.value,
            AnalyticsEvent.timestamp >= start_date,
            AnalyticsEvent.timestamp <= end_date
        )
        
        if platform:
            query = query.filter(AnalyticsEvent.platform == platform)
        
        query = query.group_by(func.date(AnalyticsEvent.timestamp))
        query = query.order_by(func.date(AnalyticsEvent.timestamp))
        
        result = await db.execute(query)
        daily_registrations = result.all()
        
        # Get total registrations
        total_query = db.query(func.count(AnalyticsEvent.id)).filter(
            AnalyticsEvent.event_type == EventType.USER_REGISTERED.value,
            AnalyticsEvent.timestamp >= start_date,
            AnalyticsEvent.timestamp <= end_date
        )
        
        if platform:
            total_query = total_query.filter(AnalyticsEvent.platform == platform)
        
        total_result = await db.execute(total_query)
        total = total_result.scalar()
        
        return {
            "total": total or 0,
            "daily": [{"date": str(row.date), "count": row.count} for row in daily_registrations],
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "platform": platform
        }
    
    @staticmethod
    async def get_subscription_conversions(
        db: AsyncSession,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Get subscription conversion statistics.
        
        Args:
            db: Database session
            start_date: Start date for filtering
            end_date: End date for filtering
            
        Returns:
            Subscription conversion statistics
        """
        # Default to last 30 days
        if not start_date:
            start_date = datetime.now(timezone.utc) - timedelta(days=30)
        if not end_date:
            end_date = datetime.now(timezone.utc)
        
        # Get total registrations
        registrations_query = db.query(func.count(AnalyticsEvent.id)).filter(
            AnalyticsEvent.event_type == EventType.USER_REGISTERED.value,
            AnalyticsEvent.timestamp >= start_date,
            AnalyticsEvent.timestamp <= end_date
        )
        registrations_result = await db.execute(registrations_query)
        total_registrations = registrations_result.scalar() or 0
        
        # Get subscription creations by tier
        conversions_query = db.query(
            AnalyticsEvent.metadata['tier'].astext.label('tier'),
            func.count(AnalyticsEvent.id).label('count')
        ).filter(
            AnalyticsEvent.event_type == EventType.SUBSCRIPTION_CREATED.value,
            AnalyticsEvent.timestamp >= start_date,
            AnalyticsEvent.timestamp <= end_date
        ).group_by(AnalyticsEvent.metadata['tier'].astext)
        
        conversions_result = await db.execute(conversions_query)
        conversions = conversions_result.all()
        
        # Calculate conversion rates
        tier_stats = {}
        total_conversions = 0
        
        for row in conversions:
            tier = row.tier
            count = row.count
            total_conversions += count
            tier_stats[tier] = {
                "count": count,
                "conversion_rate": (count / total_registrations * 100) if total_registrations > 0 else 0
            }
        
        overall_conversion_rate = (total_conversions / total_registrations * 100) if total_registrations > 0 else 0
        
        return {
            "total_registrations": total_registrations,
            "total_conversions": total_conversions,
            "overall_conversion_rate": round(overall_conversion_rate, 2),
            "by_tier": tier_stats,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }
    
    @staticmethod
    async def get_service_usage(
        db: AsyncSession,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Get service usage statistics.
        
        Args:
            db: Database session
            start_date: Start date for filtering
            end_date: End date for filtering
            user_id: Filter by specific user
            
        Returns:
            Service usage statistics
        """
        # Default to last 30 days
        if not start_date:
            start_date = datetime.now(timezone.utc) - timedelta(days=30)
        if not end_date:
            end_date = datetime.now(timezone.utc)
        
        # Service event types
        service_events = [
            EventType.SERVICE_TAROT.value,
            EventType.SERVICE_HOROSCOPE.value,
            EventType.SERVICE_NATAL_CHART.value,
            EventType.SERVICE_NUMEROLOGY.value,
            EventType.SERVICE_DREAM.value,
            EventType.SERVICE_RUNES.value,
            EventType.SERVICE_ICHING.value,
            EventType.SERVICE_LENORMAND.value,
            EventType.SERVICE_TRANSITS.value,
            EventType.SERVICE_SYNASTRY.value,
            EventType.SERVICE_LUNAR.value,
            EventType.SERVICE_CRYSTALS.value,
            EventType.SERVICE_RITUALS.value,
            EventType.SERVICE_HORARY.value,
            EventType.SERVICE_CHAKRA.value,
            EventType.SERVICE_SOLAR_RETURN.value,
            EventType.SERVICE_KARMIC.value,
            EventType.SERVICE_MANDALA.value,
        ]
        
        # Build query
        query = db.query(
            AnalyticsEvent.event_type,
            func.count(AnalyticsEvent.id).label('count'),
            func.avg(AnalyticsEvent.response_time_ms).label('avg_response_time')
        ).filter(
            AnalyticsEvent.event_type.in_(service_events),
            AnalyticsEvent.timestamp >= start_date,
            AnalyticsEvent.timestamp <= end_date
        )
        
        if user_id:
            query = query.filter(AnalyticsEvent.user_id == user_id)
        
        query = query.group_by(AnalyticsEvent.event_type)
        query = query.order_by(func.count(AnalyticsEvent.id).desc())
        
        result = await db.execute(query)
        service_stats = result.all()
        
        # Format results
        services = []
        total_usage = 0
        
        for row in service_stats:
            count = row.count
            total_usage += count
            services.append({
                "service": row.event_type.replace("service_", ""),
                "count": count,
                "avg_response_time_ms": round(row.avg_response_time) if row.avg_response_time else None
            })
        
        return {
            "total_usage": total_usage,
            "services": services,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "user_id": user_id
        }
    
    @staticmethod
    async def get_user_retention(
        db: AsyncSession,
        cohort_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Get user retention statistics.
        
        Args:
            db: Database session
            cohort_date: Date to analyze cohort from
            
        Returns:
            User retention statistics
        """
        # Default to 30 days ago
        if not cohort_date:
            cohort_date = datetime.now(timezone.utc) - timedelta(days=30)
        
        cohort_end = cohort_date + timedelta(days=1)
        
        # Get users registered in cohort period
        cohort_query = db.query(AnalyticsEvent.user_id).filter(
            AnalyticsEvent.event_type == EventType.USER_REGISTERED.value,
            AnalyticsEvent.timestamp >= cohort_date,
            AnalyticsEvent.timestamp < cohort_end
        ).distinct()
        
        cohort_result = await db.execute(cohort_query)
        cohort_users = [row.user_id for row in cohort_result.all()]
        cohort_size = len(cohort_users)
        
        if cohort_size == 0:
            return {
                "cohort_date": cohort_date.isoformat(),
                "cohort_size": 0,
                "retention": []
            }
        
        # Calculate retention for each week
        retention_data = []
        
        for week in range(1, 5):  # 4 weeks
            week_start = cohort_date + timedelta(weeks=week)
            week_end = week_start + timedelta(weeks=1)
            
            # Count active users in this week
            active_query = db.query(func.count(func.distinct(AnalyticsEvent.user_id))).filter(
                AnalyticsEvent.user_id.in_(cohort_users),
                AnalyticsEvent.timestamp >= week_start,
                AnalyticsEvent.timestamp < week_end
            )
            
            active_result = await db.execute(active_query)
            active_count = active_result.scalar() or 0
            
            retention_rate = (active_count / cohort_size * 100) if cohort_size > 0 else 0
            
            retention_data.append({
                "week": week,
                "active_users": active_count,
                "retention_rate": round(retention_rate, 2)
            })
        
        return {
            "cohort_date": cohort_date.isoformat(),
            "cohort_size": cohort_size,
            "retention": retention_data
        }
    
    @staticmethod
    async def get_ai_performance_metrics(
        db: AsyncSession,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Get AI performance metrics.
        
        Args:
            db: Database session
            start_date: Start date for filtering
            end_date: End date for filtering
            
        Returns:
            AI performance metrics
        """
        # Default to last 24 hours
        if not start_date:
            start_date = datetime.now(timezone.utc) - timedelta(hours=24)
        if not end_date:
            end_date = datetime.now(timezone.utc)
        
        # Get all service events with response times
        service_events = [
            EventType.SERVICE_TAROT.value,
            EventType.SERVICE_HOROSCOPE.value,
            EventType.SERVICE_NATAL_CHART.value,
            EventType.SERVICE_NUMEROLOGY.value,
            EventType.SERVICE_DREAM.value,
            EventType.SERVICE_RUNES.value,
            EventType.SERVICE_ICHING.value,
            EventType.SERVICE_LENORMAND.value,
            EventType.SERVICE_TRANSITS.value,
            EventType.SERVICE_SYNASTRY.value,
            EventType.SERVICE_LUNAR.value,
            EventType.SERVICE_CRYSTALS.value,
            EventType.SERVICE_RITUALS.value,
            EventType.SERVICE_HORARY.value,
            EventType.SERVICE_CHAKRA.value,
            EventType.SERVICE_SOLAR_RETURN.value,
            EventType.SERVICE_KARMIC.value,
            EventType.SERVICE_MANDALA.value,
            EventType.AI_CHAT_MESSAGE.value,
        ]
        
        # Get performance stats
        query = db.query(
            func.count(AnalyticsEvent.id).label('total_requests'),
            func.avg(AnalyticsEvent.response_time_ms).label('avg_response_time'),
            func.min(AnalyticsEvent.response_time_ms).label('min_response_time'),
            func.max(AnalyticsEvent.response_time_ms).label('max_response_time'),
            func.percentile_cont(0.95).within_group(AnalyticsEvent.response_time_ms).label('p95_response_time')
        ).filter(
            AnalyticsEvent.event_type.in_(service_events),
            AnalyticsEvent.timestamp >= start_date,
            AnalyticsEvent.timestamp <= end_date,
            AnalyticsEvent.response_time_ms.isnot(None)
        )
        
        result = await db.execute(query)
        stats = result.first()
        
        # Get token usage from metadata
        token_query = db.query(
            func.sum(AnalyticsEvent.metadata['tokens_used'].astext.cast(Integer)).label('total_tokens')
        ).filter(
            AnalyticsEvent.event_type.in_(service_events),
            AnalyticsEvent.timestamp >= start_date,
            AnalyticsEvent.timestamp <= end_date,
            AnalyticsEvent.metadata['tokens_used'].astext.isnot(None)
        )
        
        token_result = await db.execute(token_query)
        total_tokens = token_result.scalar() or 0
        
        return {
            "total_requests": stats.total_requests or 0,
            "avg_response_time_ms": round(stats.avg_response_time) if stats.avg_response_time else None,
            "min_response_time_ms": stats.min_response_time,
            "max_response_time_ms": stats.max_response_time,
            "p95_response_time_ms": round(stats.p95_response_time) if stats.p95_response_time else None,
            "total_tokens_used": total_tokens,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }
