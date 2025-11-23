"""Pydantic schemas for transits endpoints"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date


class TransitPlanetPosition(BaseModel):
    """Current transit planet position"""
    sign: str
    degree: float
    retrograde: bool
    sign_num: int


class TransitAspect(BaseModel):
    """Transit aspect to natal planet"""
    transit_planet: str
    natal_planet: str
    aspect_type: str  # conjunction, opposition, trine, square, sextile
    orb: float
    exact_date: Optional[str] = None
    influence: str  # positive, challenging, neutral


class SignificantTransit(BaseModel):
    """Significant transit event"""
    planet: str
    event_type: str  # entering_sign, aspect, retrograde, direct
    description: str
    date: str
    importance: str  # high, medium, low


class CurrentTransitsResponse(BaseModel):
    """Response for current transits"""
    date: datetime
    planetary_positions: Dict[str, TransitPlanetPosition]
    lunar_phase: str
    lunar_phase_percentage: float
    
    class Config:
        from_attributes = True


class PersonalTransitsRequest(BaseModel):
    """Request for personal transits analysis"""
    target_date: Optional[date] = Field(None, description="Date for transit analysis (defaults to today)")
    days_ahead: Optional[int] = Field(30, ge=1, le=365, description="Number of days to look ahead for significant transits")


class PersonalTransitsResponse(BaseModel):
    """Response for personal transits analysis"""
    date: datetime
    current_transits: Dict[str, TransitPlanetPosition]
    aspects_to_natal: List[TransitAspect]
    significant_transits: List[SignificantTransit]
    interpretation: Optional[str] = None
    
    class Config:
        from_attributes = True


class TransitInterpretationRequest(BaseModel):
    """Request for transit interpretation"""
    target_date: Optional[date] = Field(None, description="Date for interpretation (defaults to today)")
