"""
Notification service for sending push notifications via Expo
"""
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import List, Dict, Optional
from datetime import datetime
import logging

from app.models.push_token import PushToken
from app.models.notification_preference import NotificationPreference
from app.schemas.notifications import NotificationPreferences

logger = logging.getLogger(__name__)

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


class NotificationService:
    """Service for managing push notifications"""

    @staticmethod
    async def register_push_token(
        db: AsyncSession,
        user_id: str,
        push_token: str,
        platform: str,
        device_type: Optional[str] = None,
    ) -> None:
        """Register or update a push token for a user"""
        try:
            # Check if token already exists
            stmt = select(PushToken).where(
                PushToken.user_id == user_id,
                PushToken.push_token == push_token
            )
            result = await db.execute(stmt)
            existing_token = result.scalar_one_or_none()

            if existing_token:
                # Update existing token
                existing_token.is_active = True
                existing_token.updated_at = datetime.utcnow()
            else:
                # Create new token
                new_token = PushToken(
                    user_id=user_id,
                    push_token=push_token,
                    platform=platform,
                    device_type=device_type,
                    is_active=True,
                )
                db.add(new_token)

            await db.commit()
            logger.info(f"Registered push token for user {user_id}")
        except Exception as e:
            await db.rollback()
            logger.error(f"Error registering push token: {e}")
            raise

    @staticmethod
    async def unregister_push_token(
        db: AsyncSession,
        user_id: str,
        push_token: str,
    ) -> None:
        """Unregister a push token"""
        try:
            stmt = update(PushToken).where(
                PushToken.user_id == user_id,
                PushToken.push_token == push_token
            ).values(is_active=False, updated_at=datetime.utcnow())
            
            await db.execute(stmt)
            await db.commit()
            logger.info(f"Unregistered push token for user {user_id}")
        except Exception as e:
            await db.rollback()
            logger.error(f"Error unregistering push token: {e}")
            raise

    @staticmethod
    async def get_user_tokens(
        db: AsyncSession,
        user_id: str,
    ) -> List[str]:
        """Get all active push tokens for a user"""
        stmt = select(PushToken.push_token).where(
            PushToken.user_id == user_id,
            PushToken.is_active == True
        )
        result = await db.execute(stmt)
        return [row[0] for row in result.all()]

    @staticmethod
    async def send_push_notification(
        tokens: List[str],
        title: str,
        body: str,
        data: Optional[Dict] = None,
    ) -> None:
        """Send push notification via Expo Push API"""
        if not tokens:
            logger.warning("No tokens provided for push notification")
            return

        messages = []
        for token in tokens:
            message = {
                "to": token,
                "sound": "default",
                "title": title,
                "body": body,
                "data": data or {},
            }
            messages.append(message)

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    EXPO_PUSH_URL,
                    json=messages,
                    headers={
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                    },
                    timeout=10.0,
                )
                
                if response.status_code == 200:
                    result = response.json()
                    logger.info(f"Push notifications sent: {result}")
                else:
                    logger.error(f"Failed to send push notifications: {response.text}")
        except Exception as e:
            logger.error(f"Error sending push notification: {e}")
            raise

    @staticmethod
    async def subscribe_to_transits(
        db: AsyncSession,
        user_id: str,
        transit_types: List[str],
    ) -> None:
        """Subscribe user to transit notifications"""
        try:
            # Get or create notification preferences
            stmt = select(NotificationPreference).where(
                NotificationPreference.user_id == user_id
            )
            result = await db.execute(stmt)
            prefs = result.scalar_one_or_none()

            if prefs:
                prefs.transits = True
                prefs.transit_types = transit_types
                prefs.updated_at = datetime.utcnow()
            else:
                prefs = NotificationPreference(
                    user_id=user_id,
                    transits=True,
                    transit_types=transit_types,
                )
                db.add(prefs)

            await db.commit()
            logger.info(f"User {user_id} subscribed to transit notifications")
        except Exception as e:
            await db.rollback()
            logger.error(f"Error subscribing to transits: {e}")
            raise

    @staticmethod
    async def unsubscribe_from_transits(
        db: AsyncSession,
        user_id: str,
    ) -> None:
        """Unsubscribe user from transit notifications"""
        try:
            stmt = update(NotificationPreference).where(
                NotificationPreference.user_id == user_id
            ).values(transits=False, updated_at=datetime.utcnow())
            
            await db.execute(stmt)
            await db.commit()
            logger.info(f"User {user_id} unsubscribed from transit notifications")
        except Exception as e:
            await db.rollback()
            logger.error(f"Error unsubscribing from transits: {e}")
            raise

    @staticmethod
    async def subscribe_to_lunar(
        db: AsyncSession,
        user_id: str,
    ) -> None:
        """Subscribe user to lunar phase notifications"""
        try:
            stmt = select(NotificationPreference).where(
                NotificationPreference.user_id == user_id
            )
            result = await db.execute(stmt)
            prefs = result.scalar_one_or_none()

            if prefs:
                prefs.lunar_phases = True
                prefs.updated_at = datetime.utcnow()
            else:
                prefs = NotificationPreference(
                    user_id=user_id,
                    lunar_phases=True,
                )
                db.add(prefs)

            await db.commit()
            logger.info(f"User {user_id} subscribed to lunar notifications")
        except Exception as e:
            await db.rollback()
            logger.error(f"Error subscribing to lunar notifications: {e}")
            raise

    @staticmethod
    async def get_preferences(
        db: AsyncSession,
        user_id: str,
    ) -> NotificationPreferences:
        """Get user's notification preferences"""
        stmt = select(NotificationPreference).where(
            NotificationPreference.user_id == user_id
        )
        result = await db.execute(stmt)
        prefs = result.scalar_one_or_none()

        if not prefs:
            # Return default preferences
            return NotificationPreferences()

        return NotificationPreferences(
            daily_horoscope=prefs.daily_horoscope,
            daily_horoscope_time=prefs.daily_horoscope_time,
            transits=prefs.transits,
            lunar_phases=prefs.lunar_phases,
            reminders=prefs.reminders,
        )

    @staticmethod
    async def update_preferences(
        db: AsyncSession,
        user_id: str,
        preferences: NotificationPreferences,
    ) -> None:
        """Update user's notification preferences"""
        try:
            stmt = select(NotificationPreference).where(
                NotificationPreference.user_id == user_id
            )
            result = await db.execute(stmt)
            prefs = result.scalar_one_or_none()

            if prefs:
                prefs.daily_horoscope = preferences.daily_horoscope
                prefs.daily_horoscope_time = preferences.daily_horoscope_time
                prefs.transits = preferences.transits
                prefs.lunar_phases = preferences.lunar_phases
                prefs.reminders = preferences.reminders
                prefs.updated_at = datetime.utcnow()
            else:
                prefs = NotificationPreference(
                    user_id=user_id,
                    **preferences.model_dump()
                )
                db.add(prefs)

            await db.commit()
            logger.info(f"Updated notification preferences for user {user_id}")
        except Exception as e:
            await db.rollback()
            logger.error(f"Error updating preferences: {e}")
            raise

    @staticmethod
    async def send_transit_notification(
        db: AsyncSession,
        user_id: str,
        transit_name: str,
        transit_description: str,
    ) -> None:
        """Send a transit notification to a user"""
        tokens = await NotificationService.get_user_tokens(db, user_id)
        
        if tokens:
            await NotificationService.send_push_notification(
                tokens=tokens,
                title=f"⭐ {transit_name}",
                body=transit_description,
                data={"type": "transit", "transit_name": transit_name},
            )

    @staticmethod
    async def send_lunar_notification(
        db: AsyncSession,
        user_id: str,
        phase_name: str,
        phase_description: str,
    ) -> None:
        """Send a lunar phase notification to a user"""
        tokens = await NotificationService.get_user_tokens(db, user_id)
        
        if tokens:
            await NotificationService.send_push_notification(
                tokens=tokens,
                title=f"🌙 {phase_name}",
                body=phase_description,
                data={"type": "lunar", "phase_name": phase_name},
            )

    @staticmethod
    async def send_daily_horoscope_notification(
        db: AsyncSession,
        user_id: str,
        zodiac_sign: str,
    ) -> None:
        """Send daily horoscope notification to a user"""
        tokens = await NotificationService.get_user_tokens(db, user_id)
        
        if tokens:
            await NotificationService.send_push_notification(
                tokens=tokens,
                title="🌟 Your Daily Horoscope",
                body=f"Discover what the stars have aligned for {zodiac_sign} today",
                data={"type": "daily_horoscope", "zodiac_sign": zodiac_sign},
            )
