"""Destiny Matrix API Endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import logging

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.access_control import FeatureAccessControl, require_feature_access
from app.models.user import User, SubscriptionTier
from app.services.destiny_matrix import DestinyMatrixService, get_destiny_matrix_service
from app.services.llm import UnifiedLLMService
from app.services.rag import RAGService
from app.schemas.destiny_matrix import (
    DestinyMatrixCalculateRequest,
    DestinyMatrixResponse,
    DestinyMatrixBasicLines,
    DestinyMatrixExtendedLines,
)

router = APIRouter(prefix="/destiny-matrix", tags=["Destiny Matrix"])
logger = logging.getLogger(__name__)


def get_service(
    db: AsyncSession = Depends(get_db)
) -> DestinyMatrixService:
    """Dependency to get DestinyMatrixService instance"""
    llm_service = UnifiedLLMService()
    rag_service = RAGService()
    return get_destiny_matrix_service(llm_service, rag_service)


@router.post("/calculate", response_model=DestinyMatrixResponse)
@require_feature_access("destiny-matrix", check_usage=True)
async def calculate_destiny_matrix(
    request: DestinyMatrixCalculateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: DestinyMatrixService = Depends(get_service)
):
    """
    Calculate destiny matrix and generate interpretation
    
    **Access**: Freemium (1 calculation), Premium/Platinum (unlimited)
    
    - **birth_date**: Birth date in YYYY-MM-DD format
    
    Returns 4x4 matrix, lines of destiny, active arcana, and AI interpretation
    """
    try:
        # Perform destiny matrix calculation
        result = await service.calculate_and_interpret(
            db=db,
            birth_date=request.birth_date,
            user_id=str(current_user.id)
        )

        # Check if user has Premium/Platinum for clarify feature
        tier = FeatureAccessControl._normalize_tier(current_user.subscription_tier)
        clarify_available = tier in [SubscriptionTier.PREMIUM, SubscriptionTier.PLATINUM]

        return DestinyMatrixResponse(
            birth_date=result["birth_date"],
            calculation_version=result["calculation_version"],
            matrix_data=result["matrix_data"],
            lines=DestinyMatrixBasicLines(**result["lines_basic"]),
            lines_basic=DestinyMatrixBasicLines(**result["lines_basic"]),
            lines_extended=DestinyMatrixExtendedLines(**result["lines_extended"]),
            positions=result["positions"],
            layout_meta=result["layout_meta"],
            active_arcana=result["active_arcana"],
            interpretation=result["interpretation"],
            matrix_id=result.get("matrix_id"),
            clarify_available=clarify_available
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.exception("Failed to calculate destiny matrix")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate destiny matrix"
        )


@router.get("/me", response_model=Optional[DestinyMatrixResponse])
async def get_my_destiny_matrix(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: DestinyMatrixService = Depends(get_service)
):
    """
    Get current user's stored destiny matrix
    
    Returns the user's destiny matrix if it exists, otherwise None
    """
    try:
        result = await service.get_user_matrix(
            db=db,
            user_id=str(current_user.id)
        )
        
        if not result:
            return None

        # Check if user has Premium/Platinum for clarify feature
        tier = FeatureAccessControl._normalize_tier(current_user.subscription_tier)
        clarify_available = tier in [SubscriptionTier.PREMIUM, SubscriptionTier.PLATINUM]

        return DestinyMatrixResponse(
            birth_date=result["birth_date"],
            calculation_version=result["calculation_version"],
            matrix_data=result["matrix_data"],
            lines=DestinyMatrixBasicLines(**result["lines_basic"]),
            lines_basic=DestinyMatrixBasicLines(**result["lines_basic"]),
            lines_extended=DestinyMatrixExtendedLines(**result["lines_extended"]),
            positions=result["positions"],
            layout_meta=result["layout_meta"],
            active_arcana=result["active_arcana"],
            interpretation=result["interpretation"],
            matrix_id=result.get("id"),
            clarify_available=clarify_available
        )
    
    except Exception as e:
        logger.exception("Failed to retrieve destiny matrix")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve destiny matrix"
        )





