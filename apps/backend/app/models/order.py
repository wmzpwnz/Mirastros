"""Order Database Model"""

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Numeric, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base


class Order(Base):
    """Order model for shop purchases"""
    
    __tablename__ = "orders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    order_number = Column(String(50), unique=True, nullable=False)
    status = Column(String(50), default="pending", nullable=False)  # pending, paid, processing, shipped, delivered, cancelled
    items = Column(JSON, nullable=False)  # Array of {product_id, name, quantity, price}
    total_amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    payment_method = Column(String(50), nullable=True)  # stripe, yukassa
    payment_id = Column(String(255), nullable=True)
    shipping_address = Column(JSON, nullable=False)  # {name, address, city, country, postal_code, phone}
    tracking_number = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationship to User
    user = relationship("User", back_populates="orders")
    
    def __repr__(self):
        return f"<Order(id={self.id}, order_number={self.order_number}, status={self.status})>"
