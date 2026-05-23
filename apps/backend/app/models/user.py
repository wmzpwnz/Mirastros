from sqlalchemy import Column, String, DateTime, Date, Time, Enum as SQLEnum, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime, timezone
import uuid
import enum


def _utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class SubscriptionTier(str, enum.Enum):
    """Subscription tier enum"""
    FREEMIUM = "freemium"
    PREMIUM = "premium"
    PLATINUM = "platinum"

class User(Base):
    """User model with subscription and birth data"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)  # Nullable for social-only accounts
    full_name = Column(String(255), nullable=False)
    
    # Email verification
    email_verified = Column(Boolean, default=False, nullable=False)
    email_verification_token = Column(String(255), nullable=True)
    email_verification_expires = Column(DateTime, nullable=True)
    
    # Password reset
    password_reset_token = Column(String(255), nullable=True)
    password_reset_expires = Column(DateTime, nullable=True)
    
    # Birth data for natal chart
    birth_date = Column(Date, nullable=True)
    birth_time = Column(Time, nullable=True)
    birth_location = Column(JSON, nullable=True)  # {city, country, latitude, longitude}
    zodiac_sign = Column(String(50), nullable=True)
    
    # Subscription
    subscription_tier = Column(
        SQLEnum(SubscriptionTier, native_enum=False, values_callable=lambda x: [e.value for e in x]),
        default=SubscriptionTier.FREEMIUM.value,
        nullable=False
    )
    subscription_expires = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=_utc_now, nullable=False)
    updated_at = Column(DateTime, default=_utc_now, onupdate=_utc_now, nullable=False)
    last_login = Column(DateTime, nullable=True)
    
    # Social login identifiers
    google_id = Column(String(255), unique=True, nullable=True)
    apple_id = Column(String(255), unique=True, nullable=True)
    telegram_id = Column(String(255), unique=True, nullable=True)
    vk_id = Column(String(255), unique=True, nullable=True)
    
    # Settings and Localization
    preferred_language = Column(String(10), default="ru", nullable=False)
    timezone = Column(String(50), default="UTC", nullable=False)
    
    # Relationships
    tarot_readings = relationship("TarotReading", back_populates="user", cascade="all, delete-orphan")
    iching_consultations = relationship("IChingConsultation", back_populates="user", cascade="all, delete-orphan")
    lenormand_readings = relationship("LenormandReading", back_populates="user", cascade="all, delete-orphan")
    numerology_calculations = relationship("NumerologyCalculation", back_populates="user", cascade="all, delete-orphan")
    destiny_matrix = relationship("DestinyMatrix", back_populates="user", uselist=False, cascade="all, delete-orphan")
    dream_interpretations = relationship("DreamInterpretation", back_populates="user", cascade="all, delete-orphan")
    journal_entries = relationship("JournalEntry", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    analytics_events = relationship("AnalyticsEvent", back_populates="user", cascade="all, delete-orphan")
    astro_context = relationship("AstroContext", back_populates="user", uselist=False, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User {self.email} ({self.subscription_tier})>"
