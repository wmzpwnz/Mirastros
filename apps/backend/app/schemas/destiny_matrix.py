"""Destiny Matrix API Schemas"""

from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


class DestinyMatrixBasicLines(BaseModel):
    """Core lines of destiny matrix (legacy + v2 compatible)."""
    destiny: int = Field(..., description="Destiny line (day + month reduced to 1-22)", ge=1, le=22)
    character: int = Field(..., description="Character line (day + year reduced to 1-22)", ge=1, le=22)
    purpose: int = Field(..., description="Purpose line (month + year reduced to 1-22)", ge=1, le=22)
    health: int = Field(..., description="Health line (sum of all lines reduced to 1-22)", ge=1, le=22)


class DestinyMatrixExtendedLines(BaseModel):
    """Expanded deterministic axes for v2."""
    line_of_heaven: List[int] = Field(..., min_length=3, max_length=3)
    line_of_earth: List[int] = Field(..., min_length=3, max_length=3)
    line_of_man: List[int] = Field(..., min_length=3, max_length=3)
    line_of_woman: List[int] = Field(..., min_length=3, max_length=3)


class DestinyMatrixCalculateRequest(BaseModel):
    """Request for destiny matrix calculation"""
    birth_date: str = Field(
        ...,
        description="Birth date in YYYY-MM-DD format",
        pattern=r"^\d{4}-\d{2}-\d{2}$"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "birth_date": "1990-05-15"
            }
        }


class DestinyMatrixResponse(BaseModel):
    """Response from destiny matrix calculation"""
    birth_date: str
    calculation_version: Literal["v1", "v2"] = Field(
        default="v2",
        description="Calculation version of the matrix payload",
    )
    matrix_data: List[List[int]] = Field(
        ...,
        description="4x4 matrix grid with numbers 1-22",
        min_length=4,
        max_length=4
    )
    lines: DestinyMatrixBasicLines = Field(
        ...,
        description="Legacy-compatible alias for lines_basic",
    )
    lines_basic: DestinyMatrixBasicLines
    lines_extended: DestinyMatrixExtendedLines
    positions: Dict[str, int] = Field(
        ...,
        description="Key deterministic positions derived from lines in range 1-22",
    )
    layout_meta: Dict[str, Any] = Field(
        default_factory=dict,
        description="Rendering metadata for frontend layout",
    )
    active_arcana: List[int] = Field(
        ...,
        description="List of active arcana numbers (appearing in lines)",
        min_length=1,
        max_length=22
    )
    interpretation: str
    matrix_id: Optional[str] = Field(
        None,
        description="ID of the matrix for chat context"
    )
    clarify_available: bool = Field(
        default=False,
        description="Whether 'Clarify with Mirastros' feature is available (Premium/Platinum only)"
    )
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "birth_date": "1990-05-15",
                "calculation_version": "v2",
                "matrix_data": [
                    [1, 2, 3, 4],
                    [5, 6, 7, 8],
                    [9, 10, 11, 12],
                    [13, 14, 15, 16]
                ],
                "lines": {
                    "destiny": 5,
                    "character": 12,
                    "purpose": 8,
                    "health": 3
                },
                "lines_basic": {
                    "destiny": 5,
                    "character": 12,
                    "purpose": 8,
                    "health": 3
                },
                "lines_extended": {
                    "line_of_heaven": [5, 13, 8],
                    "line_of_earth": [12, 15, 3],
                    "line_of_man": [5, 17, 12],
                    "line_of_woman": [8, 11, 3]
                },
                "positions": {
                    "core": 6,
                    "soul": 17,
                    "realization": 11,
                    "talent": 20,
                    "karmic": 8,
                    "shadow": 8
                },
                "layout_meta": {
                    "shape": "4x4",
                    "palette": "gold",
                    "mode": "deterministic-v2"
                },
                "active_arcana": [5, 12, 8, 3],
                "interpretation": "Your destiny matrix reveals a path of transformation...",
                "matrix_id": "550e8400-e29b-41d4-a716-446655440000",
                "clarify_available": True
            }
        }






