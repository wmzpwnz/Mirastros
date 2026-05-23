"""
Notification Preference model for storing user notification settings
"""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid

from app.core.database import Base


def _utc_now():
    return datetime.now(timezone.utc)


class NotificationPreference(Base):
    """Notification preference model"""
    __tablename__ = "notification_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True, index=True)
    
    # Notification settings
    daily_horoscope = Column(Boolean, default=True, nullable=False)
    daily_horoscope_time = Column(String, default="09:00", nullable=False)  # HH:MM format
    transits = Column(Boolean, default=False, nullable=False)
    transit_types = Column(ARRAY(String), default=["major"], nullable=True)  # major, minor, all
    lunar_phases = Column(Boolean, default=False, nullable=False)
    reminders = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime, default=_utc_now, nullable=False)
    updated_at = Column(DateTime, default=_utc_now, onupdate=_utc_now, nullable=False)
