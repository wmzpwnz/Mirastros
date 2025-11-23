"""Pydantic schemas for natal chart endpoints"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any, List
from datetime import date, time, datetime


class BirthData(BaseModel):
    """Birth data for natal chart calculation"""
    name: str = Field(..., min_length=1, max_length=100, description="Person's name")
    birth_date: date = Field(..., description="Birth date (YYYY-MM-DD)")
    birth_time: time = Field(..., description="Birth time (HH:MM:SS)")
    latitude: float = Field(..., ge=-90, le=90, description="Birth location latitude")
    longitude: float = Field(..., ge=-180, le=180, description="Birth location longitude")
    city: Optional[str] = Field(None, max_length=100, description="City name")
    country: Optional[str] = Field(None, max_length=100, description="Country name")
    house_system: Optional[str] = Field("placidus", description="House system (placidus, koch, equal, whole_sign, campanus, regiomontanus)")
    
    @field_validator('house_system')
    @classmethod
    def validate_house_system(cls, v):
        valid_systems = ["placidus", "koch", "equal", "whole_sign", "campanus", "regiomontanus"]
        if v and v.lower() not in valid_systems:
            raise ValueError(f"House system must be one of: {', '.join(valid_systems)}")
        return v.lower() if v else "placidus"


class PlanetPosition(BaseModel):
    """Planet position in natal chart"""
    sign: str
    degree: float
    house: int
    retrograde: bool
    sign_num: int


class HouseCusp(BaseModel):
    """House cusp information"""
    cusp: int
    sign: str
    degree: float
    sign_num: int


class Aspect(BaseModel):
    """Planetary aspect"""
    planet1: str
    planet2: str
    type: str
    orb: float
    applying: Optional[bool] = None


class SpecialPoint(BaseModel):
    """Special point (Ascendant, Midheaven, Node)"""
    sign: str
    degree: float


class LunarNodes(BaseModel):
    """Lunar nodes positions"""
    north_node: SpecialPoint
    south_node: SpecialPoint


class NatalChartData(BaseModel):
    """Complete natal chart data"""
    planets: Dict[str, PlanetPosition]
    houses: List[HouseCusp]
    aspects: List[Aspect]
    ascendant: SpecialPoint
    midheaven: SpecialPoint
    lunar_nodes: LunarNodes
    house_system: str


class NatalChartResponse(BaseModel):
    """Response for natal chart calculation"""
    chart_data: NatalChartData
    interpretation: Optional[str] = None
    calculated_at: datetime
    
    class Config:
        from_attributes = True


class NatalChartCalculateRequest(BaseModel):
    """Request to calculate natal chart"""
    birth_data: BirthData
    generate_interpretation: bool = Field(True, description="Whether to generate AI interpretation")


class NatalChartUpdateRequest(BaseModel):
    """Request to update natal chart"""
    birth_data: BirthData
    generate_interpretation: bool = Field(False, description="Whether to generate AI interpretation")
