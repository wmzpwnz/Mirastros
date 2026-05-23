"""Horoscope schemas for request/response validation"""
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date
from enum import Enum


class ZodiacSign(str, Enum):
    """Zodiac sign enum"""
    ARIES = "aries"
    TAURUS = "taurus"
    GEMINI = "gemini"
    CANCER = "cancer"
    LEO = "leo"
    VIRGO = "virgo"
    LIBRA = "libra"
    SCORPIO = "scorpio"
    SAGITTARIUS = "sagittarius"
    CAPRICORN = "capricorn"
    AQUARIUS = "aquarius"
    PISCES = "pisces"


class HoroscopePeriod(str, Enum):
    """Horoscope period enum"""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class HoroscopeRequest(BaseModel):
    """Request for horoscope"""
    sign: ZodiacSign = Field(..., description="Zodiac sign")
    period: str = Field(default="daily", description="Horoscope period (daily, weekly, monthly)")
    target_date: Optional[date] = Field(default=None, alias="date", description="Date for horoscope (defaults to today)")
    personalized: bool = Field(default=False, description="Generate personalized horoscope based on natal chart")


class HoroscopeResponse(BaseModel):
    """Response with horoscope data"""
    sign: str = Field(..., description="Zodiac sign")
    period: str = Field(..., description="Horoscope period")
    target_date: date = Field(..., alias="date", description="Date for horoscope")
    prediction: str = Field(..., description="Horoscope prediction text")
    lucky_numbers: Optional[List[int]] = Field(default=None, description="Lucky numbers")
    lucky_colors: Optional[List[str]] = Field(default=None, description="Lucky colors")
    compatibility_signs: Optional[List[str]] = Field(default=None, description="Compatible zodiac signs")
    advice: Optional[str] = Field(default=None, description="Advice for the period")
    is_personalized: bool = Field(default=False, description="Whether horoscope is personalized")
    transit_data: Optional[dict] = Field(default=None, description="Current transit data (if personalized)")
    ratings: Optional[dict] = Field(
        default=None,
        description="Life area ratings (finance, love, career, health) from 1-5. Available for Premium/Platinum users."
    )
    explanations: Optional[dict] = Field(
        default=None,
        description="Short reasons for each life area rating"
    )
    best_time_windows: Optional[List[str]] = Field(
        default=None,
        description="Best time windows for important actions"
    )
    period_range_label: Optional[str] = Field(
        default=None,
        description="Human-readable period range label in Russian"
    )
    language: str = Field(
        default="ru",
        description="Language of horoscope content"
    )
    plain_text: Optional[str] = Field(
        default=None,
        description="Prediction normalized to plain text without markdown"
    )
    rich_text: Optional[str] = Field(
        default=None,
        description="Optional rich version of prediction text"
    )
    clarify_available: bool = Field(
        default=False,
        description="Whether 'Clarify with Mirastros' feature is available (Premium/Platinum only)"
    )
    horoscope_id: Optional[str] = Field(
        None,
        description="ID of the horoscope for chat context"
    )
    
    class Config:
        from_attributes = True


class CompatibilityRequest(BaseModel):
    """Request for zodiac compatibility"""
    sign1: ZodiacSign = Field(..., description="First zodiac sign")
    sign2: ZodiacSign = Field(..., description="Second zodiac sign")


class CompatibilityResponse(BaseModel):
    """Response with compatibility analysis"""
    sign1: str = Field(..., description="First zodiac sign")
    sign2: str = Field(..., description="Second zodiac sign")
    compatibility_score: int = Field(..., description="Compatibility score (0-100)")
    analysis: str = Field(..., description="Compatibility analysis text")
    strengths: List[str] = Field(..., description="Relationship strengths")
    challenges: List[str] = Field(..., description="Relationship challenges")
    advice: str = Field(..., description="Relationship advice")
    clarify_available: bool = Field(
        default=False,
        description="Whether 'Clarify with Mirastros' feature is available (Premium/Platinum only)"
    )
