"""Social authentication API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token
from app.core.deps import get_current_active_user
from app.models.user import User
from app.schemas.auth import AuthResponse, UserResponse
from app.schemas.social_auth import (
    GoogleAuthData,
    AppleAuthData,
    TelegramAuthData,
    VKAuthData,
    AccountLinkRequest
)
from app.services.social_auth import social_auth_service

router = APIRouter(prefix="/auth/social", tags=["Social Authentication"])


@router.post("/google", response_model=AuthResponse)
async def google_login(
    google_data: GoogleAuthData,
    db: AsyncSession = Depends(get_db)
):
    """
    Login or register with Google OAuth2
    
    This endpoint handles:
    1. Existing user with Google ID -> Login
    2. Existing user with same email -> Link Google account and login
    3. New user -> Create account and login
    """
    # Try to merge or link account
    user, is_new = await social_auth_service.merge_or_link_account(
        db, "google", google_data.google_id, google_data.email
    )
    
    # If no user found, create new one
    if user is None:
        user = await social_auth_service.create_user_from_google(db, google_data)
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return AuthResponse(
        user=UserResponse.model_validate(user),
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/apple", response_model=AuthResponse)
async def apple_login(
    apple_data: AppleAuthData,
    db: AsyncSession = Depends(get_db)
):
    """
    Login or register with Apple Sign In
    
    This endpoint handles:
    1. Existing user with Apple ID -> Login
    2. Existing user with same email (if provided) -> Link Apple account and login
    3. New user -> Create account and login
    """
    # Try to merge or link account
    user, is_new = await social_auth_service.merge_or_link_account(
        db, "apple", apple_data.apple_id, apple_data.email
    )
    
    # If no user found, create new one
    if user is None:
        user = await social_auth_service.create_user_from_apple(db, apple_data)
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return AuthResponse(
        user=UserResponse.model_validate(user),
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/telegram", response_model=AuthResponse)
async def telegram_login(
    telegram_data: TelegramAuthData,
    db: AsyncSession = Depends(get_db)
):
    """
    Login or register with Telegram Mini App
    
    This endpoint handles:
    1. Existing user with Telegram ID -> Login
    2. New user -> Create account and login
    
    Note: Telegram doesn't provide email, so account merging is not possible
    """
    # Try to find existing user
    user = await social_auth_service.find_user_by_social_id(
        db, "telegram", telegram_data.telegram_id
    )
    
    # If no user found, create new one
    if user is None:
        user = await social_auth_service.create_user_from_telegram(db, telegram_data)
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return AuthResponse(
        user=UserResponse.model_validate(user),
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/vk", response_model=AuthResponse)
async def vk_login(
    vk_data: VKAuthData,
    db: AsyncSession = Depends(get_db)
):
    """
    Login or register with VK ID
    
    This endpoint handles:
    1. Existing user with VK ID -> Login
    2. Existing user with same email (if provided) -> Link VK account and login
    3. New user -> Create account and login
    """
    # Try to merge or link account
    user, is_new = await social_auth_service.merge_or_link_account(
        db, "vk", vk_data.vk_id, vk_data.email
    )
    
    # If no user found, create new one
    if user is None:
        user = await social_auth_service.create_user_from_vk(db, vk_data)
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return AuthResponse(
        user=UserResponse.model_validate(user),
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/link", response_model=UserResponse)
async def link_social_account(
    link_request: AccountLinkRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Link a social account to the current authenticated user
    
    This allows users to add multiple login methods to their account
    """
    try:
        updated_user = await social_auth_service.link_social_account(
            db,
            current_user,
            link_request.provider,
            link_request.provider_id
        )
        return UserResponse.model_validate(updated_user)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/unlink/{provider}", response_model=UserResponse)
async def unlink_social_account(
    provider: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Unlink a social account from the current authenticated user
    
    Requires that the user has at least one other authentication method
    (password or another social account)
    """
    if provider not in ["google", "apple", "telegram", "vk"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid provider: {provider}"
        )
    
    try:
        updated_user = await social_auth_service.unlink_social_account(
            db,
            current_user,
            provider
        )
        return UserResponse.model_validate(updated_user)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
