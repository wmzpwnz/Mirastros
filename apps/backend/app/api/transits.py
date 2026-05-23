"""Transits API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import datetime, date, timezone

from app.core.database import get_db
from app.core.deps import get_current_user, require_premium
from app.models.user import User
from app.schemas.transits import (
    CurrentTransitsResponse,
    PersonalTransitsRequest,
    PersonalTransitsResponse,
    TransitInterpretationRequest,
    TransitPlanetPosition,
    TransitAspect,
    SignificantTransit
)
from app.services.transits import transits_service
from app.services.natal_chart import natal_chart_service
from app.services.llm import llm_service
from app.services.rag import rag_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/transits", tags=["Transits"])


@router.get("/current", response_model=CurrentTransitsResponse)
async def get_current_transits():
    """
    Get current planetary transits
    
    Returns current positions of all planets and lunar phase.
    No authentication required.
    """
    try:
        transit_data = transits_service.calculate_current_transits()
        
        return CurrentTransitsResponse(
            date=transit_data["date"],
            planetary_positions={
                k: TransitPlanetPosition(**v) 
                for k, v in transit_data["planetary_positions"].items()
            },
            lunar_phase=transit_data["lunar_phase"],
            lunar_phase_percentage=transit_data["lunar_phase_percentage"]
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error getting current transits: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate current transits"
        )


@router.post("/personal", response_model=PersonalTransitsResponse)
async def get_personal_transits(
    request: PersonalTransitsRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get personal transits analysis
    
    Requires authentication and natal chart.
    Compares current transits with user's natal chart to identify
    significant aspects and upcoming events.
    """
    try:
        # Get user's natal chart
        natal_chart = await natal_chart_service.get_natal_chart(
            db=db,
            user_id=str(current_user.id)
        )
        
        if not natal_chart:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No natal chart found. Please calculate your natal chart first."
            )
        
        # Prepare natal chart data
        natal_chart_data = {
            "planets": natal_chart.planets,
            "houses": natal_chart.houses,
            "aspects": natal_chart.aspects,
            "ascendant": natal_chart.ascendant,
            "midheaven": natal_chart.midheaven,
            "lunar_nodes": natal_chart.lunar_nodes
        }
        
        # Calculate personal transits
        transit_data = transits_service.calculate_personal_transits(
            natal_chart_data=natal_chart_data,
            target_date=request.target_date,
            days_ahead=request.days_ahead
        )
        
        return PersonalTransitsResponse(
            date=transit_data["date"],
            current_transits={
                k: TransitPlanetPosition(**v)
                for k, v in transit_data["current_transits"].items()
            },
            aspects_to_natal=[
                TransitAspect(**aspect)
                for aspect in transit_data["aspects_to_natal"]
            ],
            significant_transits=[
                SignificantTransit(**transit)
                for transit in transit_data["significant_transits"]
            ],
            interpretation=None
        )
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error calculating personal transits: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate personal transits"
        )


@router.post("/interpret", response_model=dict)
async def interpret_transits(
    request: TransitInterpretationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate AI interpretation of current transits
    
    Requires authentication and natal chart.
    Generates a comprehensive interpretation of how current transits
    affect the user based on their natal chart.
    """
    try:
        # Get user's natal chart
        natal_chart = await natal_chart_service.get_natal_chart(
            db=db,
            user_id=str(current_user.id)
        )
        
        if not natal_chart:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No natal chart found. Please calculate your natal chart first."
            )
        
        # Prepare natal chart data
        natal_chart_data = {
            "planets": natal_chart.planets,
            "houses": natal_chart.houses,
            "aspects": natal_chart.aspects,
            "ascendant": natal_chart.ascendant,
            "midheaven": natal_chart.midheaven,
            "lunar_nodes": natal_chart.lunar_nodes
        }
        
        # Calculate personal transits
        transit_data = transits_service.calculate_personal_transits(
            natal_chart_data=natal_chart_data,
            target_date=request.target_date,
            days_ahead=30
        )
        
        # Get RAG context for transits
        context = await rag_service.get_context(
            db=db,
            query="planetary transits interpretation aspects astrology",
            category="astrology"
        )
        
        # Generate interpretation prompt
        prompt = transits_service.generate_interpretation_prompt(
            transit_data=transit_data,
            natal_chart_data=natal_chart_data,
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
            "date": transit_data["date"].isoformat(),
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating transit interpretation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate transit interpretation"
        )
