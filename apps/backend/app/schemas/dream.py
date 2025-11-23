"""Dream Interpretation API Schemas"""

from typing import List, Optional
from pydantic import BaseModel, Field


class DreamSymbol(BaseModel):
    """A symbol identified in a dream"""
    symbol: str
    meaning: str


class DreamInterpretationRequest(BaseModel):
    """Request for dream interpretation"""
    dream_description: str = Field(
        ...,
        description="Description of the dream",
        min_length=10
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "dream_description": "I was flying over a vast ocean, and suddenly I saw a golden bird leading me towards an island with a beautiful temple."
            }
        }


class DreamInterpretationResponse(BaseModel):
    """Response from dream interpretation"""
    dream_description: str
    symbols: List[DreamSymbol]
    interpretation: str
    themes: List[str]
    emotions: List[str]
    timestamp: str
    clarify_available: bool = Field(
        default=False,
        description="Whether 'Clarify with Mirastros' feature is available (Premium/Platinum only)"
    )
    dream_id: Optional[str] = Field(
        None,
        description="ID of the dream interpretation for chat context"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "dream_description": "I was flying over a vast ocean...",
                "symbols": [
                    {
                        "symbol": "flying",
                        "meaning": "Freedom, transcendence, rising above challenges"
                    },
                    {
                        "symbol": "ocean",
                        "meaning": "Emotions, the unconscious mind, vast possibilities"
                    }
                ],
                "interpretation": "Your dream reveals a powerful journey of spiritual awakening...",
                "themes": ["freedom", "spiritual journey", "guidance"],
                "emotions": ["wonder", "excitement", "peace"],
                "timestamp": "2025-11-21T10:30:00",
                "clarify_available": True,
                "dream_id": "550e8400-e29b-41d4-a716-446655440000"
            }
        }


class DreamSymbolInfo(BaseModel):
    """Information about a dream symbol"""
    symbol: str
    meaning: str
    keywords: List[str]
    category: str


class DreamDictionaryResponse(BaseModel):
    """Response containing dream dictionary"""
    symbols: List[DreamSymbolInfo]
    total: int


class DreamHistoryItem(BaseModel):
    """A single dream from history"""
    id: str
    dream_description: str
    symbols: List[DreamSymbol]
    interpretation: str
    themes: List[str]
    emotions: List[str]
    created_at: str


class DreamHistoryResponse(BaseModel):
    """Response containing dream journal history"""
    dreams: List[DreamHistoryItem]
    total: int


class DreamPatternsResponse(BaseModel):
    """Response containing recurring dream patterns"""
    recurring_symbols: List[dict]
    recurring_themes: List[dict]
    recurring_emotions: List[dict]
    insights: str
