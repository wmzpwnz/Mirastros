"""Horoscope schemas for request/response validation"""
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
    period: HoroscopePeriod = Field(default=HoroscopePeriod.DAILY, description="Horoscope period")
    date: Optional[date] = Field(default=None, description="Date for horoscope (defaults to today)")
    personalized: bool = Field(default=False, description="Generate personalized horoscope based on natal chart")


class HoroscopeResponse(BaseModel):
    """Response with horoscope data"""
    sign: str = Field(..., description="Zodiac sign")
    period: str = Field(..., description="Horoscope period")
    date: date = Field(..., description="Date for horoscope")
    prediction: str = Field(..., description="Horoscope prediction text")
    lucky_numbers: Optional[List[int]] = Field(default=None, description="Lucky numbers")
    lucky_colors: Optional[List[str]] = Field(default=None, description="Lucky colors")
    compatibility_signs: Optional[List[str]] = Field(default=None, description="Compatible zodiac signs")
    advice: Optional[str] = Field(default=None, description="Advice for the period")
    is_personalized: bool = Field(default=False, description="Whether horoscope is personalized")
    transit_data: Optional[dict] = Field(default=None, description="Current transit data (if personalized)")
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
