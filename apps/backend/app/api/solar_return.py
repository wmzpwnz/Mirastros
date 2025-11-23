"""Solar Return API Endpoints"""

from fastapi import APIRouter, Depends, HTTPException
from app.schemas.solar_return import SolarReturnRequest, SolarReturnResponse
from app.services.solar_return import solar_return_service
from app.core.deps import require_platinum
from app.models.user import User

router = APIRouter(prefix="/solar-return", tags=["solar-return"])


@router.post("/calculate", response_model=SolarReturnResponse)
async def calculate_solar_return(
    request: SolarReturnRequest,
    current_user: User = Depends(require_platinum)
):
    """
    Calculate solar return chart for yearly forecast (Platinum tier only)
    
    Solar return chart is cast for the moment when the Sun returns to its
    exact natal position, providing insights for the year ahead.
    """
    try:
        result = await solar_return_service.calculate_solar_return(
            request.birth_date,
            request.birth_time,
            request.birth_city,
            request.birth_country
        )
        return SolarReturnResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate solar return: {str(e)}")
