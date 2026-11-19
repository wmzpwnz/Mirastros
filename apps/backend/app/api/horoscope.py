"""Horoscope API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Any
from datetime import date, timedelta
import json
import logging

from app.core.config import get_settings
from app.services.lunar import lunar_service
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


def _period_value(period: Any) -> str:
    return period.value if hasattr(period, "value") else str(period)


def _build_horoscope_response_data(
    *,
    sign: str,
    period: str,
    target_date: date,
    prediction: str,
    lucky_numbers: Optional[list],
    lucky_colors: Optional[list],
    compatibility_signs: Optional[list],
    advice: Optional[str],
    is_personalized: bool,
    transit_data: Optional[dict],
    ratings: Optional[dict],
    clarify_available: bool,
    horoscope_id: Optional[str] = None,
) -> dict:
    rich_source = (
        transit_data.get("rich_text")
        if transit_data and isinstance(transit_data, dict) and transit_data.get("rich_text")
        else prediction
    )
    normalized = horoscope_service.validate_and_normalize_horoscope_content(
        sign=sign,
        period=period,
        target_date=target_date,
        prediction=rich_source,
        advice=advice or "",
        lucky_colors=lucky_colors or [],
    )
    explanations = horoscope_service.build_rating_explanations(ratings)
    return {
        "sign": sign,
        "period": period,
        "date": target_date.isoformat(),
        "prediction": normalized["prediction"],
        "plain_text": normalized["plain_text"],
        "rich_text": normalized["rich_text"],
        "lucky_numbers": lucky_numbers,
        "lucky_colors": normalized["lucky_colors"],
        "compatibility_signs": compatibility_signs,
        "advice": normalized["advice"],
        "is_personalized": is_personalized,
        "transit_data": transit_data,
        "ratings": ratings,
        "explanations": explanations,
        "best_time_windows": horoscope_service.get_best_time_windows(sign, period),
        "period_range_label": horoscope_service.get_period_range_label(period, target_date),
        "language": normalized["language"],
        "clarify_available": clarify_available,
        "horoscope_id": horoscope_id,
    }


# Editorial prompts for the daily reading. The phase and illumination come
# from the same ephemeris as the calendar, for the requested calendar date.
_SIGN_FOCUS = {
    "aries": "Выберите дело, которому сегодня нужен первый шаг.",
    "taurus": "Освободите место для того, что даёт вам опору.",
    "gemini": "Вернитесь к разговору, в котором остался открытый вопрос.",
    "cancer": "Подумайте, что сделало бы ваш дом уютнее сегодня.",
    "leo": "Найдите время для замысла, которым хочется поделиться.",
    "virgo": "Выберите одну деталь, которая упростит весь день.",
    "libra": "Оставьте место и для своих планов, и для встречи.",
    "scorpio": "Запишите мысль, к которой вы возвращались в последнее время.",
    "sagittarius": "Попробуйте посмотреть на знакомую задачу с другой стороны.",
    "capricorn": "Разделите далёкую цель на шаг, доступный уже сегодня.",
    "aquarius": "Обсудите свежую идею с человеком, которому доверяете.",
    "pisces": "Сохраните образ или мелодию, которые привлекли ваше внимание.",
}


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
        if not current_user:
            cache_key = f"horoscope:daily:v2:{sign.value}:{target_date.isoformat()}"
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
            
            # Calculate current transits for ratings calculation
            current_transits = horoscope_service.calculate_current_transits(target_date)
            
            # Calculate ratings for cached horoscope if Premium/Platinum
            ratings = None
            if current_user and current_user.subscription_tier in [SubscriptionTier.PREMIUM, SubscriptionTier.PLATINUM]:
                try:
                    cached_transits = db_horoscope.transit_data.get("current_transits", current_transits) if db_horoscope.transit_data else current_transits
                    ratings = horoscope_service.calculate_life_area_ratings(
                        zodiac_sign=sign.value,
                        transits=cached_transits,
                        natal_chart=natal_chart if is_personalized else None,
                        target_date=target_date
                    )
                except Exception as e:
                    logger.warning(f"Failed to calculate ratings for cached horoscope: {str(e)}")
            
            clarify_available = bool(current_user and current_user.subscription_tier in [SubscriptionTier.PREMIUM, SubscriptionTier.PLATINUM])
            
            response_data = _build_horoscope_response_data(
                sign=db_horoscope.zodiac_sign,
                period=_period_value(db_horoscope.period),
                target_date=db_horoscope.date or target_date,
                prediction=db_horoscope.prediction,
                lucky_numbers=db_horoscope.lucky_numbers,
                lucky_colors=db_horoscope.lucky_colors,
                compatibility_signs=db_horoscope.compatibility_signs,
                advice=db_horoscope.advice,
                is_personalized=db_horoscope.is_personalized == "true",
                transit_data=db_horoscope.transit_data,
                ratings=ratings,
                clarify_available=clarify_available,
                horoscope_id=str(db_horoscope.id),
            )
            
            # Cache in Redis if general horoscope
            if not current_user:
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
        
        if get_settings().AI_RESULT_EXPLANATIONS_ONLY:
            moon = lunar_service.calculate_lunar_phase(target_date, include_next_events=False)
            focus = _SIGN_FOCUS[sign.value]
            sky = f"Лунный диск освещён на {moon['illumination']:g}%."
            if is_personalized:
                house = (natal_chart.planets.get("moon") or {}).get("house")
                if house:
                    sky += f" В вашей натальной карте Луна занимает дом {house}."
            prediction = f"{focus} {sky}\n\n{moon['description_fallback_ru']}"
        else:
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
        # Try to get user's birth date and numerology for personalized lucky numbers
        user_birth_date = None
        user_life_path = None
        
        if is_personalized and current_user and current_user.birth_date:
            user_birth_date = current_user.birth_date
            # Try to get Life Path Number from numerology calculation if available
            try:
                from app.models.numerology_calculation import NumerologyCalculation
                from sqlalchemy import select
                result = await db.execute(
                    select(NumerologyCalculation)
                    .where(NumerologyCalculation.user_id == current_user.id)
                    .order_by(NumerologyCalculation.updated_at.desc())
                    .limit(1)
                )
                numerology_calc = result.scalar_one_or_none()
                if numerology_calc:
                    user_life_path = numerology_calc.life_path_number
            except Exception as e:
                logger.debug(f"Could not fetch numerology calculation: {e}")
        
        lucky_numbers = horoscope_service.generate_lucky_numbers(
            sign.value, 
            target_date,
            user_birth_date=user_birth_date,
            user_life_path=user_life_path
        )
        lucky_colors = horoscope_service.generate_lucky_colors(sign.value)
        compatibility_signs = horoscope_service.get_compatible_signs(sign.value)
        
        # Extract advice (last paragraph of prediction)
        advice_parts = prediction.strip().split('\n\n')
        advice = advice_parts[-1] if len(advice_parts) > 1 else "Слушайте интуицию и действуйте последовательно."

        normalized_content = horoscope_service.validate_and_normalize_horoscope_content(
            sign=sign.value,
            period="daily",
            target_date=target_date,
            prediction=prediction,
            advice=advice,
            lucky_colors=lucky_colors,
        )
        transit_data = {
            **(transit_data or {}),
            "plain_text": normalized_content["plain_text"],
            "rich_text": normalized_content["rich_text"],
            "language": "ru",
        }
        
        # Calculate life area ratings for Premium/Platinum users
        ratings = None
        if current_user and current_user.subscription_tier in [SubscriptionTier.PREMIUM, SubscriptionTier.PLATINUM]:
            try:
                ratings = horoscope_service.calculate_life_area_ratings(
                    zodiac_sign=sign.value,
                    transits=transits,
                    natal_chart=natal_chart if is_personalized else None,
                    target_date=target_date
                )
            except Exception as e:
                logger.warning(f"Failed to calculate ratings: {str(e)}")
        
        # Save to database
        db_horoscope = await horoscope_service.save_horoscope(
            db=db,
            sign=sign.value,
            period="daily",
            target_date=target_date,
            prediction=normalized_content["prediction"],
            lucky_numbers=lucky_numbers,
            lucky_colors=normalized_content["lucky_colors"],
            compatibility_signs=compatibility_signs,
            advice=normalized_content["advice"],
            user_id=user_id,
            is_personalized=is_personalized,
            transit_data=transit_data
        )
        
        # Check if user has Premium/Platinum for clarify feature
        clarify_available = bool(current_user and current_user.subscription_tier in [SubscriptionTier.PREMIUM, SubscriptionTier.PLATINUM])
        
        response_data = _build_horoscope_response_data(
            sign=db_horoscope.zodiac_sign,
            period=_period_value(db_horoscope.period),
            target_date=db_horoscope.date or target_date,
            prediction=db_horoscope.prediction,
            lucky_numbers=db_horoscope.lucky_numbers,
            lucky_colors=db_horoscope.lucky_colors,
            compatibility_signs=db_horoscope.compatibility_signs,
            advice=db_horoscope.advice,
            is_personalized=db_horoscope.is_personalized == "true",
            transit_data=db_horoscope.transit_data,
            ratings=ratings,
            clarify_available=clarify_available,
            horoscope_id=str(db_horoscope.id),
        )

        # Cache in Redis if general horoscope
        if not current_user:
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
            
            # Calculate current transits for ratings
            current_transits = horoscope_service.calculate_current_transits(week_start)
            
            # Calculate ratings for cached horoscope
            ratings = None
            try:
                cached_transits = db_horoscope.transit_data.get("current_transits", current_transits) if db_horoscope.transit_data else current_transits
                ratings = horoscope_service.calculate_life_area_ratings(
                    zodiac_sign=sign.value,
                    transits=cached_transits,
                    natal_chart=natal_chart if is_personalized else None,
                    target_date=week_start
                )
            except Exception as e:
                logger.warning(f"Failed to calculate ratings for cached weekly horoscope: {str(e)}")
            
            clarify_available = current_user.subscription_tier in [SubscriptionTier.PREMIUM, SubscriptionTier.PLATINUM]
            
            response_data = _build_horoscope_response_data(
                sign=db_horoscope.zodiac_sign,
                period=_period_value(db_horoscope.period),
                target_date=db_horoscope.date or week_start,
                prediction=db_horoscope.prediction,
                lucky_numbers=db_horoscope.lucky_numbers,
                lucky_colors=db_horoscope.lucky_colors,
                compatibility_signs=db_horoscope.compatibility_signs,
                advice=db_horoscope.advice,
                is_personalized=db_horoscope.is_personalized == "true",
                transit_data=db_horoscope.transit_data,
                ratings=ratings,
                clarify_available=clarify_available,
                horoscope_id=str(db_horoscope.id),
            )
            return HoroscopeResponse(**response_data)
        
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
        
        # Try to get user's birth date for personalized lucky numbers
        user_birth_date = None
        user_life_path = None
        if current_user and current_user.birth_date:
            user_birth_date = current_user.birth_date
            try:
                from app.models.numerology_calculation import NumerologyCalculation
                from sqlalchemy import select
                result = await db.execute(
                    select(NumerologyCalculation)
                    .where(NumerologyCalculation.user_id == current_user.id)
                    .order_by(NumerologyCalculation.updated_at.desc())
                    .limit(1)
                )
                numerology_calc = result.scalar_one_or_none()
                if numerology_calc:
                    user_life_path = numerology_calc.life_path_number
            except Exception as e:
                logger.debug(f"Could not fetch numerology calculation: {e}")
        
        lucky_numbers = horoscope_service.generate_lucky_numbers(
            sign.value, 
            week_start,
            user_birth_date=user_birth_date,
            user_life_path=user_life_path
        )
        lucky_colors = horoscope_service.generate_lucky_colors(sign.value)
        compatibility_signs = horoscope_service.get_compatible_signs(sign.value)
        
        advice_parts = prediction.strip().split('\n\n')
        advice = advice_parts[-1] if len(advice_parts) > 1 else "Действуйте по ключевым приоритетам и не распыляйтесь."

        normalized_content = horoscope_service.validate_and_normalize_horoscope_content(
            sign=sign.value,
            period="weekly",
            target_date=week_start,
            prediction=prediction,
            advice=advice,
            lucky_colors=lucky_colors,
        )
        transit_data = {
            **(transit_data or {}),
            "plain_text": normalized_content["plain_text"],
            "rich_text": normalized_content["rich_text"],
            "language": "ru",
        }
        
        # Calculate life area ratings
        ratings = None
        try:
            ratings = horoscope_service.calculate_life_area_ratings(
                zodiac_sign=sign.value,
                transits=transits,
                natal_chart=natal_chart if is_personalized else None,
                target_date=week_start
            )
        except Exception as e:
            logger.warning(f"Failed to calculate ratings: {str(e)}")
        
        db_horoscope = await horoscope_service.save_horoscope(
            db=db,
            sign=sign.value,
            period="weekly",
            target_date=week_start,
            prediction=normalized_content["prediction"],
            lucky_numbers=lucky_numbers,
            lucky_colors=normalized_content["lucky_colors"],
            compatibility_signs=compatibility_signs,
            advice=normalized_content["advice"],
            user_id=str(current_user.id) if is_personalized else None,
            is_personalized=is_personalized,
            transit_data=transit_data
        )
        
        clarify_available = current_user.subscription_tier in [SubscriptionTier.PREMIUM, SubscriptionTier.PLATINUM]
        
        response_data = _build_horoscope_response_data(
            sign=db_horoscope.zodiac_sign,
            period=_period_value(db_horoscope.period),
            target_date=db_horoscope.date or week_start,
            prediction=db_horoscope.prediction,
            lucky_numbers=db_horoscope.lucky_numbers,
            lucky_colors=db_horoscope.lucky_colors,
            compatibility_signs=db_horoscope.compatibility_signs,
            advice=db_horoscope.advice,
            is_personalized=db_horoscope.is_personalized == "true",
            transit_data=db_horoscope.transit_data,
            ratings=ratings,
            clarify_available=clarify_available,
            horoscope_id=str(db_horoscope.id),
        )
        return HoroscopeResponse(**response_data)
        
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
            
            # Calculate current transits for ratings
            current_transits = horoscope_service.calculate_current_transits(month_start)
            
            # Calculate ratings for cached horoscope
            ratings = None
            try:
                cached_transits = db_horoscope.transit_data.get("current_transits", current_transits) if db_horoscope.transit_data else current_transits
                ratings = horoscope_service.calculate_life_area_ratings(
                    zodiac_sign=sign.value,
                    transits=cached_transits,
                    natal_chart=natal_chart if is_personalized else None,
                    target_date=month_start
                )
            except Exception as e:
                logger.warning(f"Failed to calculate ratings for cached monthly horoscope: {str(e)}")
            
            clarify_available = current_user.subscription_tier in [SubscriptionTier.PREMIUM, SubscriptionTier.PLATINUM]
            
            response_data = _build_horoscope_response_data(
                sign=db_horoscope.zodiac_sign,
                period=_period_value(db_horoscope.period),
                target_date=db_horoscope.date or month_start,
                prediction=db_horoscope.prediction,
                lucky_numbers=db_horoscope.lucky_numbers,
                lucky_colors=db_horoscope.lucky_colors,
                compatibility_signs=db_horoscope.compatibility_signs,
                advice=db_horoscope.advice,
                is_personalized=db_horoscope.is_personalized == "true",
                transit_data=db_horoscope.transit_data,
                ratings=ratings,
                clarify_available=clarify_available,
                horoscope_id=str(db_horoscope.id),
            )
            return HoroscopeResponse(**response_data)
        
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
        
        # Try to get user's birth date for personalized lucky numbers
        user_birth_date = None
        user_life_path = None
        if current_user and current_user.birth_date:
            user_birth_date = current_user.birth_date
            try:
                from app.models.numerology_calculation import NumerologyCalculation
                from sqlalchemy import select
                result = await db.execute(
                    select(NumerologyCalculation)
                    .where(NumerologyCalculation.user_id == current_user.id)
                    .order_by(NumerologyCalculation.updated_at.desc())
                    .limit(1)
                )
                numerology_calc = result.scalar_one_or_none()
                if numerology_calc:
                    user_life_path = numerology_calc.life_path_number
            except Exception as e:
                logger.debug(f"Could not fetch numerology calculation: {e}")
        
        lucky_numbers = horoscope_service.generate_lucky_numbers(
            sign.value, 
            month_start,
            user_birth_date=user_birth_date,
            user_life_path=user_life_path
        )
        lucky_colors = horoscope_service.generate_lucky_colors(sign.value)
        compatibility_signs = horoscope_service.get_compatible_signs(sign.value)
        
        advice_parts = prediction.strip().split('\n\n')
        advice = advice_parts[-1] if len(advice_parts) > 1 else "Стройте план на перспективу и действуйте без спешки."

        normalized_content = horoscope_service.validate_and_normalize_horoscope_content(
            sign=sign.value,
            period="monthly",
            target_date=month_start,
            prediction=prediction,
            advice=advice,
            lucky_colors=lucky_colors,
        )
        transit_data = {
            **(transit_data or {}),
            "plain_text": normalized_content["plain_text"],
            "rich_text": normalized_content["rich_text"],
            "language": "ru",
        }
        
        # Calculate life area ratings
        ratings = None
        try:
            ratings = horoscope_service.calculate_life_area_ratings(
                zodiac_sign=sign.value,
                transits=transits,
                natal_chart=natal_chart if is_personalized else None,
                target_date=month_start
            )
        except Exception as e:
            logger.warning(f"Failed to calculate ratings: {str(e)}")
        
        db_horoscope = await horoscope_service.save_horoscope(
            db=db,
            sign=sign.value,
            period="monthly",
            target_date=month_start,
            prediction=normalized_content["prediction"],
            lucky_numbers=lucky_numbers,
            lucky_colors=normalized_content["lucky_colors"],
            compatibility_signs=compatibility_signs,
            advice=normalized_content["advice"],
            user_id=str(current_user.id) if is_personalized else None,
            is_personalized=is_personalized,
            transit_data=transit_data
        )
        
        clarify_available = current_user.subscription_tier in [SubscriptionTier.PREMIUM, SubscriptionTier.PLATINUM]
        
        response_data = _build_horoscope_response_data(
            sign=db_horoscope.zodiac_sign,
            period=_period_value(db_horoscope.period),
            target_date=db_horoscope.date or month_start,
            prediction=db_horoscope.prediction,
            lucky_numbers=db_horoscope.lucky_numbers,
            lucky_colors=db_horoscope.lucky_colors,
            compatibility_signs=db_horoscope.compatibility_signs,
            advice=db_horoscope.advice,
            is_personalized=db_horoscope.is_personalized == "true",
            transit_data=db_horoscope.transit_data,
            ratings=ratings,
            clarify_available=clarify_available,
            horoscope_id=str(db_horoscope.id),
        )
        return HoroscopeResponse(**response_data)
        
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
