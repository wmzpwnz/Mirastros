"""Karmic Tasks API Endpoints"""

from fastapi import APIRouter, Depends, HTTPException
from app.schemas.karmic import KarmicAnalysisRequest, KarmicAnalysisResponse
from app.services.karmic import karmic_service
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/karmic", tags=["karmic"])


@router.post("/analyze", response_model=KarmicAnalysisResponse)
async def analyze_karmic_path(
    request: KarmicAnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Analyze karmic path based on Lunar Nodes
    
    Provides insights into past life patterns, soul lessons,
    and life purpose based on North and South Nodes in natal chart.
    """
    try:
        result = await karmic_service.analyze_karmic_path(
            request.birth_date,
            request.birth_time,
            request.birth_city,
            request.birth_country
        )
        return KarmicAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze karmic path: {str(e)}")
