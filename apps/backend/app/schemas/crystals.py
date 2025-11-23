"""Crystals API Schemas"""

from typing import List, Optional
from pydantic import BaseModel, Field


class CrystalInfo(BaseModel):
    """Information about a single crystal"""
    id: int
    name: str
    color: str
    chakra: str
    zodiac_signs: List[str]
    properties: List[str]
    healing: str
    uses: str
    element: str
    planet: str
    description: str


class CrystalRecommendationRequest(BaseModel):
    """Request for crystal recommendations"""
    goal: Optional[str] = Field(
        None,
        description="Specific goal (e.g., 'protection', 'love', 'wealth', 'healing')"
    )
    zodiac_sign: Optional[str] = Field(
        None,
        description="Zodiac sign for personalized recommendations"
    )
    chakra: Optional[str] = Field(
        None,
        description="Specific chakra to work with"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "goal": "protection",
                "zodiac_sign": "Scorpio",
                "chakra": "root"
            }
        }


class CrystalRecommendationResponse(BaseModel):
    """Response with crystal recommendations"""
    recommendations: List[CrystalInfo]
    interpretation: str
    total: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "recommendations": [
                    {
                        "id": 4,
                        "name": "Black Tourmaline",
                        "color": "Black",
                        "chakra": "Root",
                        "zodiac_signs": ["Capricorn", "Scorpio"],
                        "properties": ["protection", "grounding", "purification"],
                        "healing": "Shields from negative energy...",
                        "uses": "Place near electronics...",
                        "element": "Earth",
                        "planet": "Saturn",
                        "description": "Black Tourmaline is a powerful grounding stone..."
                    }
                ],
                "interpretation": "Based on your Scorpio energy and need for protection...",
                "total": 3
            }
        }


class CrystalListResponse(BaseModel):
    """Response containing all crystals"""
    crystals: List[CrystalInfo]
    total: int


class CrystalsByZodiacRequest(BaseModel):
    """Request for crystals by zodiac sign"""
    zodiac_sign: str = Field(
        ...,
        description="Zodiac sign (Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces)"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "zodiac_sign": "Leo"
            }
        }


class CrystalsByPropertyRequest(BaseModel):
    """Request for crystals by property"""
    property: str = Field(
        ...,
        description="Property to search for (e.g., 'love', 'protection', 'abundance')"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "property": "abundance"
            }
        }
