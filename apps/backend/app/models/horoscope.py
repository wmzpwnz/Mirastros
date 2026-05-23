"""Horoscope model for storing personalized horoscopes"""
from sqlalchemy import Column, String, DateTime, Date, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime, timezone
import uuid
import enum


def _utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class HoroscopePeriod(str, enum.Enum):
    """Horoscope period enum"""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class Horoscope(Base):
    """Horoscope model for storing personalized horoscopes"""
    __tablename__ = "horoscopes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=True, index=True)  # Nullable for general horoscopes
    zodiac_sign = Column(String(50), nullable=False, index=True)
    period = Column(SQLEnum(HoroscopePeriod), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)  # Date for which horoscope is generated
    
    # Horoscope content
    prediction = Column(Text, nullable=False)
    lucky_numbers = Column(JSON, nullable=True)  # List of integers
    lucky_colors = Column(JSON, nullable=True)  # List of strings
    compatibility_signs = Column(JSON, nullable=True)  # List of strings
    advice = Column(Text, nullable=True)
    
    # Personalization data (for Premium/Platinum users)
    is_personalized = Column(String(10), default="false", nullable=False)  # "true" or "false" as string
    transit_data = Column(JSON, nullable=True)  # Current transits affecting the user
    
    # Metadata
    created_at = Column(DateTime, default=_utc_now, nullable=False)
    
    def __repr__(self):
        return f"<Horoscope {self.zodiac_sign} {self.period} {self.date}>"
