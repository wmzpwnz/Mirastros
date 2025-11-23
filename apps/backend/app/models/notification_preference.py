"""
Notification Preference model for storing user notification settings
"""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.core.database import Base


class NotificationPreference(Base):
    """Notification preference model"""
    __tablename__ = "notification_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    
    # Notification settings
    daily_horoscope = Column(Boolean, default=True, nullable=False)
    daily_horoscope_time = Column(String, default="09:00", nullable=False)  # HH:MM format
    transits = Column(Boolean, default=False, nullable=False)
    transit_types = Column(ARRAY(String), default=["major"], nullable=True)  # major, minor, all
    lunar_phases = Column(Boolean, default=False, nullable=False)
    reminders = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
