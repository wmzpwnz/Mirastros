"""
Pydantic schemas for notifications
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class PushTokenRegister(BaseModel):
    """Schema for registering a push token"""
    user_id: str = Field(..., description="User ID")
    push_token: str = Field(..., description="Expo push token")
    platform: str = Field(..., description="Platform (ios or android)")
    device_type: Optional[str] = Field(None, description="Device type/name")


class PushTokenUnregister(BaseModel):
    """Schema for unregistering a push token"""
    user_id: str = Field(..., description="User ID")
    push_token: str = Field(..., description="Expo push token")


class TransitSubscription(BaseModel):
    """Schema for subscribing to transit notifications"""
    user_id: str = Field(..., description="User ID")
    transit_types: List[str] = Field(
        default=["major"],
        description="Types of transits to notify about (major, minor, all)"
    )


class LunarSubscription(BaseModel):
    """Schema for subscribing to lunar notifications"""
    user_id: str = Field(..., description="User ID")


class NotificationPreferences(BaseModel):
    """Schema for notification preferences"""
    daily_horoscope: bool = Field(default=True, description="Enable daily horoscope notifications")
    daily_horoscope_time: str = Field(default="09:00", description="Time for daily horoscope (HH:MM)")
    transits: bool = Field(default=False, description="Enable transit notifications")
    lunar_phases: bool = Field(default=False, description="Enable lunar phase notifications")
    reminders: bool = Field(default=True, description="Enable general reminders")


class PushTokenResponse(BaseModel):
    """Schema for push token response"""
    id: str
    user_id: str
    push_token: str
    platform: str
    device_type: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
