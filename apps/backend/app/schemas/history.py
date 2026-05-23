"""Consultation history API schemas"""
from typing import Optional, List, Any
from pydantic import BaseModel, Field


CONSULTATION_TYPES = ["tarot", "numerology", "iching", "dreams", "lenormand", "synastry"]


class ConsultationHistoryItem(BaseModel):
    """Single consultation in unified history list"""
    id: str
    type: str = Field(..., description="Service type: tarot, numerology, iching, dreams, lenormand, synastry")
    title: str
    question: Optional[str] = None
    preview: str
    created_at: str
    is_favorite: bool = False
    raw: Optional[dict] = None  # Full payload for detail view


class ConsultationHistoryResponse(BaseModel):
    """Paginated unified history response"""
    items: List[ConsultationHistoryItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class ConsultationDetailResponse(BaseModel):
    """Full consultation detail (type-specific payload)"""
    id: str
    type: str
    title: str
    question: Optional[str] = None
    result: Any  # Full interpretation / cards / etc.
    created_at: str
    is_favorite: bool = False
    raw: dict  # Complete API response for this type


class HistoryStatsResponse(BaseModel):
    """Consultation statistics"""
    total_consultations: int
    by_service: dict  # {"tarot": 10, "numerology": 5, ...}
    most_used_service: str
    first_consultation_at: Optional[str] = None
    last_consultation_at: Optional[str] = None
    favorites_count: int = 0


class FavoriteToggleResponse(BaseModel):
    """Response after toggling favorite"""
    id: str
    type: str
    is_favorite: bool


class BulkDeleteRequest(BaseModel):
    """Bulk delete request"""
    consultation_ids: List[str]  # List of "type:id" e.g. ["tarot:uuid", "numerology:uuid"]


class BulkDeleteResponse(BaseModel):
    """Bulk delete response"""
    deleted_count: int
    failed_ids: List[str] = []


class BulkFavoriteRequest(BaseModel):
    """Bulk favorite request"""
    consultation_ids: List[str]
    action: str = Field(..., pattern="^(add|remove)$")


class BulkFavoriteResponse(BaseModel):
    """Bulk favorite response"""
    updated_count: int
    failed_ids: List[str] = []


class ExportRequest(BaseModel):
    """Export request (Premium)"""
    consultation_ids: List[str]
    format: str = Field(..., pattern="^(pdf|json|csv)$")
    include_metadata: bool = True


class ShareRequest(BaseModel):
    """Share request (Platinum)"""
    consultation_id: str  # "type:id"


class ShareResponse(BaseModel):
    """Share link response"""
    share_url: str
    share_token: str
    expires_at: Optional[str] = None
