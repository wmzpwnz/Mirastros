"""Tarot API Endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.core.access_control import require_feature_access
from app.models.user import User
from app.services.tarot import TarotService
from app.services.llm import UnifiedLLMService
from app.services.rag import RAGService
from app.schemas.tarot import (
    TarotReadingRequest,
    TarotReadingResponse,
    CardListResponse,
    CardsBySuitResponse,
    CardInfo,
    ReadingHistoryResponse
)

router = APIRouter(prefix="/tarot", tags=["tarot"])


def get_tarot_service(
    db: AsyncSession = Depends(get_db)
) -> TarotService:
    """Dependency to get TarotService instance"""
    llm_service = UnifiedLLMService()
    rag_service = RAGService()
    return TarotService(llm_service=llm_service, rag_service=rag_service)


@router.post("/reading", response_model=TarotReadingResponse)
@require_feature_access("tarot_reading", check_usage=True)
async def perform_tarot_reading(
    request: TarotReadingRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tarot_service: TarotService = Depends(get_tarot_service)
):
    """
    Perform a Tarot reading
    
    **Access**: Freemium (1 per week), Premium/Platinum (unlimited)
    
    - **spread_type**: Type of spread (one-card, three-card, five-card, celtic-cross)
    - **question**: Optional question for the reading
    
    Returns the drawn cards and AI interpretation
    """
    try:
        # Get user context (zodiac sign, birth date if available)
        user_context = {}
        if hasattr(current_user, 'zodiac_sign') and current_user.zodiac_sign:
            user_context["zodiac_sign"] = current_user.zodiac_sign
        if hasattr(current_user, 'birth_date') and current_user.birth_date:
            user_context["birth_date"] = str(current_user.birth_date)
        
        # Perform reading
        reading = await tarot_service.perform_reading(
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
            detail=f"Failed to perform Tarot reading: {str(e)}"
        )


@router.get("/cards", response_model=CardListResponse)
async def get_all_cards(
    tarot_service: TarotService = Depends(get_tarot_service)
):
    """
    Get all Tarot cards
    
    Returns information about all 78 Tarot cards including their meanings
    """
    try:
        cards = tarot_service.get_all_cards()
        return {
            "cards": cards,
            "total": len(cards)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve cards: {str(e)}"
        )


@router.get("/cards/suit/{suit}", response_model=CardsBySuitResponse)
async def get_cards_by_suit(
    suit: str,
    tarot_service: TarotService = Depends(get_tarot_service)
):
    """
    Get all cards of a specific suit
    
    - **suit**: Suit name (major, wands, cups, swords, pentacles)
    
    Returns all cards of the specified suit
    """
    try:
        cards = tarot_service.get_cards_by_suit(suit)
        return {
            "suit": suit,
            "cards": cards,
            "total": len(cards)
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve cards: {str(e)}"
        )


@router.get("/cards/{card_id}", response_model=CardInfo)
async def get_card_by_id(
    card_id: int,
    tarot_service: TarotService = Depends(get_tarot_service)
):
    """
    Get a specific card by ID
    
    - **card_id**: ID of the card (0-77)
    
    Returns detailed information about the card
    """
    try:
        card = tarot_service.get_card_by_id(card_id)
        if not card:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Card with ID {card_id} not found"
            )
        return card
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve card: {str(e)}"
        )



@router.get("/history", response_model=ReadingHistoryResponse)
async def get_reading_history(
    limit: int = 10,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tarot_service: TarotService = Depends(get_tarot_service)
):
    """
    Get user's Tarot reading history
    
    - **limit**: Maximum number of readings to return (default: 10)
    - **offset**: Number of readings to skip (default: 0)
    
    Returns the user's reading history ordered by most recent first
    """
    try:
        readings = await tarot_service.get_reading_history(
            db=db,
            user_id=str(current_user.id),
            limit=limit,
            offset=offset
        )
        
        return {
            "readings": readings,
            "total": len(readings)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve reading history: {str(e)}"
        )
