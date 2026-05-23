"""Pydantic schemas for authentication"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import SubscriptionTier


class UserRegister(BaseModel):
    """User registration schema"""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    full_name: str = Field(..., min_length=1, max_length=255)
    preferred_language: str = "ru"
    timezone: str = "UTC"


class UserLogin(BaseModel):
    """User login schema"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    """Token refresh request"""
    refresh_token: str


class UserResponse(BaseModel):
    """User response schema"""
    id: str
    email: str
    full_name: str
    email_verified: bool = False
    birth_date: Optional[str] = None
    birth_time: Optional[str] = None
    birth_location: Optional[dict] = None
    zodiac_sign: Optional[str] = None
    subscription_tier: SubscriptionTier
    subscription_expires: Optional[datetime] = None
    preferred_language: str
    timezone: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Authentication response with user and tokens"""
    user: UserResponse
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserUpdate(BaseModel):
    """User profile update schema"""
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    birth_date: Optional[str] = None
    birth_time: Optional[str] = None
    birth_location: Optional[dict] = None
    preferred_language: Optional[str] = None
    timezone: Optional[str] = None
