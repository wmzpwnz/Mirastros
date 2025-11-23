"""Pydantic schemas for password reset"""
from pydantic import BaseModel, EmailStr, Field


class PasswordResetRequest(BaseModel):
    """Request password reset email"""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Confirm password reset with token"""
    token: str
    new_password: str = Field(..., min_length=8, max_length=100)


class PasswordResetResponse(BaseModel):
    """Password reset response"""
    message: str
