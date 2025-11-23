"""Journal API Schemas"""

from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class JournalEntryCreate(BaseModel):
    """Request to create a journal entry"""
    title: str = Field(
        ...,
        description="Title of the journal entry",
        min_length=1,
        max_length=255
    )
    content: str = Field(
        ...,
        description="Content of the journal entry",
        min_length=1
    )
    entry_type: str = Field(
        ...,
        description="Type of entry: dream, meditation, reading, ritual, reflection, other"
    )
    tags: Optional[List[str]] = Field(
        default=None,
        description="Tags for categorization"
    )
    metadata: Optional[dict] = Field(
        default=None,
        description="Additional metadata (e.g., related reading ID)"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Morning Meditation Insights",
                "content": "Today's meditation brought clarity about my career path. I felt a strong connection to my higher self.",
                "entry_type": "meditation",
                "tags": ["career", "clarity", "morning"],
                "metadata": {"duration_minutes": 20}
            }
        }


class JournalEntryUpdate(BaseModel):
    """Request to update a journal entry"""
    title: Optional[str] = Field(
        None,
        description="Title of the journal entry",
        min_length=1,
        max_length=255
    )
    content: Optional[str] = Field(
        None,
        description="Content of the journal entry",
        min_length=1
    )
    tags: Optional[List[str]] = Field(
        None,
        description="Tags for categorization"
    )
    metadata: Optional[dict] = Field(
        None,
        description="Additional metadata"
    )


class JournalEntryResponse(BaseModel):
    """Response containing a journal entry"""
    id: str
    title: str
    content: str
    entry_type: str
    tags: Optional[List[str]]
    metadata: Optional[dict]
    created_at: str
    updated_at: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "Morning Meditation Insights",
                "content": "Today's meditation brought clarity...",
                "entry_type": "meditation",
                "tags": ["career", "clarity", "morning"],
                "metadata": {"duration_minutes": 20},
                "created_at": "2025-11-21T08:30:00",
                "updated_at": "2025-11-21T08:30:00"
            }
        }


class JournalEntriesResponse(BaseModel):
    """Response containing multiple journal entries"""
    entries: List[JournalEntryResponse]
    total: int
    limit: int
    offset: int


class JournalInsightsResponse(BaseModel):
    """Response containing AI-generated insights from journal"""
    total_entries: int
    entry_types_distribution: dict
    common_tags: List[dict]
    recurring_themes: List[str]
    insights: str
    progress_summary: str
    progress_visualizations: dict = Field(
        description="Data for progress visualizations including entries over time, sentiment trend, theme evolution, activity heatmap, and growth indicators"
    )
    historical_trends: Optional[dict] = Field(
        default=None,
        description="Historical trend analysis including frequency trend, sentiment progression, and consistency score"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_entries": 45,
                "entry_types_distribution": {
                    "meditation": 20,
                    "dream": 15,
                    "reading": 10
                },
                "common_tags": [
                    {"tag": "clarity", "count": 12},
                    {"tag": "career", "count": 8}
                ],
                "recurring_themes": [
                    "spiritual growth",
                    "career transformation",
                    "emotional healing"
                ],
                "insights": "Your journal reveals a consistent pattern of seeking clarity...",
                "progress_summary": "You've maintained a 15-day streak! Your dedication is manifesting results.",
                "progress_visualizations": {
                    "entries_over_time": [
                        {"date": "2025-11-01", "count": 2},
                        {"date": "2025-11-02", "count": 1}
                    ],
                    "sentiment_trend": [
                        {"date": "2025-11-01", "sentiment": 0.75, "title": "Morning meditation", "entry_type": "meditation"}
                    ],
                    "theme_evolution": [
                        {"week": "2025-11-04", "themes": ["spiritual growth"], "entry_count": 5}
                    ],
                    "activity_heatmap": {
                        "by_day_of_week": [
                            {"day": "Monday", "count": 8},
                            {"day": "Tuesday", "count": 5}
                        ],
                        "by_hour_of_day": [
                            {"hour": 8, "count": 12},
                            {"hour": 20, "count": 8}
                        ]
                    },
                    "growth_indicators": {
                        "total_days_active": 90,
                        "average_entry_length": 450,
                        "length_trend": "increasing",
                        "diversity_score": 75,
                        "unique_entry_types": 5,
                        "unique_tags": 15
                    }
                },
                "historical_trends": {
                    "frequency_trend": "increasing",
                    "sentiment_progression": "improving",
                    "most_active_period": "November 2025",
                    "consistency_score": 68,
                    "average_entries_per_week": 3.5
                }
            }
        }


class JournalStatsResponse(BaseModel):
    """Response containing journal statistics"""
    total_entries: int
    entries_by_type: dict
    entries_by_month: dict
    most_used_tags: List[dict]
    streak_days: int
