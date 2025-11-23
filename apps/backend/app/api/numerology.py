"""Numerology API Endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.core.access_control import require_feature_access
from app.models.user import User
from app.services.numerology import NumerologyService
from app.services.llm import UnifiedLLMService
from app.services.rag import RAGService
from app.schemas.numerology import (
    NumerologyCalculationRequest,
    NumerologyCalculationResponse,
    NumberMeaningResponse,
    AllNumberMeaningsResponse,
    NumerologyHistoryResponse
)

router = APIRouter(prefix="/numerology", tags=["numerology"])


def get_numerology_service(
    db: AsyncSession = Depends(get_db)
) -> NumerologyService:
    """Dependency to get NumerologyService instance"""
    llm_service = UnifiedLLMService()
    rag_service = RAGService()
    return NumerologyService(llm_service=llm_service, rag_service=rag_service)


@router.post("/calculate", response_model=NumerologyCalculationResponse)
@require_feature_access("numerology", check_usage=True)
async def calculate_numerology(
    request: NumerologyCalculationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    numerology_service: NumerologyService = Depends(get_numerology_service)
):
    """
    Calculate numerology numbers and generate interpretation
    
    **Access**: Freemium (1 calculation), Premium/Platinum (unlimited)
    
    - **full_name**: Full name (first, middle, last)
    - **birth_date**: Birth date in YYYY-MM-DD format
    
    Returns Life Path, Destiny, Soul Urge, and Personality numbers with AI interpretation
    """
    try:
        # Perform numerology calculation
        result = await numerology_service.calculate_numerology(
            db=db,
            full_name=request.full_name,
            birth_date=request.birth_date,
            user_id=str(current_user.id)
        )
        
        return result
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate numerology: {str(e)}"
        )


@router.get("/me")
async def get_my_numerology(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    numerology_service: NumerologyService = Depends(get_numerology_service)
):
    """
    Get current user's stored numerology calculation
    
    Returns the user's most recent numerology calculation if it exists
    """
    try:
        result = await numerology_service.get_user_numerology(
            db=db,
            user_id=str(current_user.id)
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No numerology calculation found for this user. Please calculate first."
            )
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve numerology: {str(e)}"
        )


@router.get("/numbers/{number}", response_model=NumberMeaningResponse)
async def get_number_meaning(
    number: int,
    numerology_service: NumerologyService = Depends(get_numerology_service)
):
    """
    Get the meaning of a specific numerology number
    
    - **number**: Numerology number (1-9, 11, 22, 33)
    
    Returns detailed meaning and interpretation of the number
    """
    try:
        meaning = numerology_service.get_number_meaning(number)
        return {
            "number": number,
            "meaning": meaning
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve number meaning: {str(e)}"
        )


@router.get("/numbers", response_model=AllNumberMeaningsResponse)
async def get_all_number_meanings(
    numerology_service: NumerologyService = Depends(get_numerology_service)
):
    """
    Get meanings for all numerology numbers
    
    Returns detailed meanings for all numbers (1-9, 11, 22, 33)
    """
    try:
        meanings = numerology_service.get_all_number_meanings()
        return {
            "meanings": meanings,
            "total": len(meanings)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve number meanings: {str(e)}"
        )


@router.get("/history", response_model=NumerologyHistoryResponse)
async def get_calculation_history(
    limit: int = 10,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    numerology_service: NumerologyService = Depends(get_numerology_service)
):
    """
    Get user's numerology calculation history
    
    - **limit**: Maximum number of calculations to return (default: 10)
    - **offset**: Number of calculations to skip (default: 0)
    
    Returns the user's calculation history ordered by most recent first
    """
    try:
        calculations = await numerology_service.get_calculation_history(
            db=db,
            user_id=str(current_user.id),
            limit=limit,
            offset=offset
        )
        
        return {
            "calculations": calculations,
            "total": len(calculations)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve calculation history: {str(e)}"
        )
