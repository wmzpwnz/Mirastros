"""I Ching API Schemas"""

from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class HexagramInfo(BaseModel):
    """Information about a single hexagram"""
    id: int
    number: int
    name: str
    chinese: str
    trigrams: Dict[str, str]
    binary: str
    judgment: str
    image: str
    meaning: str
    advice: str
    keywords: List[str]


class IChingConsultationRequest(BaseModel):
    """Request for an I Ching consultation"""
    question: str = Field(
        ...,
        description="The question you seek guidance on",
        min_length=10
    )
    method: str = Field(
        default="coin",
        description="Divination method: 'coin' (3 coins) or 'yarrow' (yarrow stalks)"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "question": "Should I pursue this new career opportunity?",
                "method": "coin"
            }
        }


class IChingConsultationResponse(BaseModel):
    """Response from an I Ching consultation"""
    question: str
    method: str
    primary_hexagram: HexagramInfo
    changing_lines: List[int]
    resulting_hexagram: Optional[HexagramInfo]
    interpretation: str
    timestamp: str
    clarify_available: bool = Field(
        default=False,
        description="Whether 'Clarify with Mirastros' feature is available (Premium/Platinum only)"
    )
    consultation_id: Optional[str] = Field(
        None,
        description="ID of the consultation for chat context"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "question": "Should I pursue this new career opportunity?",
                "method": "coin",
                "primary_hexagram": {
                    "id": 1,
                    "number": 1,
                    "name": "The Creative",
                    "chinese": "乾 (Qián)",
                    "trigrams": {"upper": "Heaven", "lower": "Heaven"},
                    "binary": "111111",
                    "judgment": "The Creative works sublime success...",
                    "image": "The movement of heaven is full of power...",
                    "meaning": "Pure creative energy, strength, leadership...",
                    "advice": "This is a time of great potential...",
                    "keywords": ["creativity", "strength", "leadership"]
                },
                "changing_lines": [2, 5],
                "resulting_hexagram": {
                    "id": 14,
                    "number": 14,
                    "name": "Great Possession",
                    "chinese": "大有 (Dà Yǒu)",
                    "trigrams": {"upper": "Fire", "lower": "Heaven"},
                    "binary": "101111",
                    "judgment": "Great Possession: supreme success.",
                    "image": "Fire in heaven above.",
                    "meaning": "Abundance, great wealth, success...",
                    "advice": "Use your abundance wisely...",
                    "keywords": ["abundance", "wealth", "success"]
                },
                "interpretation": "The I Ching reveals profound guidance...",
                "timestamp": "2025-11-21T10:30:00",
                "clarify_available": True,
                "consultation_id": "550e8400-e29b-41d4-a716-446655440000"
            }
        }


class HexagramListResponse(BaseModel):
    """Response containing all hexagrams"""
    hexagrams: List[HexagramInfo]
    total: int


class ConsultationHistoryItem(BaseModel):
    """Single consultation history item"""
    id: str
    question: str
    method: str
    primary_hexagram: HexagramInfo
    changing_lines: List[int]
    resulting_hexagram: Optional[HexagramInfo]
    interpretation: str
    created_at: str


class ConsultationHistoryResponse(BaseModel):
    """Response containing consultation history"""
    consultations: List[ConsultationHistoryItem]
    total: int
    limit: int
    offset: int
