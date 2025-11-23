"""Pydantic schemas for email verification"""
from pydantic import BaseModel, EmailStr


class EmailVerificationRequest(BaseModel):
    """Request email verification"""
    email: EmailStr


class EmailVerificationConfirm(BaseModel):
    """Confirm email verification with token"""
    token: str


class EmailVerificationResponse(BaseModel):
    """Email verification response"""
    message: str
    verified: bool = False
