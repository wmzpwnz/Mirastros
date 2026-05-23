"""Pydantic schemas for social authentication"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class GoogleAuthData(BaseModel):
    """Google OAuth2 authentication data"""
    id_token: Optional[str] = Field(None, min_length=1)
    google_id: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    picture: Optional[str] = None
    preferred_language: Optional[str] = None
    timezone: Optional[str] = None


class AppleAuthData(BaseModel):
    """Apple Sign In authentication data"""
    id_token: Optional[str] = Field(None, min_length=1)
    apple_id: Optional[str] = None
    email: Optional[EmailStr] = None  # Apple allows hiding email
    full_name: Optional[str] = None
    preferred_language: Optional[str] = None
    timezone: Optional[str] = None


class TelegramAuthData(BaseModel):
    """Telegram Mini App authentication data"""
    init_data: Optional[str] = Field(None, min_length=1)
    telegram_id: Optional[str] = None
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    photo_url: Optional[str] = None
    preferred_language: Optional[str] = None
    timezone: Optional[str] = None


class VKAuthData(BaseModel):
    """VK ID authentication data"""
    access_token: Optional[str] = Field(None, min_length=1)
    vk_id: Optional[str] = None
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    photo_url: Optional[str] = None
    preferred_language: Optional[str] = None
    timezone: Optional[str] = None


class SocialLoginRequest(BaseModel):
    """Generic social login request"""
    provider: str  # google, apple, telegram, vk
    auth_data: dict  # Provider-specific data


class AccountLinkRequest(BaseModel):
    """Request to link social account to existing user"""
    provider: str  # google, apple, telegram, vk
    id_token: Optional[str] = None  # Google or Apple
    init_data: Optional[str] = None  # Telegram Mini App initData
    access_token: Optional[str] = None  # VK user access token
    provider_id: Optional[str] = None  # Legacy field; ignored for security
