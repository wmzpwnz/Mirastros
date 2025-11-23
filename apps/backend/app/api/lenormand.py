"""Lenormand API Endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.services.lenormand import LenormandService
from app.services.llm import UnifiedLLMService
from app.services.rag import RAGService
from app.schemas.lenormand import (
    LenormandReadingRequest,
    LenormandReadingResponse,
    LenormandCardListResponse,
    LenormandCardInfo
)
from app.models.lenormand_reading import LenormandReading
from sqlalchemy import select, desc
from typing import List

router = APIRouter(prefix="/lenormand", tags=["lenormand"])


def get_lenormand_service(
    db: AsyncSession = Depends(get_db)
) -> LenormandService:
    """Dependency to get LenormandService instance"""
    llm_service = UnifiedLLMService()
    rag_service = RAGService()
    return LenormandService(llm_service=llm_service, rag_service=rag_service)


@router.post("/reading", response_model=LenormandReadingResponse)
async def perform_lenormand_reading(
    request: LenormandReadingRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    lenormand_service: LenormandService = Depends(get_lenormand_service)
):
    """
    Perform a Lenormand card reading
    
    - **spread_type**: Type of spread (three-card, five-card, nine-card)
    - **question**: Optional question for the reading
    
    Lenormand cards provide concrete, practical answers focused on everyday situations.
    Returns the drawn cards and AI interpretation with card combinations.
    """
    try:
        # Get user context (zodiac sign if available)
        user_context = {}
        if hasattr(current_user, 'zodiac_sign') and current_user.zodiac_sign:
            user_context["zodiac_sign"] = current_user.zodiac_sign
        
        # Perform reading
        reading = await lenormand_service.perform_reading(
            db=db,
            spread_type=request.spread_type,
            question=request.question,
            user_context=user_context,
            user_id=str(current_user.id)
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
            detail=f"Failed to perform Lenormand reading: {str(e)}"
        )


@router.get("/cards", response_model=LenormandCardListResponse)
async def get_all_lenormand_cards(
    lenormand_service: LenormandService = Depends(get_lenormand_service)
):
    """
    Get all 36 Lenormand cards
    
    Returns information about all Lenormand cards including their meanings,
    keywords, and combination interpretations.
    """
    try:
        cards = lenormand_service.get_all_cards()
        return {
            "cards": cards,
            "total": len(cards)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve Lenormand cards: {str(e)}"
        )


@router.get("/cards/{card_id}", response_model=LenormandCardInfo)
async def get_lenormand_card_by_id(
    card_id: int,
    lenormand_service: LenormandService = Depends(get_lenormand_service)
):
    """
    Get a specific Lenormand card by ID
    
    - **card_id**: ID of the card (1-36)
    
    Returns detailed information about the card including meanings and combinations.
    """
    try:
        card = lenormand_service.get_card_by_id(card_id)
        if not card:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lenormand card with ID {card_id} not found"
            )
        return card
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve Lenormand card: {str(e)}"
        )


@router.get("/history", response_model=List[LenormandReadingResponse])
async def get_lenormand_reading_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 10,
    offset: int = 0
):
    """
    Get user's Lenormand reading history
    
    - **limit**: Maximum number of readings to return (default: 10)
    - **offset**: Number of readings to skip (default: 0)
    
    Returns a list of past Lenormand readings ordered by most recent first.
    """
    try:
        # Query readings for current user
        query = (
            select(LenormandReading)
            .where(LenormandReading.user_id == current_user.id)
            .order_by(desc(LenormandReading.created_at))
            .limit(limit)
            .offset(offset)
        )
        
        result = await db.execute(query)
        readings = result.scalars().all()
        
        # Convert to response format
        response = []
        for reading in readings:
            response.append({
                "spread_type": reading.spread_type,
                "question": reading.question,
                "cards": reading.cards,
                "interpretation": reading.interpretation,
                "timestamp": reading.created_at.isoformat()
            })
        
        return response
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve reading history: {str(e)}"
        )
