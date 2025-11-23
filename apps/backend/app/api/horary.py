"""Horary Astrology API Endpoints"""

from fastapi import APIRouter, Depends, HTTPException
from app.schemas.horary import HoraryQuestionRequest, HoraryChartResponse
from app.services.horary import horary_service
from app.core.deps import get_current_user, require_platinum
from app.models.user import User

router = APIRouter(prefix="/horary", tags=["horary"])


@router.post("/ask", response_model=HoraryChartResponse)
async def ask_horary_question(
    request: HoraryQuestionRequest,
    current_user: User = Depends(require_platinum)
):
    """
    Ask a horary astrology question (Platinum tier only)
    
    Horary astrology answers specific questions by casting a chart
    for the moment the question is asked.
    """
    try:
        result = await horary_service.answer_question(request.question)
        return HoraryChartResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to answer horary question: {str(e)}")
