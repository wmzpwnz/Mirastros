"""Mandala Generation Schemas"""

from typing import List
from pydantic import BaseModel, Field
from datetime import date


class MandalaGenerationRequest(BaseModel):
    """Request schema for mandala generation"""
    birth_date: date = Field(..., description="User's birth date for personalized mandala")
    intention: str = Field(
        ...,
        description="Meditation intention (e.g., peace, abundance, healing)",
        max_length=200
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "birth_date": "1990-05-15",
                "intention": "inner peace and spiritual growth"
            }
        }


class MandalaResponse(BaseModel):
    """Response schema for mandala generation"""
    birth_date: str
    intention: str
    mandala_description: str
    colors: List[str]
    symbols: List[str]
    meditation_instructions: str
    affirmation: str
    svg_data: str  # SVG representation of mandala
    timestamp: str
