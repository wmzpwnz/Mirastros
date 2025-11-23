"""Runes API Schemas"""

from typing import List, Optional
from pydantic import BaseModel, Field


class RuneInfo(BaseModel):
    """Information about a single rune"""
    id: int
    name: str
    symbol: str
    meaning: str
    keywords: List[str]
    upright: str
    reversed: str


class DrawnRune(BaseModel):
    """A rune drawn in a reading"""
    id: int
    name: str
    symbol: str
    meaning: str
    keywords: List[str]
    position: str
    reversed: bool
    interpretation: str


class RuneReadingRequest(BaseModel):
    """Request for a rune reading"""
    spread_type: str = Field(
        ...,
        description="Type of spread: one-rune, three-rune, or cross"
    )
    question: Optional[str] = Field(
        None,
        description="Optional question for the reading"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "spread_type": "three-rune",
                "question": "What should I focus on this week?"
            }
        }


class RuneReadingResponse(BaseModel):
    """Response from a rune reading"""
    spread_type: str
    question: Optional[str]
    runes: List[DrawnRune]
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
    
    class Config:
        json_schema_extra = {
            "example": {
                "spread_type": "three-rune",
                "question": "What should I focus on this week?",
                "runes": [
                    {
                        "id": 1,
                        "name": "Fehu",
                        "symbol": "ᚠ",
                        "meaning": "Cattle, Wealth",
                        "keywords": ["prosperity", "abundance", "success"],
                        "position": "Past",
                        "reversed": False,
                        "interpretation": "Fehu represents wealth and prosperity..."
                    }
                ],
                "interpretation": "The runes reveal a powerful message...",
                "timestamp": "2025-11-21T10:30:00",
                "clarify_available": True,
                "reading_id": "550e8400-e29b-41d4-a716-446655440000"
            }
        }


class RuneListResponse(BaseModel):
    """Response containing all runes"""
    runes: List[RuneInfo]
    total: int
