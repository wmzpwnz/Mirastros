"""Unified consultation history API"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.history import (
    ConsultationHistoryItem,
    ConsultationHistoryResponse,
    ConsultationDetailResponse,
    HistoryStatsResponse,
    CONSULTATION_TYPES,
)
from app.services.history_service import (
    get_unified_history,
    get_consultation_detail,
    delete_consultation as svc_delete_consultation,
    get_history_stats,
)

router = APIRouter(prefix="/history", tags=["Consultation History"])


@router.get("", response_model=ConsultationHistoryResponse)
async def list_history(
    service_type: Optional[str] = Query(None, description="Filter by type: tarot, numerology, iching, dreams, lenormand, synastry"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    favorites_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get unified consultation history with pagination.
    Optional filter by service_type. Requires authentication.
    """
    if service_type and service_type not in CONSULTATION_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid service_type. Must be one of: {CONSULTATION_TYPES}")
    try:
        items, total = await get_unified_history(
            db=db,
            user_id=str(current_user.id),
            service_type=service_type,
            page=page,
            page_size=page_size,
            favorites_only=favorites_only,
        )
        total_pages = (total + page_size - 1) // page_size if total else 1
        return ConsultationHistoryResponse(
            items=[ConsultationHistoryItem(**it) for it in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load history: {str(e)}",
        )


@router.get("/stats", response_model=HistoryStatsResponse)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get consultation statistics for current user."""
    try:
        stats = await get_history_stats(db=db, user_id=str(current_user.id))
        return HistoryStatsResponse(**stats)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load stats: {str(e)}",
        )


@router.get("/{consultation_type}/{consultation_id}", response_model=ConsultationDetailResponse)
async def get_detail(
    consultation_type: str,
    consultation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get single consultation by type and id. Returns 404 if not found or not owner."""
    if consultation_type not in CONSULTATION_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid type. Must be one of: {CONSULTATION_TYPES}")
    detail = await get_consultation_detail(
        db=db,
        user_id=str(current_user.id),
        consultation_type=consultation_type,
        consultation_id=consultation_id,
    )
    if not detail:
        raise HTTPException(status_code=404, detail="Consultation not found")
    return ConsultationDetailResponse(**detail)


@router.delete("/{consultation_type}/{consultation_id}")
async def delete_consultation(
    consultation_type: str,
    consultation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a consultation. Returns 404 if not found or not owner."""
    if consultation_type not in CONSULTATION_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid type. Must be one of: {CONSULTATION_TYPES}")
    deleted = await svc_delete_consultation(
        db=db,
        user_id=str(current_user.id),
        consultation_type=consultation_type,
        consultation_id=consultation_id,
    )
    if not deleted:
        raise HTTPException(status_code=404, detail="Consultation not found")
    return {"deleted": True}
