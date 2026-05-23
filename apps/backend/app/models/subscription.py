from sqlalchemy import Column, Integer, String, DateTime, Numeric, Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from datetime import datetime, timezone
import enum


def _utc_now():
    return datetime.now(timezone.utc)

class SubscriptionStatus(str, enum.Enum):
    """Subscription status enum"""
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PENDING = "pending"

class PaymentMethod(str, enum.Enum):
    """Payment method enum"""
    STRIPE = "stripe"
    YOOKASSA = "yookassa"
    REVENUE_CAT = "revenue_cat"
    TELEGRAM_STARS = "telegram_stars"
    VK_PAY = "vk_pay"

class Subscription(Base):
    """Subscription model for tracking user subscriptions"""
    __tablename__ = "subscriptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Subscription details
    tier = Column(String(50), nullable=False)  # premium, platinum
    status = Column(
        SQLEnum(SubscriptionStatus),
        default=SubscriptionStatus.PENDING,
        nullable=False
    )
    
    # Payment details
    payment_method = Column(SQLEnum(PaymentMethod), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    
    # External payment IDs
    stripe_subscription_id = Column(String(255), nullable=True)
    yookassa_payment_id = Column(String(255), nullable=True)
    revenue_cat_transaction_id = Column(String(255), nullable=True)
    
    # Subscription period
    starts_at = Column(DateTime, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    cancelled_at = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=_utc_now, nullable=False)
    updated_at = Column(DateTime, default=_utc_now, onupdate=_utc_now, nullable=False)
    
    # Auto-renewal
    auto_renew = Column(String(10), default="true", nullable=False)  # "true" or "false" as string
    
    def __repr__(self):
        return f"<Subscription user_id={self.user_id} tier={self.tier} status={self.status}>"
