"""Mandala Generation API Endpoints"""

from fastapi import APIRouter, Depends, HTTPException
from app.schemas.mandala import MandalaGenerationRequest, MandalaResponse
from app.services.mandala import mandala_service
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/mandala", tags=["mandala"])


@router.post("/generate", response_model=MandalaResponse)
async def generate_mandala(
    request: MandalaGenerationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate personalized mandala for meditation
    
    Creates a unique mandala based on birth date and intention,
    with meditation instructions and downloadable SVG.
    """
    try:
        result = await mandala_service.generate_mandala(
            request.birth_date,
            request.intention
        )
        return MandalaResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate mandala: {str(e)}")
