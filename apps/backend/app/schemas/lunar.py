"""Lunar calendar schemas for request/response validation"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import date, datetime
from enum import Enum


class LunarPhase(str, Enum):
    """Lunar phase enum"""
    NEW_MOON = "new_moon"
    WAXING_CRESCENT = "waxing_crescent"
    FIRST_QUARTER = "first_quarter"
    WAXING_GIBBOUS = "waxing_gibbous"
    FULL_MOON = "full_moon"
    WANING_GIBBOUS = "waning_gibbous"
    LAST_QUARTER = "last_quarter"
    WANING_CRESCENT = "waning_crescent"


class ActivityType(str, Enum):
    """Activity type enum"""
    HAIRCUT = "haircut"
    WEDDING = "wedding"
    BUSINESS = "business"
    SURGERY = "surgery"
    PLANTING = "planting"
    TRAVEL = "travel"
    MOVING = "moving"
    FINANCIAL = "financial"
    SPIRITUAL = "spiritual"
    CREATIVE = "creative"


class LunarPhaseResponse(BaseModel):
    """Response with current lunar phase"""
    phase: str = Field(..., description="Current lunar phase")
    phase_name: str = Field(..., description="Human-readable phase name")
    illumination: float = Field(..., description="Moon illumination percentage (0-100)")
    date: date = Field(..., description="Date of calculation")
    zodiac_sign: str = Field(..., description="Zodiac sign the Moon is in")
    moon_degree: float = Field(..., description="Moon's degree in current sign")
    next_full_moon: date = Field(..., description="Date of next full moon")
    next_new_moon: date = Field(..., description="Date of next new moon")
    description: str = Field(..., description="Description of current phase energy")


class ActivityRecommendation(BaseModel):
    """Recommendation for a specific activity"""
    activity: str = Field(..., description="Activity type")
    favorability: str = Field(..., description="Favorability: favorable, neutral, unfavorable")
    score: int = Field(..., description="Favorability score (0-100)")
    recommendation: str = Field(..., description="Detailed recommendation")
    best_days: Optional[List[date]] = Field(default=None, description="Best days for this activity")


class LunarRecommendationsResponse(BaseModel):
    """Response with lunar-based activity recommendations"""
    date: date = Field(..., description="Date of recommendations")
    lunar_phase: str = Field(..., description="Current lunar phase")
    moon_sign: str = Field(..., description="Zodiac sign the Moon is in")
    recommendations: List[ActivityRecommendation] = Field(..., description="Activity recommendations")
    general_advice: str = Field(..., description="General advice for the day")
    is_personalized: bool = Field(default=False, description="Whether recommendations are personalized")


class LunarCalendarDay(BaseModel):
    """Single day in lunar calendar"""
    date: date = Field(..., description="Date")
    lunar_phase: str = Field(..., description="Lunar phase")
    moon_sign: str = Field(..., description="Moon's zodiac sign")
    illumination: float = Field(..., description="Moon illumination percentage")
    favorable_activities: List[str] = Field(..., description="Favorable activities")
    unfavorable_activities: List[str] = Field(..., description="Unfavorable activities")
    energy_level: str = Field(..., description="Energy level: high, medium, low")


class LunarCalendarResponse(BaseModel):
    """Response with lunar calendar for a period"""
    start_date: date = Field(..., description="Start date of calendar")
    end_date: date = Field(..., description="End date of calendar")
    days: List[LunarCalendarDay] = Field(..., description="Calendar days")
    special_events: List[Dict] = Field(..., description="Special lunar events (eclipses, etc.)")


class LunarEventNotification(BaseModel):
    """Notification for important lunar event"""
    event_type: str = Field(..., description="Event type: full_moon, new_moon, eclipse")
    date: datetime = Field(..., description="Date and time of event")
    zodiac_sign: str = Field(..., description="Zodiac sign of the event")
    description: str = Field(..., description="Event description")
    recommendations: str = Field(..., description="Recommendations for the event")
