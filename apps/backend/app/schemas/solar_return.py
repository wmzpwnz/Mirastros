"""Solar Return Schemas"""

from typing import List, Dict
from pydantic import BaseModel, Field
from datetime import date


class SolarReturnRequest(BaseModel):
    """Request schema for solar return chart"""
    birth_date: date = Field(..., description="User's birth date")
    birth_time: str = Field(..., description="Birth time in HH:MM format")
    birth_city: str = Field(..., description="Birth city")
    birth_country: str = Field(..., description="Birth country code (e.g., RU, US)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "birth_date": "1990-05-15",
                "birth_time": "14:30",
                "birth_city": "Moscow",
                "birth_country": "RU"
            }
        }


class MonthForecast(BaseModel):
    """Schema for monthly forecast"""
    month: str
    themes: List[str]
    advice: str


class SolarReturnResponse(BaseModel):
    """Response schema for solar return chart"""
    birth_date: str
    return_year: int
    chart_data: Dict
    yearly_themes: List[str]
    monthly_forecasts: List[MonthForecast]
    interpretation: str
    key_dates: List[str]
    timestamp: str
