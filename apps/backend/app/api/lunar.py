"""Lunar calendar API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import date, timedelta
import logging

from app.core.database import get_db
from app.core.deps import get_current_user, get_optional_user
from app.core.redis import redis_client
from app.models.user import User, SubscriptionTier
from app.schemas.lunar import (
    LunarPhaseResponse,
    LunarRecommendationsResponse,
    LunarCalendarResponse,
    ActivityRecommendation
)
from app.services.lunar import lunar_service
from app.services.natal_chart import natal_chart_service
from app.services.llm import llm_service
from app.services.rag import rag_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/lunar", tags=["Lunar Calendar"])


@router.get("/current", response_model=LunarPhaseResponse)
async def get_current_lunar_phase(
    target_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get current lunar phase information
    
    Available to all users.
    """
    try:
        if target_date is None:
            target_date = date.today()
        
        # Check Redis cache
        cache_key = f"lunar:phase:{target_date.isoformat()}"
        cached = await redis_client.get(cache_key)
        
        if cached:
            logger.info(f"Returning cached lunar phase for {target_date}")
            return LunarPhaseResponse(**cached)
        
        # Calculate lunar phase
        logger.info(f"Calculating lunar phase for {target_date}")
        lunar_data = lunar_service.calculate_lunar_phase(target_date)
        
        response_data = {
            "phase": lunar_data["phase"],
            "phase_name": lunar_data["phase_name"],
            "illumination": lunar_data["illumination"],
            "date": lunar_data["date"],
            "zodiac_sign": lunar_data["zodiac_sign"],
            "moon_degree": lunar_data["moon_degree"],
            "next_full_moon": lunar_data["next_full_moon"],
            "next_new_moon": lunar_data["next_new_moon"],
            "description": lunar_data["description"]
        }
        
        # Cache for 6 hours
        await redis_client.set(cache_key, response_data, ttl=21600)
        
        return LunarPhaseResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Error getting lunar phase: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate lunar phase"
        )


@router.get("/recommendations", response_model=LunarRecommendationsResponse)
async def get_lunar_recommendations(
    target_date: Optional[date] = None,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get activity recommendations based on lunar calendar
    
    Available to Premium and Platinum users.
    Freemium users get basic recommendations without personalization.
    """
    try:
        if target_date is None:
            target_date = date.today()
        
        # Check subscription tier for personalization
        is_personalized = False
        natal_chart = None
        
        if current_user:
            if current_user.subscription_tier in [SubscriptionTier.PREMIUM, SubscriptionTier.PLATINUM]:
                # Try to get natal chart for personalization
                natal_chart = await natal_chart_service.get_natal_chart(db, str(current_user.id))
                if natal_chart:
                    is_personalized = True
        
        # Check Redis cache (only for non-personalized)
        if not is_personalized:
            cache_key = f"lunar:recommendations:{target_date.isoformat()}"
            cached = await redis_client.get(cache_key)
            
            if cached:
                logger.info(f"Returning cached lunar recommendations for {target_date}")
                return LunarRecommendationsResponse(**cached)
        
        # Generate recommendations
        logger.info(f"Generating lunar recommendations for {target_date}")
        recommendations_data = lunar_service.generate_activity_recommendations(
            target_date=target_date,
            natal_chart=natal_chart if is_personalized else None
        )
        
        # Convert to response format
        recommendations = [
            ActivityRecommendation(**rec)
            for rec in recommendations_data["recommendations"]
        ]
        
        response_data = {
            "date": recommendations_data["date"],
            "lunar_phase": recommendations_data["lunar_phase"],
            "moon_sign": recommendations_data["moon_sign"],
            "recommendations": recommendations,
            "general_advice": recommendations_data["general_advice"],
            "is_personalized": recommendations_data["is_personalized"]
        }
        
        # Cache for 6 hours if not personalized
        if not is_personalized:
            await redis_client.set(cache_key, response_data, ttl=21600)
        
        return LunarRecommendationsResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Error generating lunar recommendations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate lunar recommendations"
        )


@router.get("/calendar", response_model=LunarCalendarResponse)
async def get_lunar_calendar(
    start_date: Optional[date] = None,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get lunar calendar for a period
    
    Requires Premium or Platinum subscription.
    Shows favorable and unfavorable days for various activities.
    """
    try:
        # Check subscription tier
        if current_user.subscription_tier == SubscriptionTier.FREEMIUM:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Lunar calendar requires Premium or Platinum subscription"
            )
        
        if start_date is None:
            start_date = date.today()
        
        # Limit days to reasonable range
        if days < 1 or days > 90:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Days must be between 1 and 90"
            )
        
        # Check Redis cache
        cache_key = f"lunar:calendar:{start_date.isoformat()}:{days}"
        cached = await redis_client.get(cache_key)
        
        if cached:
            logger.info(f"Returning cached lunar calendar")
            return LunarCalendarResponse(**cached)
        
        # Generate calendar
        logger.info(f"Generating lunar calendar from {start_date} for {days} days")
        calendar_data = lunar_service.generate_lunar_calendar(
            start_date=start_date,
            days=days
        )
        
        response_data = {
            "start_date": calendar_data["start_date"],
            "end_date": calendar_data["end_date"],
            "days": calendar_data["days"],
            "special_events": calendar_data["special_events"]
        }
        
        # Cache for 12 hours
        await redis_client.set(cache_key, response_data, ttl=43200)
        
        return LunarCalendarResponse(**response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating lunar calendar: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate lunar calendar"
        )


@router.get("/best-days/{activity}")
async def get_best_days_for_activity(
    activity: str,
    start_date: Optional[date] = None,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get best days for a specific activity
    
    Requires Premium or Platinum subscription.
    Returns dates ranked by favorability for the specified activity.
    """
    try:
        # Check subscription tier
        if current_user.subscription_tier == SubscriptionTier.FREEMIUM:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Activity planning requires Premium or Platinum subscription"
            )
        
        if start_date is None:
            start_date = date.today()
        
        # Limit days to reasonable range
        if days < 1 or days > 90:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Days must be between 1 and 90"
            )
        
        logger.info(f"Finding best days for {activity} from {start_date}")
        
        # Generate recommendations for each day
        activity_scores = []
        
        for day_offset in range(days):
            current_date = start_date + timedelta(days=day_offset)
            recommendations_data = lunar_service.generate_activity_recommendations(current_date)
            
            # Find the activity in recommendations
            for rec in recommendations_data["recommendations"]:
                if rec["activity"].lower() == activity.lower():
                    activity_scores.append({
                        "date": current_date,
                        "score": rec["score"],
                        "favorability": rec["favorability"],
                        "lunar_phase": recommendations_data["lunar_phase"],
                        "moon_sign": recommendations_data["moon_sign"],
                        "recommendation": rec["recommendation"]
                    })
                    break
        
        # Sort by score (descending)
        activity_scores.sort(key=lambda x: x["score"], reverse=True)
        
        # Get top 10 best days
        best_days = activity_scores[:10]
        
        return {
            "activity": activity,
            "start_date": start_date,
            "end_date": start_date + timedelta(days=days - 1),
            "best_days": best_days,
            "total_days_analyzed": days
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error finding best days for activity: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to find best days for activity"
        )


@router.get("/moon-sign-influence")
async def get_moon_sign_influence(
    target_date: Optional[date] = None,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed information about current Moon sign influence
    
    Available to all users.
    Premium/Platinum users get AI-enhanced interpretation.
    """
    try:
        if target_date is None:
            target_date = date.today()
        
        # Get lunar phase data
        lunar_data = lunar_service.calculate_lunar_phase(target_date)
        moon_sign = lunar_data["zodiac_sign"]
        
        # Check if Premium/Platinum for AI interpretation
        use_ai = False
        if current_user and current_user.subscription_tier in [SubscriptionTier.PREMIUM, SubscriptionTier.PLATINUM]:
            use_ai = True
        
        # Get basic influence data
        influence_data = {
            "date": target_date,
            "moon_sign": moon_sign,
            "lunar_phase": lunar_data["phase_name"],
            "illumination": lunar_data["illumination"],
            "moon_degree": lunar_data["moon_degree"]
        }
        
        if use_ai:
            # Generate AI interpretation
            context = await rag_service.get_context(
                db=db,
                query=f"Moon in {moon_sign} influence astrology",
                category="astrology"
            )
            
            prompt = f"""Provide a detailed interpretation of the Moon in {moon_sign} influence for {target_date.strftime('%B %d, %Y')}.

Current lunar phase: {lunar_data['phase_name']} ({lunar_data['illumination']:.0f}% illuminated)

Please include:
1. Emotional and psychological influence (100 words)
2. Best activities and focus areas (50 words)
3. Potential challenges to be aware of (50 words)
4. Practical advice for the day (50 words)

Keep the tone mystical yet practical."""
            
            interpretation = await llm_service.generate(
                prompt=prompt,
                context=context,
                max_tokens=512,
                temperature=0.7
            )
            
            influence_data["ai_interpretation"] = interpretation
        else:
            # Basic interpretation
            influence_data["basic_interpretation"] = lunar_data["description"]
        
        return influence_data
        
    except Exception as e:
        logger.error(f"Error getting moon sign influence: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get moon sign influence"
        )
