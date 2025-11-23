"""Karmic Tasks Schemas"""

from typing import List
from pydantic import BaseModel, Field
from datetime import date


class KarmicAnalysisRequest(BaseModel):
    """Request schema for karmic analysis"""
    birth_date: date = Field(..., description="User's birth date")
    birth_time: str = Field(..., description="Birth time in HH:MM format")
    birth_city: str = Field(..., description="Birth city")
    birth_country: str = Field(..., description="Birth country code")
    
    class Config:
        json_schema_extra = {
            "example": {
                "birth_date": "1990-05-15",
                "birth_time": "14:30",
                "birth_city": "Moscow",
                "birth_country": "RU"
            }
        }


class KarmicLesson(BaseModel):
    """Schema for individual karmic lesson"""
    area: str
    lesson: str
    challenge: str
    growth_path: str


class KarmicAnalysisResponse(BaseModel):
    """Response schema for karmic analysis"""
    birth_date: str
    north_node: dict
    south_node: dict
    life_purpose: str
    karmic_lessons: List[KarmicLesson]
    soul_mission: str
    recommendations: List[str]
    interpretation: str
    timestamp: str
