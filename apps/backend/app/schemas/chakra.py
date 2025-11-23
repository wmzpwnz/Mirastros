"""Chakra Analysis Schemas"""

from typing import List
from pydantic import BaseModel, Field
from datetime import date


class ChakraAnalysisRequest(BaseModel):
    """Request schema for chakra analysis"""
    birth_date: date = Field(..., description="User's birth date for chakra analysis")
    
    class Config:
        json_schema_extra = {
            "example": {
                "birth_date": "1990-05-15"
            }
        }


class ChakraInfo(BaseModel):
    """Schema for individual chakra information"""
    name: str
    sanskrit_name: str
    color: str
    location: str
    status: str  # "balanced", "blocked", "overactive"
    percentage: int  # 0-100
    description: str
    balancing_practices: List[str]


class ChakraAnalysisResponse(BaseModel):
    """Response schema for chakra analysis"""
    birth_date: str
    chakras: List[ChakraInfo]
    overall_balance: int  # 0-100
    interpretation: str
    recommendations: List[str]
    timestamp: str
