"""Numerology API Schemas"""

from typing import Optional, Dict
from pydantic import BaseModel, Field


class NumberMeaning(BaseModel):
    """Meaning of a numerology number"""
    number: int
    name: str
    keywords: list[str]
    description: str
    strengths: str
    challenges: str
    life_path: str
    career: str
    relationships: str


class NumerologyCalculationRequest(BaseModel):
    """Request for numerology calculation"""
    full_name: str = Field(
        ...,
        description="Full name (first, middle, last)",
        min_length=2,
        max_length=255
    )
    birth_date: str = Field(
        ...,
        description="Birth date in YYYY-MM-DD format",
        pattern=r"^\d{4}-\d{2}-\d{2}$"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "John Michael Smith",
                "birth_date": "1990-05-15"
            }
        }


class NumerologyNumbers(BaseModel):
    """Calculated numerology numbers"""
    life_path_number: int = Field(..., description="Life Path Number (1-9, 11, 22, 33)")
    destiny_number: int = Field(..., description="Destiny Number (1-9, 11, 22, 33)")
    soul_urge_number: int = Field(..., description="Soul Urge Number (1-9, 11, 22, 33)")
    personality_number: int = Field(..., description="Personality Number (1-9, 11, 22, 33)")


class NumerologyCalculationResponse(BaseModel):
    """Response from numerology calculation"""
    full_name: str
    birth_date: str
    numbers: NumerologyNumbers
    interpretation: str
    timestamp: str
    clarify_available: bool = Field(
        default=False,
        description="Whether 'Clarify with Mirastros' feature is available (Premium/Platinum only)"
    )
    calculation_id: Optional[str] = Field(
        None,
        description="ID of the calculation for chat context"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "John Michael Smith",
                "birth_date": "1990-05-15",
                "numbers": {
                    "life_path_number": 3,
                    "destiny_number": 7,
                    "soul_urge_number": 5,
                    "personality_number": 2
                },
                "interpretation": "Your Life Path Number 3 reveals that you are here to express yourself creatively...",
                "timestamp": "2025-11-21T10:30:00",
                "clarify_available": True,
                "calculation_id": "550e8400-e29b-41d4-a716-446655440000"
            }
        }


class NumberMeaningResponse(BaseModel):
    """Response containing meaning of a specific number"""
    number: int
    meaning: NumberMeaning


class AllNumberMeaningsResponse(BaseModel):
    """Response containing all number meanings"""
    meanings: Dict[int, NumberMeaning]
    total: int


class NumerologyHistoryItem(BaseModel):
    """A single numerology calculation from history"""
    id: str
    full_name: str
    birth_date: str
    numbers: NumerologyNumbers
    interpretation: str
    created_at: str


class NumerologyHistoryResponse(BaseModel):
    """Response containing numerology calculation history"""
    calculations: list[NumerologyHistoryItem]
    total: int
