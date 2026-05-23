"""Natal chart API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.deps import get_current_user, require_premium
from app.core.access_control import require_feature_access
from app.models.user import User
from app.schemas.natal_chart import (
    NatalChartCalculateRequest,
    NatalChartUpdateRequest,
    NatalChartResponse,
    NatalChartData
)
from app.services.natal_chart import natal_chart_service
from app.services.llm import llm_service
from app.services.rag import rag_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/natal", tags=["Natal Chart"])


@router.post("/calculate", response_model=NatalChartResponse)
async def calculate_natal_chart(
    request: NatalChartCalculateRequest,
    current_user: User = Depends(require_premium),
    db: AsyncSession = Depends(get_db)
):
    """
    Calculate natal chart for current user
    
    **Access**: Premium/Platinum only
    
    Requires authentication. Calculates natal chart based on birth data
    and optionally generates AI interpretation.
    """
    try:
        birth_data = request.birth_data
        
        # Calculate natal chart
        chart_data = natal_chart_service.calculate_chart(
            name=birth_data.name,
            birth_date=birth_data.birth_date,
            birth_time=birth_data.birth_time,
            latitude=birth_data.latitude,
            longitude=birth_data.longitude,
            city=birth_data.city or "",
            nation=birth_data.country or "",
            house_system=birth_data.house_system
        )
        
        # Save to database
        natal_chart = await natal_chart_service.save_natal_chart(
            db=db,
            user_id=str(current_user.id),
            chart_data=chart_data
        )
        
        # Generate AI interpretation if requested
        interpretation = None
        if request.generate_interpretation:
            try:
                # Get RAG context for astrology
                context = await rag_service.get_context(
                    db=db,
                    query=f"natal chart interpretation {chart_data['planets']['sun']['sign']} sun {chart_data['planets']['moon']['sign']} moon",
                    category="astrology"
                )
                
                # Generate interpretation prompt
                prompt = natal_chart_service.generate_interpretation_prompt(
                    chart_data=chart_data,
                    user_name=birth_data.name
                )
                
                # Generate interpretation with LLM
                interpretation = await llm_service.generate(
                    prompt=prompt,
                    context=context,
                    max_tokens=1024,
                    temperature=0.7
                )
            except Exception as e:
                logger.warning(f"Failed to generate interpretation: {str(e)}")
                interpretation = "Interpretation generation is temporarily unavailable."
        
        return NatalChartResponse(
            chart_data=NatalChartData(**chart_data),
            interpretation=interpretation,
            calculated_at=natal_chart.calculated_at
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error calculating natal chart: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate natal chart"
        )


def _user_tier_allows_natal(user: User) -> bool:
    tier = getattr(user.subscription_tier, "value", None) or str(user.subscription_tier or "").lower()
    return tier in ("premium", "platinum")

def _normalize_house(value) -> int:
    try:
        if isinstance(value, int):
            return value
        if isinstance(value, float) and value.is_integer():
            return int(value)
        if isinstance(value, str):
            raw = value.strip()
            if raw.isdigit():
                return int(raw)
            lowered = raw.lower()
            ordinals = {
                "first": 1,
                "second": 2,
                "third": 3,
                "fourth": 4,
                "fifth": 5,
                "sixth": 6,
                "seventh": 7,
                "eighth": 8,
                "ninth": 9,
                "tenth": 10,
                "eleventh": 11,
                "twelfth": 12,
            }
            for k, v in ordinals.items():
                if k in lowered:
                    return v
    except Exception:
        pass
    return 1


@router.get("/me", response_model=Optional[NatalChartResponse])
async def get_my_natal_chart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user's natal chart.

    Returns the stored natal chart. If the user has full birth data and Premium/Platinum
    but no chart yet, the chart is calculated and saved automatically, then returned.
    Returns null only when the user has no chart and cannot have one (missing data or tier).
    """
    try:
        natal_chart = await natal_chart_service.get_natal_chart(
            db=db,
            user_id=str(current_user.id)
        )

        if not natal_chart and _user_tier_allows_natal(current_user):
            loc = current_user.birth_location or {}
            lat = loc.get("latitude")
            lng = loc.get("longitude")
            if (
                current_user.birth_date
                and current_user.birth_time
                and lat is not None
                and lng is not None
            ):
                try:
                    chart_data = natal_chart_service.calculate_chart(
                        name=current_user.full_name or "User",
                        birth_date=current_user.birth_date,
                        birth_time=current_user.birth_time,
                        latitude=float(lat),
                        longitude=float(lng),
                        city=loc.get("city") or "",
                        nation=loc.get("country") or "",
                        house_system="placidus",
                    )
                    natal_chart = await natal_chart_service.save_natal_chart(
                        db=db,
                        user_id=str(current_user.id),
                        chart_data=chart_data,
                    )
                    logger.info("Auto-calculated natal chart for user %s on GET /natal/me", current_user.id)
                except Exception as calc_err:
                    logger.warning("Could not auto-calculate natal chart for user %s: %s", current_user.id, calc_err)

        if not natal_chart:
            return None

        # Backward compatibility: normalize stored planet "house" fields to ints.
        # Older data may contain values like "Second_House", which breaks response validation.
        planets = natal_chart.planets or {}
        normalized_planets = {}
        for k, p in planets.items():
            if not isinstance(p, dict):
                normalized_planets[k] = p
                continue
            house_raw = p.get("house")
            normalized_planets[k] = {**p, "house": _normalize_house(house_raw)}

        chart_data = {
            "planets": normalized_planets,
            "houses": natal_chart.houses,
            "aspects": natal_chart.aspects,
            "ascendant": natal_chart.ascendant,
            "midheaven": natal_chart.midheaven,
            "lunar_nodes": natal_chart.lunar_nodes,
            "house_system": natal_chart.house_system
        }

        return NatalChartResponse(
            chart_data=NatalChartData(**chart_data),
            interpretation=None,
            calculated_at=natal_chart.calculated_at
        )

    except Exception as e:
        logger.error(f"Error retrieving natal chart: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve natal chart"
        )


@router.put("/update", response_model=NatalChartResponse)
async def update_natal_chart(
    request: NatalChartUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update natal chart for current user
    
    Recalculates natal chart with new birth data.
    """
    try:
        birth_data = request.birth_data
        
        # Calculate new natal chart
        chart_data = natal_chart_service.calculate_chart(
            name=birth_data.name,
            birth_date=birth_data.birth_date,
            birth_time=birth_data.birth_time,
            latitude=birth_data.latitude,
            longitude=birth_data.longitude,
            city=birth_data.city or "",
            nation=birth_data.country or "",
            house_system=birth_data.house_system
        )
        
        # Update in database
        natal_chart = await natal_chart_service.save_natal_chart(
            db=db,
            user_id=str(current_user.id),
            chart_data=chart_data
        )
        
        # Generate AI interpretation if requested
        interpretation = None
        if request.generate_interpretation:
            try:
                context = await rag_service.get_context(
                    db=db,
                    query=f"natal chart interpretation {chart_data['planets']['sun']['sign']} sun {chart_data['planets']['moon']['sign']} moon",
                    category="astrology"
                )
                
                prompt = natal_chart_service.generate_interpretation_prompt(
                    chart_data=chart_data,
                    user_name=birth_data.name
                )
                
                interpretation = await llm_service.generate(
                    prompt=prompt,
                    context=context,
                    max_tokens=1024,
                    temperature=0.7
                )
            except Exception as e:
                logger.warning(f"Failed to generate interpretation: {str(e)}")
                interpretation = "Interpretation generation is temporarily unavailable."
        
        return NatalChartResponse(
            chart_data=NatalChartData(**chart_data),
            interpretation=interpretation,
            calculated_at=natal_chart.calculated_at
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error updating natal chart: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update natal chart"
        )


@router.post("/interpret", response_model=dict)
async def interpret_natal_chart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate AI interpretation for existing natal chart
    
    Generates a fresh interpretation for the user's stored natal chart.
    """
    try:
        # Get existing natal chart
        natal_chart = await natal_chart_service.get_natal_chart(
            db=db,
            user_id=str(current_user.id)
        )
        
        if not natal_chart:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No natal chart found. Please calculate your chart first."
            )
        
        chart_data = {
            "planets": natal_chart.planets,
            "houses": natal_chart.houses,
            "aspects": natal_chart.aspects,
            "ascendant": natal_chart.ascendant,
            "midheaven": natal_chart.midheaven,
            "lunar_nodes": natal_chart.lunar_nodes,
            "house_system": natal_chart.house_system
        }
        
        # Get RAG context
        context = await rag_service.get_context(
            db=db,
            query=f"natal chart interpretation {chart_data['planets']['sun']['sign']} sun {chart_data['planets']['moon']['sign']} moon",
            category="astrology"
        )
        
        # Generate interpretation prompt
        prompt = natal_chart_service.generate_interpretation_prompt(
            chart_data=chart_data,
            user_name=current_user.full_name or "User"
        )
        
        # Generate interpretation with LLM
        interpretation = await llm_service.generate(
            prompt=prompt,
            context=context,
            max_tokens=1024,
            temperature=0.7
        )
        
        return {
            "interpretation": interpretation,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating interpretation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate interpretation"
        )
