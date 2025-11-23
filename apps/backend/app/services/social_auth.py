"""Social authentication service for OAuth2 providers"""
from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.models.user import User, SubscriptionTier
from app.schemas.social_auth import (
    GoogleAuthData,
    AppleAuthData,
    TelegramAuthData,
    VKAuthData
)


class SocialAuthService:
    """Service for handling social authentication and account linking"""
    
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
            subscription_tier=SubscriptionTier.FREEMIUM
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
            subscription_tier=SubscriptionTier.FREEMIUM
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
            subscription_tier=SubscriptionTier.FREEMIUM
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
            subscription_tier=SubscriptionTier.FREEMIUM
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
