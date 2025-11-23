"""Pydantic schemas for synastry endpoints"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.schemas.natal_chart import BirthData


class SynastryCalculateRequest(BaseModel):
    """Request to calculate synastry between two people"""
    person1_birth_data: BirthData = Field(..., description="Birth data for person 1 (usually the user)")
    person2_birth_data: BirthData = Field(..., description="Birth data for person 2 (partner)")
    relationship_type: str = Field("romantic", description="Type of relationship (romantic, friendship, business)")
    generate_interpretation: bool = Field(True, description="Whether to generate AI interpretation")
    
    @field_validator('relationship_type')
    @classmethod
    def validate_relationship_type(cls, v):
        valid_types = ["romantic", "friendship", "business"]
        if v.lower() not in valid_types:
            raise ValueError(f"Relationship type must be one of: {', '.join(valid_types)}")
        return v.lower()


class SynastryAspect(BaseModel):
    """Inter-chart aspect between two planets"""
    person1_planet: str
    person2_planet: str
    aspect_type: str
    orb: float
    description: str


class SynastryCompatibility(BaseModel):
    """Compatibility analysis"""
    overall_score: float = Field(..., ge=0, le=100, description="Overall compatibility score (0-100)")
    emotional_compatibility: float = Field(..., ge=0, le=100)
    intellectual_compatibility: float = Field(..., ge=0, le=100)
    physical_compatibility: float = Field(..., ge=0, le=100)
    spiritual_compatibility: float = Field(..., ge=0, le=100)


class SynastryResponse(BaseModel):
    """Response for synastry calculation"""
    person1_name: str
    person2_name: str
    relationship_type: str
    aspects: List[SynastryAspect]
    compatibility: SynastryCompatibility
    strengths: List[str]
    challenges: List[str]
    interpretation: Optional[str] = None
    advice: Optional[str] = None
    calculated_at: datetime
    
    class Config:
        from_attributes = True


class SynastryHistoryItem(BaseModel):
    """Synastry history item"""
    id: str
    person1_name: str
    person2_name: str
    relationship_type: str
    compatibility_score: float
    calculated_at: datetime
    
    class Config:
        from_attributes = True


class SynastryHistoryResponse(BaseModel):
    """Response for synastry history"""
    synastries: List[SynastryHistoryItem]
    total: int
