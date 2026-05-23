"""Analytics event model for tracking user actions and system metrics."""
from datetime import datetime, timezone
from enum import Enum


def _utc_now():
    return datetime.now(timezone.utc)
from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class EventType(str, Enum):
    """Types of analytics events."""
    # User lifecycle events
    USER_REGISTERED = "user_registered"
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    
    # Subscription events
    SUBSCRIPTION_CREATED = "subscription_created"
    SUBSCRIPTION_UPGRADED = "subscription_upgraded"
    SUBSCRIPTION_DOWNGRADED = "subscription_downgraded"
    SUBSCRIPTION_CANCELLED = "subscription_cancelled"
    SUBSCRIPTION_RENEWED = "subscription_renewed"
    
    # Service usage events
    SERVICE_TAROT = "service_tarot"
    SERVICE_HOROSCOPE = "service_horoscope"
    SERVICE_NATAL_CHART = "service_natal_chart"
    SERVICE_NUMEROLOGY = "service_numerology"
    SERVICE_DREAM = "service_dream"
    SERVICE_RUNES = "service_runes"
    SERVICE_ICHING = "service_iching"
    SERVICE_LENORMAND = "service_lenormand"
    SERVICE_TRANSITS = "service_transits"
    SERVICE_SYNASTRY = "service_synastry"
    SERVICE_LUNAR = "service_lunar"
    SERVICE_CRYSTALS = "service_crystals"
    SERVICE_RITUALS = "service_rituals"
    SERVICE_HORARY = "service_horary"
    SERVICE_CHAKRA = "service_chakra"
    SERVICE_SOLAR_RETURN = "service_solar_return"
    SERVICE_KARMIC = "service_karmic"
    SERVICE_MANDALA = "service_mandala"
    
    # AI assistant events
    AI_CHAT_STARTED = "ai_chat_started"
    AI_CHAT_MESSAGE = "ai_chat_message"
    
    # Shop events
    SHOP_PRODUCT_VIEW = "shop_product_view"
    SHOP_CART_ADD = "shop_cart_add"
    SHOP_ORDER_CREATED = "shop_order_created"
    SHOP_ORDER_COMPLETED = "shop_order_completed"
    
    # Journal events
    JOURNAL_ENTRY_CREATED = "journal_entry_created"


class AnalyticsEvent(Base):
    """Analytics event for tracking user actions and system metrics."""
    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    timestamp = Column(DateTime, default=_utc_now, nullable=False, index=True)
    
    # Event metadata (service-specific data, performance metrics, etc.)
    event_metadata = Column(JSON, nullable=True)
    
    # Platform information
    platform = Column(String, nullable=True)  # web, mobile, telegram, vk
    
    # Session tracking
    session_id = Column(String, nullable=True, index=True)
    
    # Performance metrics
    response_time_ms = Column(Integer, nullable=True)
    
    # Relationship
    user = relationship("User", back_populates="analytics_events")

    # Indexes for common queries
    __table_args__ = (
        Index('idx_event_type_timestamp', 'event_type', 'timestamp'),
        Index('idx_user_timestamp', 'user_id', 'timestamp'),
        Index('idx_platform_timestamp', 'platform', 'timestamp'),
    )
