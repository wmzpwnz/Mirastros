"""Horary Astrology Schemas"""

from typing import Optional
from pydantic import BaseModel, Field


class HoraryQuestionRequest(BaseModel):
    """Request schema for horary astrology question"""
    question: str = Field(
        ...,
        description="Specific question for horary astrology",
        min_length=10,
        max_length=500
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "question": "Will I get the job I interviewed for?"
            }
        }


class HoraryChartResponse(BaseModel):
    """Response schema for horary astrology reading"""
    question: str
    answer: str
    timing: Optional[str]
    chart_data: dict
    interpretation: str
    timestamp: str
