"""Password reset API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.password_reset import (
    PasswordResetRequest,
    PasswordResetConfirm,
    PasswordResetResponse
)
from app.services.email import EmailService

router = APIRouter(prefix="/auth/password", tags=["Password Reset"])


@router.post("/reset-request", response_model=PasswordResetResponse)
async def request_password_reset(
    request_data: PasswordResetRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Request password reset email
    
    This endpoint always returns success to prevent email enumeration attacks.
    If the email exists, a reset link will be sent.
    """
    # Find user by email
    result = await db.execute(select(User).where(User.email == request_data.email))
    user = result.scalar_one_or_none()
    
    # Always return success message (security best practice)
    if user:
        # Only send email if user has a password (not social-only account)
        if user.password_hash:
            await EmailService.send_password_reset_email(db, user)
    
    return PasswordResetResponse(
        message="If an account exists with this email, a password reset link has been sent."
    )


@router.post("/reset-confirm", response_model=PasswordResetResponse)
async def confirm_password_reset(
    confirm_data: PasswordResetConfirm,
    db: AsyncSession = Depends(get_db)
):
    """
    Confirm password reset with token and set new password
    """
    # Verify token
    user = await EmailService.verify_password_reset_token(db, confirm_data.token)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Hash new password
    new_password_hash = get_password_hash(confirm_data.new_password)
    
    # Reset password
    await EmailService.reset_password(db, user, new_password_hash)
    
    return PasswordResetResponse(
        message="Password has been reset successfully. You can now log in with your new password."
    )


@router.get("/verify-token/{token}")
async def verify_reset_token(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify if a password reset token is valid
    
    This endpoint is useful for frontend to check token validity before showing the reset form
    """
    user = await EmailService.verify_password_reset_token(db, token)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    return {"valid": True, "email": user.email}
