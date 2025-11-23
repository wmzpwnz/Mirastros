"""Pydantic schemas for social authentication"""
from pydantic import BaseModel, EmailStr
from typing import Optional


class GoogleAuthData(BaseModel):
    """Google OAuth2 authentication data"""
    google_id: str
    email: EmailStr
    full_name: str
    picture: Optional[str] = None


class AppleAuthData(BaseModel):
    """Apple Sign In authentication data"""
    apple_id: str
    email: Optional[EmailStr] = None  # Apple allows hiding email
    full_name: Optional[str] = None


class TelegramAuthData(BaseModel):
    """Telegram Mini App authentication data"""
    telegram_id: str
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    photo_url: Optional[str] = None


class VKAuthData(BaseModel):
    """VK ID authentication data"""
    vk_id: str
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    photo_url: Optional[str] = None


class SocialLoginRequest(BaseModel):
    """Generic social login request"""
    provider: str  # google, apple, telegram, vk
    auth_data: dict  # Provider-specific data


class AccountLinkRequest(BaseModel):
    """Request to link social account to existing user"""
    provider: str  # google, apple, telegram, vk
    provider_id: str
