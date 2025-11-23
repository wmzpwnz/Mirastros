"""Chakra Analysis API Endpoints"""

from fastapi import APIRouter, Depends, HTTPException
from app.schemas.chakra import ChakraAnalysisRequest, ChakraAnalysisResponse
from app.services.chakra import chakra_service
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/chakra", tags=["chakra"])


@router.post("/analyze", response_model=ChakraAnalysisResponse)
async def analyze_chakras(
    request: ChakraAnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Analyze chakras based on birth date
    
    Provides detailed analysis of all 7 chakras, their balance status,
    and personalized recommendations for energy healing.
    """
    try:
        result = await chakra_service.analyze_chakras(request.birth_date)
        return ChakraAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze chakras: {str(e)}")
