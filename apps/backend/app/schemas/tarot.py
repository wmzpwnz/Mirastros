"""Tarot API Schemas"""

from typing import List, Optional
from pydantic import BaseModel, Field


class CardInfo(BaseModel):
    """Information about a single Tarot card"""
    id: int
    name: str
    suit: str
    number: int
    keywords: List[str]
    upright: str
    reversed: str


class DrawnCard(BaseModel):
    """A card drawn in a reading"""
    id: int
    name: str
    suit: str
    number: int
    keywords: List[str]
    position: str
    reversed: bool
    interpretation: str


class TarotReadingRequest(BaseModel):
    """Request for a Tarot reading"""
    spread_type: str = Field(
        ...,
        description="Type of spread: one-card, three-card, five-card, or celtic-cross"
    )
    question: Optional[str] = Field(
        None,
        max_length=1000, description="Optional question for the reading"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "spread_type": "three-card",
                "question": "What do I need to know about my career path?"
            }
        }


class TarotReadingResponse(BaseModel):
    """Response from a Tarot reading"""
    spread_type: str
    question: Optional[str]
    cards: List[DrawnCard]
    interpretation: str
    timestamp: str
    clarify_available: bool = Field(
        default=False,
        description="Whether 'Clarify with Mirastros' feature is available (Premium/Platinum only)"
    )
    reading_id: Optional[str] = Field(
        None,
        description="ID of the saved reading for bounded result explanations"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "spread_type": "three-card",
                "question": "What do I need to know about my career path?",
                "cards": [
                    {
                        "id": 1,
                        "name": "The Magician",
                        "suit": "major",
                        "number": 1,
                        "keywords": ["manifestation", "power", "skill"],
                        "position": "Past",
                        "reversed": False,
                        "interpretation": "The Magician signifies manifestation..."
                    }
                ],
                "interpretation": "The cards reveal a powerful message about your career...",
                "timestamp": "2025-11-21T10:30:00",
                "clarify_available": True,
                "reading_id": "550e8400-e29b-41d4-a716-446655440000"
            }
        }


class CardListResponse(BaseModel):
    """Response containing all cards"""
    cards: List[CardInfo]
    total: int


class CardsBySuitResponse(BaseModel):
    """Response containing cards filtered by suit"""
    suit: str
    cards: List[CardInfo]
    total: int



class ReadingHistoryItem(BaseModel):
    """A single reading from history"""
    id: str
    spread_type: str
    question: Optional[str]
    cards: List[DrawnCard]
    interpretation: str
    created_at: str


class ReadingHistoryResponse(BaseModel):
    """Response containing reading history"""
    readings: List[ReadingHistoryItem]
    total: int
