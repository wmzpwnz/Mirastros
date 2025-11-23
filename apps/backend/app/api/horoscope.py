"""Horoscope API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import date, timedelta
import json
import logging

from app.core.database import get_db
from app.core.deps import get_current_user, get_optional_user
from app.core.redis import redis_client
from app.models.user import User, SubscriptionTier
from app.schemas.horoscope import (
    HoroscopeRequest,
    HoroscopeResponse,
    CompatibilityRequest,
    CompatibilityResponse,
    ZodiacSign,
    HoroscopePeriod
)
from app.services.horoscope import horoscope_service
from app.services.natal_chart import natal_chart_service
from app.services.llm import llm_service
from app.services.rag import rag_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/horoscope", tags=["Horoscope"])


@router.get("/daily/{sign}", response_model=HoroscopeResponse)
async def get_daily_horoscope(
    sign: ZodiacSign,
    target_date: Optional[date] = None,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get daily horoscope for a zodiac sign
    
    Available to all users (Freemium: 1 per day, Premium/Platinum: unlimited).
    Caches general horoscopes in Redis for 24 hours.
    """
    try:
        if target_date is None:
            target_date = date.today()
        
        # Check if personalized horoscope requested (requires Premium/Platinum)
        is_personalized = False
        natal_chart = None
        
        if current_user:
            # Check subscription tier for personalization
            if current_user.subscription_tier in [SubscriptionTier.PREMIUM, SubscriptionTier.PLATINUM]:
                # Try to get natal chart for personalization
                natal_chart = await natal_chart_service.get_natal_chart(db, str(current_user.id))
                if natal_chart:
                    is_personalized = True
        
        # Try Redis cache first (only for general horoscopes)
        if not is_personalized:
            cache_key = f"horoscope:daily:{sign.value}:{target_date.isoformat()}"
            cached = await redis_client.get(cache_key)
            
            if cached:
                logger.info(f"Returning cached daily horoscope for {sign.value}")
                return HoroscopeResponse(**cached)
        
        # Check database cache
        user_id = str(current_user.id) if (current_user and is_personalized) else None
        db_horoscope = await horoscope_service.get_cached_horoscope(
            db=db,
            sign=sign.value,
            period="daily",
            target_date=target_date,
            user_id=user_id
        )
        
        if db_horoscope:
            logger.info(f"Returning database cached horoscope for {sign.value}")
            response_data = {
                "sign": db_horoscope.zodiac_sign,
                "period": db_horoscope.period,
                "date": db_horoscope.date,
                "prediction": db_horoscope.prediction,
                "lucky_numbers": db_horoscope.lucky_numbers,
                "lucky_colors": db_horoscope.lucky_colors,
                "compatibility_signs": db_horoscope.compatibility_signs,
                "advice": db_horoscope.advice,
                "is_personalized": db_horoscope.is_personalized == "true",
                "transit_data": db_horoscope.transit_data
            }
            
            # Cache in Redis if general horoscope
            if not is_personalized:
                await redis_client.set(cache_key, response_data, ttl=86400)  # 24 hours
            
            return HoroscopeResponse(**response_data)
        
        # Generate new horoscope
        logger.info(f"Generating new daily horoscope for {sign.value}")
        
        # Calculate transits
        transits = horoscope_service.calculate_current_transits(target_date)
        transit_data = None
        
        if is_personalized and natal_chart:
            transit_data = horoscope_service.calculate_personalized_transits(natal_chart, target_date)
            transits = transit_data.get("current_transits", transits)
        
        # Get RAG context
        context = await rag_service.get_context(
            db=db,
            query=f"daily horoscope {sign.value} astrology prediction",
            category="astrology"
        )
        
        # Generate horoscope prompt
        prompt = horoscope_service.generate_horoscope_prompt(
            sign=sign.value,
            period="daily",
            target_date=target_date,
            transits=transits,
            natal_chart=natal_chart if is_personalized else None
        )
        
        # Generate with LLM
        prediction = await llm_service.generate(
            prompt=prompt,
            context=context,
            max_tokens=512,
            temperature=0.7
        )
        
        # Generate additional data
        lucky_numbers = horoscope_service.generate_lucky_numbers(sign.value, target_date)
        lucky_colors = horoscope_service.generate_lucky_colors(sign.value)
        compatibility_signs = horoscope_service.get_compatible_signs(sign.value)
        
        # Extract advice (last paragraph of prediction)
        advice_parts = prediction.strip().split('\n\n')
        advice = advice_parts[-1] if len(advice_parts) > 1 else "Trust your intuition today."
        
        # Save to database
        db_horoscope = await horoscope_service.save_horoscope(
            db=db,
            sign=sign.value,
            period="daily",
            target_date=target_date,
            prediction=prediction,
            lucky_numbers=lucky_numbers,
            lucky_colors=lucky_colors,
            compatibility_signs=compatibility_signs,
            advice=advice,
            user_id=user_id,
            is_personalized=is_personalized,
            transit_data=transit_data
        )
        
        response_data = {
            "sign": db_horoscope.zodiac_sign,
            "period": db_horoscope.period,
            "date": db_horoscope.date,
            "prediction": db_horoscope.prediction,
            "lucky_numbers": db_horoscope.lucky_numbers,
            "lucky_colors": db_horoscope.lucky_colors,
            "compatibility_signs": db_horoscope.compatibility_signs,
            "advice": db_horoscope.advice,
            "is_personalized": db_horoscope.is_personalized == "true",
            "transit_data": db_horoscope.transit_data
        }
        
        # Cache in Redis if general horoscope
        if not is_personalized:
            await redis_client.set(cache_key, response_data, ttl=86400)  # 24 hours
        
        return HoroscopeResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Error generating daily horoscope: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate horoscope"
        )


@router.get("/weekly/{sign}", response_model=HoroscopeResponse)
async def get_weekly_horoscope(
    sign: ZodiacSign,
    target_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get weekly horoscope for a zodiac sign
    
    Requires Premium or Platinum subscription.
    """
    try:
        # Check subscription tier
        if current_user.subscription_tier == SubscriptionTier.FREEMIUM:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Weekly horoscopes require Premium or Platinum subscription"
            )
        
        if target_date is None:
            target_date = date.today()
        
        # Get start of week (Monday)
        week_start = target_date - timedelta(days=target_date.weekday())
        
        # Check for personalization
        natal_chart = await natal_chart_service.get_natal_chart(db, str(current_user.id))
        is_personalized = natal_chart is not None
        
        # Check database cache
        db_horoscope = await horoscope_service.get_cached_horoscope(
            db=db,
            sign=sign.value,
            period="weekly",
            target_date=week_start,
            user_id=str(current_user.id) if is_personalized else None
        )
        
        if db_horoscope:
            logger.info(f"Returning cached weekly horoscope for {sign.value}")
            return HoroscopeResponse(
                sign=db_horoscope.zodiac_sign,
                period=db_horoscope.period,
                date=db_horoscope.date,
                prediction=db_horoscope.prediction,
                lucky_numbers=db_horoscope.lucky_numbers,
                lucky_colors=db_horoscope.lucky_colors,
                compatibility_signs=db_horoscope.compatibility_signs,
                advice=db_horoscope.advice,
                is_personalized=db_horoscope.is_personalized == "true",
                transit_data=db_horoscope.transit_data
            )
        
        # Generate new weekly horoscope
        logger.info(f"Generating new weekly horoscope for {sign.value}")
        
        transits = horoscope_service.calculate_current_transits(week_start)
        transit_data = None
        
        if is_personalized and natal_chart:
            transit_data = horoscope_service.calculate_personalized_transits(natal_chart, week_start)
            transits = transit_data.get("current_transits", transits)
        
        context = await rag_service.get_context(
            db=db,
            query=f"weekly horoscope {sign.value} astrology forecast",
            category="astrology"
        )
        
        prompt = horoscope_service.generate_horoscope_prompt(
            sign=sign.value,
            period="weekly",
            target_date=week_start,
            transits=transits,
            natal_chart=natal_chart if is_personalized else None
        )
        
        prediction = await llm_service.generate(
            prompt=prompt,
            context=context,
            max_tokens=768,
            temperature=0.7
        )
        
        lucky_numbers = horoscope_service.generate_lucky_numbers(sign.value, week_start)
        lucky_colors = horoscope_service.generate_lucky_colors(sign.value)
        compatibility_signs = horoscope_service.get_compatible_signs(sign.value)
        
        advice_parts = prediction.strip().split('\n\n')
        advice = advice_parts[-1] if len(advice_parts) > 1 else "Focus on your goals this week."
        
        db_horoscope = await horoscope_service.save_horoscope(
            db=db,
            sign=sign.value,
            period="weekly",
            target_date=week_start,
            prediction=prediction,
            lucky_numbers=lucky_numbers,
            lucky_colors=lucky_colors,
            compatibility_signs=compatibility_signs,
            advice=advice,
            user_id=str(current_user.id) if is_personalized else None,
            is_personalized=is_personalized,
            transit_data=transit_data
        )
        
        return HoroscopeResponse(
            sign=db_horoscope.zodiac_sign,
            period=db_horoscope.period,
            date=db_horoscope.date,
            prediction=db_horoscope.prediction,
            lucky_numbers=db_horoscope.lucky_numbers,
            lucky_colors=db_horoscope.lucky_colors,
            compatibility_signs=db_horoscope.compatibility_signs,
            advice=db_horoscope.advice,
            is_personalized=db_horoscope.is_personalized == "true",
            transit_data=db_horoscope.transit_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating weekly horoscope: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate weekly horoscope"
        )


@router.get("/monthly/{sign}", response_model=HoroscopeResponse)
async def get_monthly_horoscope(
    sign: ZodiacSign,
    target_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get monthly horoscope for a zodiac sign
    
    Requires Premium or Platinum subscription.
    """
    try:
        # Check subscription tier
        if current_user.subscription_tier == SubscriptionTier.FREEMIUM:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Monthly horoscopes require Premium or Platinum subscription"
            )
        
        if target_date is None:
            target_date = date.today()
        
        # Get first day of month
        month_start = target_date.replace(day=1)
        
        # Check for personalization
        natal_chart = await natal_chart_service.get_natal_chart(db, str(current_user.id))
        is_personalized = natal_chart is not None
        
        # Check database cache
        db_horoscope = await horoscope_service.get_cached_horoscope(
            db=db,
            sign=sign.value,
            period="monthly",
            target_date=month_start,
            user_id=str(current_user.id) if is_personalized else None
        )
        
        if db_horoscope:
            logger.info(f"Returning cached monthly horoscope for {sign.value}")
            return HoroscopeResponse(
                sign=db_horoscope.zodiac_sign,
                period=db_horoscope.period,
                date=db_horoscope.date,
                prediction=db_horoscope.prediction,
                lucky_numbers=db_horoscope.lucky_numbers,
                lucky_colors=db_horoscope.lucky_colors,
                compatibility_signs=db_horoscope.compatibility_signs,
                advice=db_horoscope.advice,
                is_personalized=db_horoscope.is_personalized == "true",
                transit_data=db_horoscope.transit_data
            )
        
        # Generate new monthly horoscope
        logger.info(f"Generating new monthly horoscope for {sign.value}")
        
        transits = horoscope_service.calculate_current_transits(month_start)
        transit_data = None
        
        if is_personalized and natal_chart:
            transit_data = horoscope_service.calculate_personalized_transits(natal_chart, month_start)
            transits = transit_data.get("current_transits", transits)
        
        context = await rag_service.get_context(
            db=db,
            query=f"monthly horoscope {sign.value} astrology forecast",
            category="astrology"
        )
        
        prompt = horoscope_service.generate_horoscope_prompt(
            sign=sign.value,
            period="monthly",
            target_date=month_start,
            transits=transits,
            natal_chart=natal_chart if is_personalized else None
        )
        
        prediction = await llm_service.generate(
            prompt=prompt,
            context=context,
            max_tokens=1024,
            temperature=0.7
        )
        
        lucky_numbers = horoscope_service.generate_lucky_numbers(sign.value, month_start)
        lucky_colors = horoscope_service.generate_lucky_colors(sign.value)
        compatibility_signs = horoscope_service.get_compatible_signs(sign.value)
        
        advice_parts = prediction.strip().split('\n\n')
        advice = advice_parts[-1] if len(advice_parts) > 1 else "Make this month count."
        
        db_horoscope = await horoscope_service.save_horoscope(
            db=db,
            sign=sign.value,
            period="monthly",
            target_date=month_start,
            prediction=prediction,
            lucky_numbers=lucky_numbers,
            lucky_colors=lucky_colors,
            compatibility_signs=compatibility_signs,
            advice=advice,
            user_id=str(current_user.id) if is_personalized else None,
            is_personalized=is_personalized,
            transit_data=transit_data
        )
        
        return HoroscopeResponse(
            sign=db_horoscope.zodiac_sign,
            period=db_horoscope.period,
            date=db_horoscope.date,
            prediction=db_horoscope.prediction,
            lucky_numbers=db_horoscope.lucky_numbers,
            lucky_colors=db_horoscope.lucky_colors,
            compatibility_signs=db_horoscope.compatibility_signs,
            advice=db_horoscope.advice,
            is_personalized=db_horoscope.is_personalized == "true",
            transit_data=db_horoscope.transit_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating monthly horoscope: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate monthly horoscope"
        )


@router.post("/compatibility", response_model=CompatibilityResponse)
async def get_zodiac_compatibility(
    request: CompatibilityRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get compatibility analysis between two zodiac signs
    
    Available to all users (Freemium: 1 per day, Premium/Platinum: unlimited).
    """
    try:
        sign1 = request.sign1.value
        sign2 = request.sign2.value
        
        # Check Redis cache
        cache_key = f"compatibility:{sign1}:{sign2}"
        cached = await redis_client.get(cache_key)
        
        if cached:
            logger.info(f"Returning cached compatibility for {sign1}-{sign2}")
            return CompatibilityResponse(**cached)
        
        # Generate compatibility analysis
        logger.info(f"Generating compatibility analysis for {sign1}-{sign2}")
        
        context = await rag_service.get_context(
            db=db,
            query=f"zodiac compatibility {sign1} {sign2} relationship astrology",
            category="astrology"
        )
        
        prompt = horoscope_service.generate_compatibility_prompt(sign1, sign2)
        
        response_text = await llm_service.generate(
            prompt=prompt,
            context=context,
            max_tokens=768,
            temperature=0.7
        )
        
        # Parse JSON response
        try:
            # Try to extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                compatibility_data = json.loads(json_match.group())
            else:
                # Fallback if JSON parsing fails
                compatibility_data = {
                    "compatibility_score": 70,
                    "analysis": response_text,
                    "strengths": ["Mutual understanding", "Shared values", "Good communication"],
                    "challenges": ["Different approaches", "Need for compromise", "Timing issues"],
                    "advice": "Focus on open communication and mutual respect."
                }
        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON from LLM response, using fallback")
            compatibility_data = {
                "compatibility_score": 70,
                "analysis": response_text,
                "strengths": ["Mutual understanding", "Shared values", "Good communication"],
                "challenges": ["Different approaches", "Need for compromise", "Timing issues"],
                "advice": "Focus on open communication and mutual respect."
            }
        
        response_data = {
            "sign1": sign1,
            "sign2": sign2,
            "compatibility_score": compatibility_data.get("compatibility_score", 70),
            "analysis": compatibility_data.get("analysis", response_text),
            "strengths": compatibility_data.get("strengths", []),
            "challenges": compatibility_data.get("challenges", []),
            "advice": compatibility_data.get("advice", "")
        }
        
        # Cache for 7 days (compatibility doesn't change)
        await redis_client.set(cache_key, response_data, ttl=604800)
        
        return CompatibilityResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Error generating compatibility: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate compatibility analysis"
        )
