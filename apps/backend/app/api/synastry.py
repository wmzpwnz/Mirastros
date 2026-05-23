"""Synastry (compatibility) API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.deps import get_current_user, require_premium
from app.core.access_control import FeatureAccessControl
from app.models.user import User, SubscriptionTier
from app.schemas.synastry import (
    SynastryCalculateRequest,
    SynastryResponse,
    SynastryHistoryResponse,
    SynastryHistoryItem,
    SynastryAspect,
    SynastryCompatibility
)
from app.services.synastry import synastry_service
from app.services.natal_chart import natal_chart_service
from app.services.llm import llm_service
from app.services.rag import rag_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/synastry", tags=["Synastry"])


@router.post("/calculate", response_model=SynastryResponse)
async def calculate_synastry(
    request: SynastryCalculateRequest,
    current_user: User = Depends(require_premium),
    db: AsyncSession = Depends(get_db)
):
    """
    Calculate synastry (compatibility) between two people
    
    **Access**: Premium/Platinum only
    
    Calculates compatibility based on inter-chart aspects and generates AI interpretation.
    """
    try:
        # Check subscription tier (Premium or Platinum required)
        tier = FeatureAccessControl._normalize_tier(current_user.subscription_tier)
        if tier not in [SubscriptionTier.PREMIUM, SubscriptionTier.PLATINUM]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Synastry analysis requires Premium or Platinum subscription"
            )

        person1_data = request.person1_birth_data
        person2_data = request.person2_birth_data
        
        # Calculate natal charts for both people
        person1_chart = natal_chart_service.calculate_chart(
            name=person1_data.name,
            birth_date=person1_data.birth_date,
            birth_time=person1_data.birth_time,
            latitude=person1_data.latitude,
            longitude=person1_data.longitude,
            city=person1_data.city or "",
            nation=person1_data.country or "",
            house_system=person1_data.house_system
        )
        
        person2_chart = natal_chart_service.calculate_chart(
            name=person2_data.name,
            birth_date=person2_data.birth_date,
            birth_time=person2_data.birth_time,
            latitude=person2_data.latitude,
            longitude=person2_data.longitude,
            city=person2_data.city or "",
            nation=person2_data.country or "",
            house_system=person2_data.house_system
        )
        
        # Calculate synastry
        synastry_data = synastry_service.calculate_synastry(
            person1_chart=person1_chart,
            person2_chart=person2_chart,
            relationship_type=request.relationship_type
        )
        
        # Generate AI interpretation if requested
        interpretation = None
        advice = None
        
        if request.generate_interpretation:
            try:
                # Get RAG context for synastry
                context = await rag_service.get_context(
                    db=db,
                    query=f"synastry compatibility {request.relationship_type} relationship aspects",
                    category="astrology"
                )
                
                # Generate interpretation prompt
                prompt = synastry_service.generate_interpretation_prompt(
                    person1_name=person1_data.name,
                    person2_name=person2_data.name,
                    synastry_data=synastry_data,
                    relationship_type=request.relationship_type
                )
                
                # Generate interpretation with LLM
                full_response = await llm_service.generate(
                    prompt=prompt,
                    context=context,
                    max_tokens=1536,
                    temperature=0.7
                )
                
                # Split interpretation and advice
                if "Practical Advice" in full_response or "Advice" in full_response:
                    parts = full_response.split("Practical Advice", 1)
                    if len(parts) == 2:
                        interpretation = parts[0].strip()
                        advice = "Practical Advice" + parts[1].strip()
                    else:
                        parts = full_response.split("Advice", 1)
                        if len(parts) == 2:
                            interpretation = parts[0].strip()
                            advice = "Advice" + parts[1].strip()
                        else:
                            interpretation = full_response
                else:
                    interpretation = full_response
                    
            except Exception as e:
                logger.warning(f"Failed to generate interpretation: {str(e)}")
                interpretation = "Interpretation generation is temporarily unavailable."
        
        # Save to database
        synastry = await synastry_service.save_synastry(
            db=db,
            user_id=str(current_user.id),
            person1_name=person1_data.name,
            person1_chart=person1_chart,
            person2_name=person2_data.name,
            person2_chart=person2_chart,
            synastry_data=synastry_data,
            relationship_type=request.relationship_type,
            interpretation=interpretation,
            advice=advice
        )
        
        # Format response
        aspects = [
            SynastryAspect(
                person1_planet=a["person1_planet"],
                person2_planet=a["person2_planet"],
                aspect_type=a["aspect_type"],
                orb=a["orb"],
                description=a["description"]
            )
            for a in synastry_data["aspects"]
        ]
        
        compatibility = SynastryCompatibility(**synastry_data["compatibility"])
        
        return SynastryResponse(
            person1_name=person1_data.name,
            person2_name=person2_data.name,
            relationship_type=request.relationship_type,
            aspects=aspects,
            compatibility=compatibility,
            strengths=synastry_data["strengths"],
            challenges=synastry_data["challenges"],
            interpretation=interpretation,
            advice=advice,
            calculated_at=synastry.calculated_at
        )
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error calculating synastry: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate synastry"
        )


@router.get("/history", response_model=SynastryHistoryResponse)
async def get_synastry_history(
    limit: int = Query(10, ge=1, le=50, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get synastry calculation history for current user
    
    Returns list of previous synastry calculations with pagination.
    """
    try:
        # Check subscription tier
        tier = FeatureAccessControl._normalize_tier(current_user.subscription_tier)
        if tier not in [SubscriptionTier.PREMIUM, SubscriptionTier.PLATINUM]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Synastry history requires Premium or Platinum subscription"
            )

        synastries, total = await synastry_service.get_synastry_history(
            db=db,
            user_id=str(current_user.id),
            limit=limit,
            offset=offset
        )
        
        history_items = [
            SynastryHistoryItem(
                id=str(s.id),
                person1_name=s.person1_name,
                person2_name=s.person2_name,
                relationship_type=s.relationship_type,
                compatibility_score=s.compatibility_score,
                calculated_at=s.calculated_at
            )
            for s in synastries
        ]
        
        return SynastryHistoryResponse(
            synastries=history_items,
            total=total
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving synastry history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve synastry history"
        )


@router.get("/{synastry_id}", response_model=SynastryResponse)
async def get_synastry_by_id(
    synastry_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get specific synastry calculation by ID
    
    Returns detailed synastry analysis including interpretation.
    """
    try:
        from sqlalchemy import select
        from app.models.synastry import Synastry
        
        # Get synastry from database
        result = await db.execute(
            select(Synastry).where(
                Synastry.id == synastry_id,
                Synastry.user_id == str(current_user.id)
            )
        )
        synastry = result.scalar_one_or_none()
        
        if not synastry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Synastry not found"
            )
        
        # Format response
        aspects = [
            SynastryAspect(
                person1_planet=a["person1_planet"],
                person2_planet=a["person2_planet"],
                aspect_type=a["aspect_type"],
                orb=a["orb"],
                description=a["description"]
            )
            for a in synastry.aspects
        ]
        
        # Reconstruct compatibility from stored data
        compatibility = SynastryCompatibility(
            overall_score=synastry.compatibility_score,
            emotional_compatibility=75.0,  # These would be stored separately in production
            intellectual_compatibility=70.0,
            physical_compatibility=80.0,
            spiritual_compatibility=65.0
        )
        
        return SynastryResponse(
            person1_name=synastry.person1_name,
            person2_name=synastry.person2_name,
            relationship_type=synastry.relationship_type,
            aspects=aspects,
            compatibility=compatibility,
            strengths=synastry.strengths or [],
            challenges=synastry.challenges or [],
            interpretation=synastry.interpretation,
            advice=synastry.advice,
            calculated_at=synastry.calculated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving synastry: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve synastry"
        )
