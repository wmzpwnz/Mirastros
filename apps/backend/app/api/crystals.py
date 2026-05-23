"""Crystals API Endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.services.crystals import CrystalsService
from app.services.llm import UnifiedLLMService
from app.services.rag import RAGService
from app.schemas.crystals import (
    CrystalRecommendationRequest,
    CrystalRecommendationResponse,
    CrystalListResponse,
    CrystalInfo,
    CrystalsByZodiacRequest,
    CrystalsByPropertyRequest
)

router = APIRouter(prefix="/crystals", tags=["crystals"])


def get_crystals_service(
    db: AsyncSession = Depends(get_db)
) -> CrystalsService:
    """Dependency to get CrystalsService instance"""
    llm_service = UnifiedLLMService()
    rag_service = RAGService()
    return CrystalsService(llm_service=llm_service, rag_service=rag_service)


@router.post("/recommend", response_model=CrystalRecommendationResponse)
async def get_crystal_recommendations(
    request: CrystalRecommendationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    crystals_service: CrystalsService = Depends(get_crystals_service)
):
    """
    Get personalized crystal recommendations
    
    - **goal**: Specific goal (e.g., 'protection', 'love', 'wealth', 'healing')
    - **zodiac_sign**: User's zodiac sign for personalized recommendations
    - **chakra**: Specific chakra to work with
    
    Returns recommended crystals with AI interpretation
    """
    try:
        # Get user context
        user_context = {}
        if hasattr(current_user, 'zodiac_sign') and current_user.zodiac_sign:
            user_context["zodiac_sign"] = current_user.zodiac_sign
        
        # Use zodiac from request or user profile
        zodiac_sign = request.zodiac_sign
        if not zodiac_sign and "zodiac_sign" in user_context:
            zodiac_sign = user_context["zodiac_sign"]
        
        # Get recommendations
        recommendations = await crystals_service.get_recommendations(
            db=db,
            goal=request.goal,
            zodiac_sign=zodiac_sign,
            chakra=request.chakra,
            user_context=user_context
        )
        
        return recommendations
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get crystal recommendations: {str(e)}"
        )


@router.get("/all", response_model=CrystalListResponse)
async def get_all_crystals(
    crystals_service: CrystalsService = Depends(get_crystals_service)
):
    """
    Get all crystals in the database
    
    Returns information about all available crystals
    """
    try:
        crystals = crystals_service.get_all_crystals()
        return {
            "crystals": crystals,
            "total": len(crystals)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve crystals: {str(e)}"
        )


@router.get("/{crystal_id}", response_model=CrystalInfo)
async def get_crystal_by_id(
    crystal_id: int,
    crystals_service: CrystalsService = Depends(get_crystals_service)
):
    """
    Get a specific crystal by ID
    
    - **crystal_id**: ID of the crystal (1-20)
    
    Returns detailed information about the crystal
    """
    try:
        crystal = crystals_service.get_crystal_by_id(crystal_id)
        if not crystal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Crystal with ID {crystal_id} not found"
            )
        return crystal
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve crystal: {str(e)}"
        )


@router.post("/by-zodiac", response_model=CrystalListResponse)
async def get_crystals_by_zodiac(
    request: CrystalsByZodiacRequest,
    crystals_service: CrystalsService = Depends(get_crystals_service)
):
    """
    Get crystals recommended for a specific zodiac sign
    
    - **zodiac_sign**: Zodiac sign (Aries, Taurus, Gemini, etc.)
    
    Returns crystals associated with the zodiac sign
    """
    try:
        crystals = crystals_service.get_crystals_by_zodiac(request.zodiac_sign)
        return {
            "crystals": crystals,
            "total": len(crystals)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve crystals by zodiac: {str(e)}"
        )


@router.post("/by-property", response_model=CrystalListResponse)
async def get_crystals_by_property(
    request: CrystalsByPropertyRequest,
    crystals_service: CrystalsService = Depends(get_crystals_service)
):
    """
    Get crystals with a specific property
    
    - **property**: Property to search for (e.g., 'love', 'protection', 'abundance')
    
    Returns crystals with the specified property
    """
    try:
        crystals = crystals_service.get_crystals_by_property(request.property)
        return {
            "crystals": crystals,
            "total": len(crystals)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve crystals by property: {str(e)}"
        )


@router.get("/by-chakra/{chakra}", response_model=CrystalListResponse)
async def get_crystals_by_chakra(
    chakra: str = Path(..., description="Chakra name (root, sacral, solar plexus, heart, throat, third eye, crown)"),
    crystals_service: CrystalsService = Depends(get_crystals_service)
):
    """
    Get crystals associated with a specific chakra
    
    - **chakra**: Chakra name (root, sacral, solar plexus, heart, throat, third eye, crown)
    
    Returns crystals for the specified chakra
    """
    try:
        crystals = crystals_service.get_crystals_by_chakra(chakra)
        return {
            "crystals": crystals,
            "total": len(crystals)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve crystals by chakra: {str(e)}"
        )
