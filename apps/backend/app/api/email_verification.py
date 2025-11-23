"""Email verification API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.schemas.email_verification import (
    EmailVerificationRequest,
    EmailVerificationConfirm,
    EmailVerificationResponse
)
from app.schemas.auth import UserResponse
from app.services.email import EmailService

router = APIRouter(prefix="/auth/email", tags=["Email Verification"])


@router.post("/send-verification", response_model=EmailVerificationResponse)
async def send_verification_email(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Send email verification link to current user
    
    Requires authentication. User must be logged in to request verification.
    """
    # Check if already verified
    if current_user.email_verified:
        return EmailVerificationResponse(
            message="Email is already verified",
            verified=True
        )
    
    # Send verification email
    await EmailService.send_verification_email(db, current_user)
    
    return EmailVerificationResponse(
        message="Verification email has been sent. Please check your inbox."
    )


@router.post("/verify", response_model=EmailVerificationResponse)
async def verify_email(
    verify_data: EmailVerificationConfirm,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify email with token
    
    This endpoint can be called without authentication (public endpoint)
    """
    # Verify token
    user = await EmailService.verify_email_token(db, verify_data.token)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    return EmailVerificationResponse(
        message="Email has been verified successfully!",
        verified=True
    )


@router.get("/status", response_model=EmailVerificationResponse)
async def get_verification_status(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get email verification status for current user
    """
    return EmailVerificationResponse(
        message="Email verified" if current_user.email_verified else "Email not verified",
        verified=current_user.email_verified
    )


@router.get("/verify-token/{token}")
async def verify_token_validity(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Check if verification token is valid
    
    This endpoint is useful for frontend to check token validity before showing success message
    """
    from sqlalchemy import select
    from datetime import datetime
    
    result = await db.execute(
        select(User).where(User.email_verification_token == token)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )
    
    if user.email_verification_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token has expired"
        )
    
    return {"valid": True, "email": user.email}
