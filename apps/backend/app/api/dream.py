"""Dream Interpretation API Endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.core.access_control import require_feature_access
from app.models.user import User
from app.services.dream import DreamService
from app.services.llm import UnifiedLLMService
from app.services.rag import RAGService
from app.schemas.dream import (
    DreamInterpretationRequest,
    DreamInterpretationResponse,
    DreamDictionaryResponse,
    DreamSymbolInfo,
    DreamHistoryResponse,
    DreamPatternsResponse
)

router = APIRouter(prefix="/dreams", tags=["dreams"])


def get_dream_service(
    db: AsyncSession = Depends(get_db)
) -> DreamService:
    """Dependency to get DreamService instance"""
    llm_service = UnifiedLLMService()
    rag_service = RAGService()
    return DreamService(llm_service=llm_service, rag_service=rag_service)


@router.post("/interpret", response_model=DreamInterpretationResponse)
@require_feature_access("dream_interpretation", check_usage=True)
async def interpret_dream(
    request: DreamInterpretationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    dream_service: DreamService = Depends(get_dream_service)
):
    """
    Interpret a dream
    
    **Access**: Freemium (1 per day), Premium/Platinum (unlimited)
    
    - **dream_description**: Description of the dream (minimum 10 characters)
    
    Returns identified symbols, interpretation, themes, and emotions
    """
    try:
        # Get user context (zodiac sign, birth date if available)
        user_context = {}
        if hasattr(current_user, 'zodiac_sign') and current_user.zodiac_sign:
            user_context["zodiac_sign"] = current_user.zodiac_sign
        if hasattr(current_user, 'birth_date') and current_user.birth_date:
            user_context["birth_date"] = str(current_user.birth_date)
        
        # Interpret dream
        interpretation = await dream_service.interpret_dream(
            db=db,
            dream_description=request.dream_description,
            user_context=user_context,
            user_id=str(current_user.id)
        )
        
        return interpretation
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to interpret dream: {str(e)}"
        )


@router.get("/dictionary", response_model=DreamDictionaryResponse)
async def get_dream_dictionary(
    dream_service: DreamService = Depends(get_dream_service)
):
    """
    Get dream symbol dictionary
    
    Returns all dream symbols with their meanings and keywords
    """
    try:
        symbols = dream_service.get_dream_dictionary()
        
        symbol_info = [
            DreamSymbolInfo(
                symbol=s["symbol"],
                meaning=s["meaning"],
                keywords=s["keywords"],
                category=s["category"]
            )
            for s in symbols
        ]
        
        return {
            "symbols": symbol_info,
            "total": len(symbol_info)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve dream dictionary: {str(e)}"
        )


@router.get("/dictionary/search", response_model=DreamDictionaryResponse)
async def search_dream_symbols(
    query: str,
    dream_service: DreamService = Depends(get_dream_service)
):
    """
    Search dream symbols
    
    - **query**: Search query (symbol name or keyword)
    
    Returns matching dream symbols
    """
    try:
        if not query or len(query) < 2:
            raise ValueError("Query must be at least 2 characters long")
        
        symbols = dream_service.search_dream_symbols(query)
        
        symbol_info = [
            DreamSymbolInfo(
                symbol=s["symbol"],
                meaning=s["meaning"],
                keywords=s["keywords"],
                category=s["category"]
            )
            for s in symbols
        ]
        
        return {
            "symbols": symbol_info,
            "total": len(symbol_info)
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search dream symbols: {str(e)}"
        )


@router.get("/history", response_model=DreamHistoryResponse)
async def get_dream_history(
    limit: int = 10,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    dream_service: DreamService = Depends(get_dream_service)
):
    """
    Get user's dream journal history
    
    - **limit**: Maximum number of dreams to return (default: 10)
    - **offset**: Number of dreams to skip (default: 0)
    
    Returns the user's dream journal ordered by most recent first
    """
    try:
        dreams = await dream_service.get_dream_history(
            db=db,
            user_id=str(current_user.id),
            limit=limit,
            offset=offset
        )
        
        return {
            "dreams": dreams,
            "total": len(dreams)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve dream history: {str(e)}"
        )


@router.get("/patterns", response_model=DreamPatternsResponse)
async def analyze_dream_patterns(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    dream_service: DreamService = Depends(get_dream_service)
):
    """
    Analyze recurring patterns in user's dreams
    
    Returns recurring symbols, themes, emotions, and AI-generated insights
    about what these patterns reveal
    """
    try:
        patterns = await dream_service.analyze_dream_patterns(
            db=db,
            user_id=str(current_user.id)
        )
        
        return patterns
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze dream patterns: {str(e)}"
        )
