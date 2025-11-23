"""Runes API Endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.services.runes import RunesService
from app.services.llm import UnifiedLLMService
from app.services.rag import RAGService
from app.schemas.runes import (
    RuneReadingRequest,
    RuneReadingResponse,
    RuneListResponse,
    RuneInfo
)

router = APIRouter(prefix="/runes", tags=["runes"])


def get_runes_service(
    db: AsyncSession = Depends(get_db)
) -> RunesService:
    """Dependency to get RunesService instance"""
    llm_service = UnifiedLLMService()
    rag_service = RAGService()
    return RunesService(llm_service=llm_service, rag_service=rag_service)


@router.post("/reading", response_model=RuneReadingResponse)
async def perform_rune_reading(
    request: RuneReadingRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    runes_service: RunesService = Depends(get_runes_service)
):
    """
    Perform a runic reading
    
    - **spread_type**: Type of spread (one-rune, three-rune, cross)
    - **question**: Optional question for the reading
    
    Returns the drawn runes and AI interpretation
    """
    try:
        # Get user context (zodiac sign if available)
        user_context = {}
        if hasattr(current_user, 'zodiac_sign') and current_user.zodiac_sign:
            user_context["zodiac_sign"] = current_user.zodiac_sign
        
        # Perform reading
        reading = await runes_service.perform_reading(
            db=db,
            spread_type=request.spread_type,
            question=request.question,
            user_context=user_context
        )
        
        return reading
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to perform rune reading: {str(e)}"
        )


@router.get("/all", response_model=RuneListResponse)
async def get_all_runes(
    runes_service: RunesService = Depends(get_runes_service)
):
    """
    Get all Elder Futhark runes
    
    Returns information about all 24 runes including their meanings
    """
    try:
        runes = runes_service.get_all_runes()
        return {
            "runes": runes,
            "total": len(runes)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve runes: {str(e)}"
        )


@router.get("/{rune_id}", response_model=RuneInfo)
async def get_rune_by_id(
    rune_id: int,
    runes_service: RunesService = Depends(get_runes_service)
):
    """
    Get a specific rune by ID
    
    - **rune_id**: ID of the rune (1-24)
    
    Returns detailed information about the rune
    """
    try:
        rune = runes_service.get_rune_by_id(rune_id)
        if not rune:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Rune with ID {rune_id} not found"
            )
        return rune
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve rune: {str(e)}"
        )
