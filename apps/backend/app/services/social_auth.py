"""Social authentication service for OAuth2 providers"""
import hashlib
import hmac
import json
import os
import time
from dataclasses import dataclass
from typing import Optional, Tuple
from urllib.parse import parse_qsl

import httpx
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User, SubscriptionTier
from app.schemas.social_auth import (
    GoogleAuthData,
    AppleAuthData,
    TelegramAuthData,
    VKAuthData,
    AccountLinkRequest,
)

try:
    from google.auth.transport import requests as google_requests
    from google.oauth2 import id_token as google_id_token
except ImportError:  # pragma: no cover - optional provider dependency
    google_requests = None
    google_id_token = None


APPLE_JWKS_URL = "https://appleid.apple.com/auth/keys"
APPLE_ISSUER = "https://appleid.apple.com"
VK_API_VERSION = "5.199"
TELEGRAM_AUTH_MAX_AGE_SECONDS = 86400


class SocialAuthError(ValueError):
    """Raised when provider credentials are invalid or cannot be verified."""


class SocialAuthProviderDisabled(SocialAuthError):
    """Raised when a provider cannot be used without server-side configuration."""


@dataclass(frozen=True)
class VerifiedSocialProfile:
    """Provider identity verified against the provider, not client-submitted data."""

    provider: str
    provider_id: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    photo_url: Optional[str] = None


def _env_list(name: str) -> list[str]:
    value = os.getenv(name, "")
    return [item.strip() for item in value.split(",") if item.strip()]


def _require_env(name: str, provider: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise SocialAuthProviderDisabled(f"{provider} social auth is not configured")
    return value


class SocialAuthService:
    """Service for handling social authentication and account linking"""

    @staticmethod
    async def verify_google(google_data: GoogleAuthData) -> GoogleAuthData:
        """Verify a Google ID token and return trusted profile data."""
        if google_id_token is None or google_requests is None:
            raise SocialAuthProviderDisabled("Google social auth dependency is not installed")
        if not google_data.id_token:
            raise SocialAuthError("Google id_token is required")
        audiences = _env_list("GOOGLE_CLIENT_IDS")
        single_audience = os.getenv("GOOGLE_CLIENT_ID", "").strip()
        if single_audience:
            audiences.append(single_audience)
        if not audiences:
            raise SocialAuthProviderDisabled("Google social auth is not configured")

        last_error: Optional[Exception] = None
        payload = None
        for audience in audiences:
            try:
                payload = google_id_token.verify_oauth2_token(
                    google_data.id_token,
                    google_requests.Request(),
                    audience,
                )
                break
            except Exception as exc:
                last_error = exc

        if payload is None:
            raise SocialAuthError("Invalid Google ID token") from last_error
        if payload.get("iss") not in {"accounts.google.com", "https://accounts.google.com"}:
            raise SocialAuthError("Invalid Google token issuer")
        if not payload.get("email") or not payload.get("email_verified"):
            raise SocialAuthError("Google account email is not verified")

        return GoogleAuthData(
            id_token=google_data.id_token,
            google_id=str(payload["sub"]),
            email=payload["email"],
            full_name=payload.get("name") or payload.get("email"),
            picture=payload.get("picture"),
            preferred_language=google_data.preferred_language,
            timezone=google_data.timezone,
        )

    @staticmethod
    async def verify_apple(apple_data: AppleAuthData) -> AppleAuthData:
        """Verify an Apple identity token through Apple's JWKS."""
        if not apple_data.id_token:
            raise SocialAuthError("Apple id_token is required")
        audience = _require_env("APPLE_CLIENT_ID", "Apple")

        try:
            header = jwt.get_unverified_header(apple_data.id_token)
        except JWTError as exc:
            raise SocialAuthError("Invalid Apple identity token") from exc

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(APPLE_JWKS_URL)
                response.raise_for_status()
                jwks = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise SocialAuthError("Unable to verify Apple identity token") from exc

        key = next((item for item in jwks.get("keys", []) if item.get("kid") == header.get("kid")), None)
        if not key:
            raise SocialAuthError("Apple signing key was not found")

        try:
            payload = jwt.decode(
                apple_data.id_token,
                key,
                algorithms=["RS256"],
                audience=audience,
                issuer=APPLE_ISSUER,
            )
        except JWTError as exc:
            raise SocialAuthError("Invalid Apple identity token") from exc

        email = payload.get("email")
        email_verified = payload.get("email_verified")
        if email and email_verified not in {True, "true", "1", 1}:
            raise SocialAuthError("Apple account email is not verified")

        return AppleAuthData(
            id_token=apple_data.id_token,
            apple_id=str(payload["sub"]),
            email=email,
            full_name=apple_data.full_name,
            preferred_language=apple_data.preferred_language,
            timezone=apple_data.timezone,
        )

    @staticmethod
    async def verify_telegram(telegram_data: TelegramAuthData) -> TelegramAuthData:
        """Verify Telegram Mini App initData hash."""
        if not telegram_data.init_data:
            raise SocialAuthError("Telegram init_data is required")
        bot_token = _require_env("TELEGRAM_BOT_TOKEN", "Telegram")
        params = dict(parse_qsl(telegram_data.init_data, keep_blank_values=True))
        received_hash = params.pop("hash", None)
        if not received_hash:
            raise SocialAuthError("Telegram initData hash is missing")

        data_check_string = "\n".join(f"{key}={params[key]}" for key in sorted(params))
        secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
        expected_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected_hash, received_hash):
            raise SocialAuthError("Invalid Telegram initData hash")

        try:
            auth_date = int(params.get("auth_date", "0"))
        except ValueError as exc:
            raise SocialAuthError("Invalid Telegram auth_date") from exc
        if auth_date <= 0 or time.time() - auth_date > TELEGRAM_AUTH_MAX_AGE_SECONDS:
            raise SocialAuthError("Telegram initData is expired")

        try:
            user_data = json.loads(params.get("user", "{}"))
        except json.JSONDecodeError as exc:
            raise SocialAuthError("Invalid Telegram user payload") from exc
        if not user_data.get("id"):
            raise SocialAuthError("Telegram user id is missing")

        return TelegramAuthData(
            init_data=telegram_data.init_data,
            telegram_id=str(user_data["id"]),
            username=user_data.get("username"),
            first_name=user_data.get("first_name"),
            last_name=user_data.get("last_name"),
            photo_url=user_data.get("photo_url"),
            preferred_language=telegram_data.preferred_language,
            timezone=telegram_data.timezone,
        )

    @staticmethod
    async def verify_vk(vk_data: VKAuthData) -> VKAuthData:
        """Validate a VK user access token by calling VK API."""
        if not vk_data.access_token:
            raise SocialAuthError("VK access_token is required")
        params = {
            "fields": "photo_200",
            "access_token": vk_data.access_token,
            "v": VK_API_VERSION,
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get("https://api.vk.com/method/users.get", params=params)
                response.raise_for_status()
                payload = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise SocialAuthError("Unable to validate VK access token") from exc

        if payload.get("error"):
            raise SocialAuthError("Invalid VK access token")
        users = payload.get("response") or []
        if not users:
            raise SocialAuthError("VK user was not found")
        user_data = users[0]

        return VKAuthData(
            access_token=vk_data.access_token,
            vk_id=str(user_data["id"]),
            email=None,
            first_name=user_data.get("first_name"),
            last_name=user_data.get("last_name"),
            photo_url=user_data.get("photo_200"),
            preferred_language=vk_data.preferred_language,
            timezone=vk_data.timezone,
        )

    @staticmethod
    async def verify_link_request(link_request: AccountLinkRequest) -> VerifiedSocialProfile:
        """Verify provider credentials from an account-link request."""
        provider = link_request.provider.lower()
        if provider == "google":
            if not link_request.id_token:
                raise SocialAuthError("Google id_token is required")
            verified = await SocialAuthService.verify_google(GoogleAuthData(id_token=link_request.id_token))
            return VerifiedSocialProfile("google", verified.google_id, verified.email, verified.full_name)
        if provider == "apple":
            if not link_request.id_token:
                raise SocialAuthError("Apple id_token is required")
            verified = await SocialAuthService.verify_apple(AppleAuthData(id_token=link_request.id_token))
            return VerifiedSocialProfile("apple", verified.apple_id, verified.email, verified.full_name)
        if provider == "telegram":
            if not link_request.init_data:
                raise SocialAuthError("Telegram init_data is required")
            verified = await SocialAuthService.verify_telegram(TelegramAuthData(init_data=link_request.init_data))
            return VerifiedSocialProfile(
                "telegram",
                verified.telegram_id,
                username=verified.username,
                first_name=verified.first_name,
                last_name=verified.last_name,
            )
        if provider == "vk":
            if not link_request.access_token:
                raise SocialAuthError("VK access_token is required")
            verified = await SocialAuthService.verify_vk(VKAuthData(access_token=link_request.access_token))
            return VerifiedSocialProfile(
                "vk",
                verified.vk_id,
                first_name=verified.first_name,
                last_name=verified.last_name,
            )
        raise SocialAuthError(f"Invalid provider: {link_request.provider}")
    
    @staticmethod
    async def find_user_by_social_id(
        db: AsyncSession,
        provider: str,
        provider_id: str
    ) -> Optional[User]:
        """Find user by social provider ID"""
        query_map = {
            "google": User.google_id == provider_id,
            "apple": User.apple_id == provider_id,
            "telegram": User.telegram_id == provider_id,
            "vk": User.vk_id == provider_id
        }
        
        if provider not in query_map:
            return None
        
        result = await db.execute(
            select(User).where(query_map[provider])
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def find_user_by_email(
        db: AsyncSession,
        email: str
    ) -> Optional[User]:
        """Find user by email"""
        result = await db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create_user_from_google(
        db: AsyncSession,
        google_data: GoogleAuthData
    ) -> User:
        """Create new user from Google OAuth data"""
        new_user = User(
            email=google_data.email,
            password_hash=None,  # No password for social login
            full_name=google_data.full_name,
            google_id=google_data.google_id,
            email_verified=True,  # Social logins are pre-verified
            subscription_tier=SubscriptionTier.FREEMIUM,
            preferred_language=google_data.preferred_language or "ru",
            timezone=google_data.timezone or "UTC"
        )
        
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user
    
    @staticmethod
    async def create_user_from_apple(
        db: AsyncSession,
        apple_data: AppleAuthData
    ) -> User:
        """Create new user from Apple Sign In data"""
        # Apple may not provide email, use apple_id as fallback
        email = apple_data.email or f"{apple_data.apple_id}@privaterelay.appleid.com"
        full_name = apple_data.full_name or "Apple User"
        
        new_user = User(
            email=email,
            password_hash=None,  # No password for social login
            full_name=full_name,
            apple_id=apple_data.apple_id,
            email_verified=True,  # Social logins are pre-verified
            subscription_tier=SubscriptionTier.FREEMIUM,
            preferred_language=apple_data.preferred_language or "ru",
            timezone=apple_data.timezone or "UTC"
        )
        
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user
    
    @staticmethod
    async def create_user_from_telegram(
        db: AsyncSession,
        telegram_data: TelegramAuthData
    ) -> User:
        """Create new user from Telegram data"""
        # Telegram doesn't provide email, use telegram_id
        email = f"telegram_{telegram_data.telegram_id}@mirastros.internal"
        
        # Build full name from available data
        name_parts = []
        if telegram_data.first_name:
            name_parts.append(telegram_data.first_name)
        if telegram_data.last_name:
            name_parts.append(telegram_data.last_name)
        full_name = " ".join(name_parts) or telegram_data.username or "Telegram User"
        
        new_user = User(
            email=email,
            password_hash=None,  # No password for social login
            full_name=full_name,
            telegram_id=telegram_data.telegram_id,
            email_verified=True,  # Social logins are pre-verified
            subscription_tier=SubscriptionTier.FREEMIUM,
            preferred_language=telegram_data.preferred_language or "ru",
            timezone=telegram_data.timezone or "UTC"
        )
        
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user
    
    @staticmethod
    async def create_user_from_vk(
        db: AsyncSession,
        vk_data: VKAuthData
    ) -> User:
        """Create new user from VK data"""
        # VK may not provide email
        email = vk_data.email or f"vk_{vk_data.vk_id}@mirastros.internal"
        
        # Build full name from available data
        name_parts = []
        if vk_data.first_name:
            name_parts.append(vk_data.first_name)
        if vk_data.last_name:
            name_parts.append(vk_data.last_name)
        full_name = " ".join(name_parts) or "VK User"
        
        new_user = User(
            email=email,
            password_hash=None,  # No password for social login
            full_name=full_name,
            vk_id=vk_data.vk_id,
            email_verified=True,  # Social logins are pre-verified
            subscription_tier=SubscriptionTier.FREEMIUM,
            preferred_language=vk_data.preferred_language or "ru",
            timezone=vk_data.timezone or "UTC"
        )
        
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user
    
    @staticmethod
    async def link_social_account(
        db: AsyncSession,
        user: User,
        provider: str,
        provider_id: str
    ) -> User:
        """Link social account to existing user"""
        # Check if provider ID is already linked to another user
        existing_user = await SocialAuthService.find_user_by_social_id(
            db, provider, provider_id
        )
        
        if existing_user and existing_user.id != user.id:
            raise ValueError(f"{provider.capitalize()} account already linked to another user")
        
        # Link the account
        if provider == "google":
            user.google_id = provider_id
        elif provider == "apple":
            user.apple_id = provider_id
        elif provider == "telegram":
            user.telegram_id = provider_id
        elif provider == "vk":
            user.vk_id = provider_id
        else:
            raise ValueError(f"Unknown provider: {provider}")
        
        await db.commit()
        await db.refresh(user)
        return user
    
    @staticmethod
    async def merge_or_link_account(
        db: AsyncSession,
        provider: str,
        provider_id: str,
        email: Optional[str] = None
    ) -> Tuple[User, bool]:
        """
        Merge or link social account with existing user
        Returns (user, is_new_user)
        """
        # First, try to find user by provider ID
        user = await SocialAuthService.find_user_by_social_id(db, provider, provider_id)
        
        if user:
            # User already exists with this social account
            return user, False
        
        # If email is provided, try to find existing user by email
        if email:
            user = await SocialAuthService.find_user_by_email(db, email)
            
            if user:
                # Link social account to existing user
                user = await SocialAuthService.link_social_account(
                    db, user, provider, provider_id
                )
                return user, False
        
        # No existing user found, will need to create new one
        return None, True
    
    @staticmethod
    async def unlink_social_account(
        db: AsyncSession,
        user: User,
        provider: str
    ) -> User:
        """Unlink social account from user"""
        # Ensure user has password or another social login before unlinking
        has_password = bool(user.password_hash)
        other_socials = sum([
            bool(user.google_id and provider != "google"),
            bool(user.apple_id and provider != "apple"),
            bool(user.telegram_id and provider != "telegram"),
            bool(user.vk_id and provider != "vk")
        ])
        
        if not has_password and other_socials == 0:
            raise ValueError("Cannot unlink last authentication method. Set a password first.")
        
        # Unlink the account
        if provider == "google":
            user.google_id = None
        elif provider == "apple":
            user.apple_id = None
        elif provider == "telegram":
            user.telegram_id = None
        elif provider == "vk":
            user.vk_id = None
        else:
            raise ValueError(f"Unknown provider: {provider}")
        
        await db.commit()
        await db.refresh(user)
        return user


# Singleton instance
social_auth_service = SocialAuthService()
