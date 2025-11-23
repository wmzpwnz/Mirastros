"""I Ching API Endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.services.iching import IChingService
from app.services.llm import UnifiedLLMService
from app.services.rag import RAGService
from app.schemas.iching import (
    IChingConsultationRequest,
    IChingConsultationResponse,
    HexagramListResponse,
    HexagramInfo,
    ConsultationHistoryResponse
)

router = APIRouter(prefix="/iching", tags=["iching"])


def get_iching_service(
    db: AsyncSession = Depends(get_db)
) -> IChingService:
    """Dependency to get IChingService instance"""
    llm_service = UnifiedLLMService()
    rag_service = RAGService()
    return IChingService(llm_service=llm_service, rag_service=rag_service)


@router.post("/consultation", response_model=IChingConsultationResponse)
async def perform_iching_consultation(
    request: IChingConsultationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    iching_service: IChingService = Depends(get_iching_service)
):
    """
    Perform an I Ching consultation
    
    - **question**: Your question for the I Ching (minimum 10 characters)
    - **method**: Divination method - 'coin' (3 coins tossed 6 times) or 'yarrow' (traditional yarrow stalk method)
    
    The I Ching will provide:
    - Primary hexagram representing the current situation
    - Changing lines (if any) indicating transformation
    - Resulting hexagram (if changing lines exist) showing the future situation
    - AI-generated interpretation with practical guidance
    
    Returns the hexagrams and comprehensive interpretation
    """
    try:
        # Get user context (zodiac sign if available)
        user_context = {}
        if hasattr(current_user, 'zodiac_sign') and current_user.zodiac_sign:
            user_context["zodiac_sign"] = current_user.zodiac_sign
        
        # Perform consultation
        consultation = await iching_service.perform_consultation(
            db=db,
            question=request.question,
            method=request.method,
            user_id=str(current_user.id),
            user_context=user_context
        )
        
        return consultation
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to perform I Ching consultation: {str(e)}"
        )


@router.get("/hexagrams", response_model=HexagramListResponse)
async def get_all_hexagrams(
    iching_service: IChingService = Depends(get_iching_service)
):
    """
    Get all 64 I Ching hexagrams
    
    Returns information about all hexagrams including their:
    - Number and name
    - Chinese characters
    - Trigrams (upper and lower)
    - Judgment and Image
    - Meaning and advice
    - Keywords
    """
    try:
        hexagrams = iching_service.get_all_hexagrams()
        return {
            "hexagrams": hexagrams,
            "total": len(hexagrams)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve hexagrams: {str(e)}"
        )


@router.get("/hexagrams/{hexagram_number}", response_model=HexagramInfo)
async def get_hexagram_by_number(
    hexagram_number: int,
    iching_service: IChingService = Depends(get_iching_service)
):
    """
    Get a specific hexagram by its number
    
    - **hexagram_number**: Number of the hexagram (1-64)
    
    Returns detailed information about the hexagram including:
    - Traditional judgment and image
    - Meaning and interpretation
    - Practical advice
    - Associated keywords
    """
    try:
        if hexagram_number < 1 or hexagram_number > 64:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Hexagram number must be between 1 and 64"
            )
        
        hexagram = iching_service.get_hexagram_by_number(hexagram_number)
        if not hexagram:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hexagram #{hexagram_number} not found"
            )
        return hexagram
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve hexagram: {str(e)}"
        )


@router.get("/history", response_model=ConsultationHistoryResponse)
async def get_consultation_history(
    limit: int = 10,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    iching_service: IChingService = Depends(get_iching_service)
):
    """
    Get user's I Ching consultation history
    
    - **limit**: Maximum number of consultations to return (default: 10)
    - **offset**: Number of consultations to skip for pagination (default: 0)
    
    Returns a list of past consultations with:
    - Question asked
    - Method used (coin or yarrow)
    - Hexagrams received
    - Interpretation provided
    - Timestamp of consultation
    """
    try:
        consultations = await iching_service.get_consultation_history(
            db=db,
            user_id=str(current_user.id),
            limit=limit,
            offset=offset
        )
        
        return {
            "consultations": consultations,
            "total": len(consultations),
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve consultation history: {str(e)}"
        )
