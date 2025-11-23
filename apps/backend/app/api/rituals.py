"""Rituals and meditation API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import date
import logging

from app.core.database import get_db
from app.core.deps import get_current_user, get_optional_user
from app.core.redis import redis_client
from app.models.user import User, SubscriptionTier
from app.schemas.rituals import (
    MeditationRequest,
    MeditationResponse,
    LunarRitualRequest,
    LunarRitualResponse,
    DailyAffirmationsRequest,
    DailyAffirmationsResponse,
    RitualLibraryResponse,
    PersonalizedRitualRecommendation
)
from app.services.rituals import rituals_service
from app.services.natal_chart import natal_chart_service
from app.services.lunar import lunar_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/rituals", tags=["Rituals and Meditation"])


@router.post("/meditation", response_model=MeditationResponse)
async def generate_meditation(
    request: MeditationRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate personalized meditation script
    
    Available to all users.
    Premium/Platinum users get personalized scripts based on natal chart.
    """
    try:
        natal_chart = None
        
        # Check if user wants personalization and has access
        if request.personalize and current_user:
            if current_user.subscription_tier in [SubscriptionTier.PREMIUM, SubscriptionTier.PLATINUM]:
                # Try to get natal chart
                natal_chart = await natal_chart_service.get_natal_chart(db, str(current_user.id))
                if not natal_chart:
                    logger.warning(f"User {current_user.id} requested personalization but has no natal chart")
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Personalized meditations require Premium or Platinum subscription"
                )
        
        # Check Redis cache for non-personalized meditations
        if not natal_chart:
            cache_key = f"meditation:{request.goal}:{request.duration}"
            cached = await redis_client.get(cache_key)
            
            if cached:
                logger.info(f"Returning cached meditation for {request.goal}")
                return MeditationResponse(**cached)
        
        # Generate meditation
        logger.info(f"Generating meditation for goal: {request.goal}, duration: {request.duration}")
        meditation_data = rituals_service.generate_meditation_script(
            goal=request.goal,
            duration=int(request.duration),
            natal_chart=natal_chart
        )
        
        response_data = {
            "goal": meditation_data["goal"],
            "duration": meditation_data["duration"],
            "script": meditation_data["script"],
            "affirmations": meditation_data["affirmations"],
            "chakra": meditation_data["chakra"],
            "element": meditation_data["element"],
            "best_time": meditation_data["best_time"],
            "is_personalized": meditation_data["is_personalized"]
        }
        
        # Cache for 24 hours if not personalized
        if not natal_chart:
            await redis_client.set(cache_key, response_data, ttl=86400)
        
        return MeditationResponse(**response_data)
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error generating meditation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate meditation script"
        )


@router.post("/lunar-ritual", response_model=LunarRitualResponse)
async def get_lunar_ritual(
    request: LunarRitualRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get lunar phase ritual
    
    Available to all users.
    Premium/Platinum users get personalized rituals based on natal chart.
    """
    try:
        natal_chart = None
        
        # Check if user wants personalization and has access
        if request.personalize and current_user:
            if current_user.subscription_tier in [SubscriptionTier.PREMIUM, SubscriptionTier.PLATINUM]:
                # Try to get natal chart
                natal_chart = await natal_chart_service.get_natal_chart(db, str(current_user.id))
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Personalized rituals require Premium or Platinum subscription"
                )
        
        # Check Redis cache for non-personalized rituals
        if not natal_chart:
            cache_key = f"ritual:lunar:{request.phase}"
            cached = await redis_client.get(cache_key)
            
            if cached:
                logger.info(f"Returning cached lunar ritual for {request.phase}")
                return LunarRitualResponse(**cached)
        
        # Get ritual
        logger.info(f"Getting lunar ritual for phase: {request.phase}")
        ritual_data = rituals_service.get_lunar_ritual(
            phase=request.phase,
            natal_chart=natal_chart
        )
        
        response_data = {
            "name": ritual_data["name"],
            "phase": ritual_data["phase"],
            "purpose": ritual_data["purpose"],
            "duration": ritual_data["duration"],
            "best_time": ritual_data["best_time"],
            "items_needed": ritual_data["items_needed"],
            "steps": ritual_data["steps"],
            "affirmations": ritual_data["affirmations"],
            "is_personalized": ritual_data["is_personalized"],
            "personalization_notes": ritual_data.get("personalization_notes")
        }
        
        # Cache for 24 hours if not personalized
        if not natal_chart:
            await redis_client.set(cache_key, response_data, ttl=86400)
        
        return LunarRitualResponse(**response_data)
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error getting lunar ritual: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get lunar ritual"
        )


@router.post("/daily-affirmations", response_model=DailyAffirmationsResponse)
async def get_daily_affirmations(
    request: DailyAffirmationsRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get daily affirmations
    
    Available to all users.
    Premium/Platinum users get personalized affirmations based on natal chart.
    """
    try:
        natal_chart = None
        current_moon_sign = None
        
        # Get current moon sign
        try:
            lunar_data = lunar_service.calculate_lunar_phase()
            current_moon_sign = lunar_data.get("zodiac_sign")
        except Exception as e:
            logger.warning(f"Could not get current moon sign: {str(e)}")
        
        # Check if user wants personalization and has access
        if request.personalize and current_user:
            if current_user.subscription_tier in [SubscriptionTier.PREMIUM, SubscriptionTier.PLATINUM]:
                # Try to get natal chart
                natal_chart = await natal_chart_service.get_natal_chart(db, str(current_user.id))
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Personalized affirmations require Premium or Platinum subscription"
                )
        
        # Check Redis cache for non-personalized affirmations
        today = date.today()
        if not natal_chart:
            cache_key = f"affirmations:{today.isoformat()}:{request.count}"
            cached = await redis_client.get(cache_key)
            
            if cached:
                logger.info(f"Returning cached daily affirmations")
                return DailyAffirmationsResponse(**cached)
        
        # Generate affirmations
        logger.info(f"Generating {request.count} daily affirmations")
        affirmations_data = rituals_service.generate_daily_affirmations(
            count=request.count,
            natal_chart=natal_chart,
            current_moon_sign=current_moon_sign
        )
        
        response_data = {
            "date": affirmations_data["date"],
            "affirmations": affirmations_data["affirmations"],
            "zodiac_sign": affirmations_data.get("zodiac_sign"),
            "moon_sign": affirmations_data.get("moon_sign"),
            "is_personalized": affirmations_data["is_personalized"],
            "theme": affirmations_data["theme"]
        }
        
        # Cache for 24 hours if not personalized
        if not natal_chart:
            await redis_client.set(cache_key, response_data, ttl=86400)
        
        return DailyAffirmationsResponse(**response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating daily affirmations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate daily affirmations"
        )


@router.get("/library", response_model=RitualLibraryResponse)
async def get_ritual_library(
    db: AsyncSession = Depends(get_db)
):
    """
    Get library of available rituals
    
    Available to all users.
    Shows all available rituals and meditations.
    """
    try:
        # Check Redis cache
        cache_key = "ritual:library"
        cached = await redis_client.get(cache_key)
        
        if cached:
            logger.info("Returning cached ritual library")
            return RitualLibraryResponse(**cached)
        
        # Get library
        logger.info("Getting ritual library")
        library_data = rituals_service.get_ritual_library()
        
        response_data = {
            "rituals": library_data["rituals"],
            "total": library_data["total"],
            "categories": library_data["categories"]
        }
        
        # Cache for 7 days (library doesn't change often)
        await redis_client.set(cache_key, response_data, ttl=604800)
        
        return RitualLibraryResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Error getting ritual library: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get ritual library"
        )


@router.get("/recommendations", response_model=list[PersonalizedRitualRecommendation])
async def get_ritual_recommendations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get personalized ritual recommendations
    
    Requires Premium or Platinum subscription.
    Recommends rituals based on natal chart and current transits.
    """
    try:
        # Check subscription tier
        if current_user.subscription_tier == SubscriptionTier.FREEMIUM:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Ritual recommendations require Premium or Platinum subscription"
            )
        
        # Get natal chart
        natal_chart = await natal_chart_service.get_natal_chart(db, str(current_user.id))
        if not natal_chart:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Natal chart not found. Please calculate your natal chart first."
            )
        
        # Get current lunar phase
        lunar_data = lunar_service.calculate_lunar_phase()
        current_phase = lunar_data["phase"]
        
        # Get recommendations
        logger.info(f"Getting ritual recommendations for user {current_user.id}")
        recommendations = rituals_service.get_ritual_recommendations(
            natal_chart=natal_chart,
            current_lunar_phase=current_phase,
            current_transits=None  # TODO: Add transits when available
        )
        
        return [PersonalizedRitualRecommendation(**rec) for rec in recommendations]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting ritual recommendations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get ritual recommendations"
        )


@router.get("/current-lunar-ritual", response_model=LunarRitualResponse)
async def get_current_lunar_ritual(
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get ritual for current lunar phase
    
    Available to all users.
    Automatically determines current lunar phase and returns appropriate ritual.
    """
    try:
        # Get current lunar phase
        lunar_data = lunar_service.calculate_lunar_phase()
        current_phase = lunar_data["phase"]
        
        natal_chart = None
        
        # Get natal chart for personalization if Premium/Platinum
        if current_user and current_user.subscription_tier in [SubscriptionTier.PREMIUM, SubscriptionTier.PLATINUM]:
            natal_chart = await natal_chart_service.get_natal_chart(db, str(current_user.id))
        
        # Get ritual
        logger.info(f"Getting ritual for current lunar phase: {current_phase}")
        ritual_data = rituals_service.get_lunar_ritual(
            phase=current_phase,
            natal_chart=natal_chart
        )
        
        return LunarRitualResponse(**ritual_data)
        
    except Exception as e:
        logger.error(f"Error getting current lunar ritual: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get current lunar ritual"
        )
