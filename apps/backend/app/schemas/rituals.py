"""Rituals and meditation schemas for request/response validation"""
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import date
from enum import Enum


class MeditationGoal(str, Enum):
    """Meditation goal enum"""
    MONEY = "money"
    LOVE = "love"
    HEALTH = "health"
    PEACE = "peace"
    SUCCESS = "success"
    PROTECTION = "protection"
    CREATIVITY = "creativity"
    WISDOM = "wisdom"


class LunarPhaseType(str, Enum):
    """Lunar phase type for rituals"""
    NEW_MOON = "new_moon"
    FULL_MOON = "full_moon"
    WAXING_MOON = "waxing_moon"
    WANING_MOON = "waning_moon"


class MeditationDuration(str, Enum):
    """Meditation duration options"""
    SHORT = "5"
    MEDIUM = "10"
    LONG = "20"


class MeditationRequest(BaseModel):
    """Request for personalized meditation script"""
    goal: MeditationGoal = Field(..., description="Meditation goal")
    duration: MeditationDuration = Field(default=MeditationDuration.MEDIUM, description="Duration in minutes")
    include_affirmations: bool = Field(default=True, description="Include affirmations")
    personalize: bool = Field(default=False, description="Personalize based on natal chart")


class MeditationResponse(BaseModel):
    """Response with meditation script"""
    goal: str = Field(..., description="Meditation goal")
    duration: int = Field(..., description="Duration in minutes")
    script: str = Field(..., description="Full meditation script")
    affirmations: List[str] = Field(..., description="Affirmations for this meditation")
    chakra: str = Field(..., description="Associated chakra")
    element: str = Field(..., description="Associated element")
    best_time: str = Field(..., description="Best time to practice")
    is_personalized: bool = Field(default=False, description="Whether script is personalized")


class RitualStep(BaseModel):
    """Single step in a ritual"""
    step: int = Field(..., description="Step number")
    title: str = Field(..., description="Step title")
    description: str = Field(..., description="Step description")
    duration: str = Field(..., description="Estimated duration")


class LunarRitualRequest(BaseModel):
    """Request for lunar phase ritual"""
    phase: LunarPhaseType = Field(..., description="Lunar phase")
    personalize: bool = Field(default=False, description="Personalize based on natal chart")


class LunarRitualResponse(BaseModel):
    """Response with lunar ritual"""
    name: str = Field(..., description="Ritual name")
    phase: str = Field(..., description="Lunar phase")
    purpose: str = Field(..., description="Ritual purpose")
    duration: str = Field(..., description="Total duration")
    best_time: str = Field(..., description="Best time to perform")
    items_needed: List[str] = Field(..., description="Items needed for ritual")
    steps: List[RitualStep] = Field(..., description="Ritual steps")
    affirmations: List[str] = Field(..., description="Affirmations for this ritual")
    is_personalized: bool = Field(default=False, description="Whether ritual is personalized")
    personalization_notes: Optional[str] = Field(default=None, description="Personalization notes")


class DailyAffirmationsRequest(BaseModel):
    """Request for daily affirmations"""
    count: int = Field(default=3, ge=1, le=10, description="Number of affirmations")
    personalize: bool = Field(default=False, description="Personalize based on natal chart")


class DailyAffirmationsResponse(BaseModel):
    """Response with daily affirmations"""
    target_date: date = Field(..., alias="date", description="Date")
    affirmations: List[str] = Field(..., description="Daily affirmations")
    zodiac_sign: Optional[str] = Field(default=None, description="User's zodiac sign")
    moon_sign: Optional[str] = Field(default=None, description="Current moon sign")
    is_personalized: bool = Field(default=False, description="Whether affirmations are personalized")
    theme: str = Field(..., description="Theme of the day")


class RitualLibraryItem(BaseModel):
    """Item in ritual library"""
    id: str = Field(..., description="Ritual ID")
    name: str = Field(..., description="Ritual name")
    category: str = Field(..., description="Category: lunar, meditation, seasonal")
    purpose: str = Field(..., description="Ritual purpose")
    duration: str = Field(..., description="Duration")
    difficulty: str = Field(..., description="Difficulty: beginner, intermediate, advanced")
    requires_items: bool = Field(..., description="Whether items are needed")


class RitualLibraryResponse(BaseModel):
    """Response with ritual library"""
    rituals: List[RitualLibraryItem] = Field(..., description="Available rituals")
    total: int = Field(..., description="Total number of rituals")
    categories: List[str] = Field(..., description="Available categories")


class PersonalizedRitualRecommendation(BaseModel):
    """Personalized ritual recommendation"""
    ritual_id: str = Field(..., description="Recommended ritual ID")
    ritual_name: str = Field(..., description="Ritual name")
    reason: str = Field(..., description="Why this ritual is recommended")
    best_date: Optional[date] = Field(default=None, description="Best date to perform")
    priority: str = Field(..., description="Priority: high, medium, low")
