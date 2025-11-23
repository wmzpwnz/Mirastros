"""Lenormand Schemas"""

from typing import List, Optional
from pydantic import BaseModel, Field


class LenormandReadingRequest(BaseModel):
    """Request schema for Lenormand reading"""
    spread_type: str = Field(
        ...,
        description="Type of spread: three-card, five-card, nine-card"
    )
    question: Optional[str] = Field(
        None,
        description="Optional question for the reading"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "spread_type": "three-card",
                "question": "What should I focus on in my career this month?"
            }
        }


class LenormandCard(BaseModel):
    """Schema for a single Lenormand card"""
    id: int
    name: str
    number: int
    keywords: List[str]
    meaning: str
    position: str
    position_index: int


class LenormandReadingResponse(BaseModel):
    """Response schema for Lenormand reading"""
    spread_type: str
    question: Optional[str]
    cards: List[LenormandCard]
    interpretation: str
    timestamp: str
    clarify_available: bool = Field(
        default=False,
        description="Whether 'Clarify with Mirastros' feature is available (Premium/Platinum only)"
    )
    reading_id: Optional[str] = Field(
        None,
        description="ID of the reading for chat context"
    )


class LenormandCardInfo(BaseModel):
    """Schema for detailed card information"""
    id: int
    name: str
    number: int
    keywords: List[str]
    meaning: str
    combinations: dict


class LenormandCardListResponse(BaseModel):
    """Response schema for list of all cards"""
    cards: List[LenormandCardInfo]
    total: int
