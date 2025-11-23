"""Product Database Model"""

from sqlalchemy import Column, String, Text, DateTime, Numeric, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.core.database import Base


class Product(Base):
    """Product model for esoteric shop items"""
    
    __tablename__ = "products"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)  # crystals, tarot-decks, books, ritual-items
    price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    stock_quantity = Column(Integer, default=0, nullable=False)
    image_url = Column(String(500), nullable=True)
    zodiac_signs = Column(Text, nullable=True)  # Comma-separated zodiac signs for recommendations
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Product(id={self.id}, name={self.name}, category={self.category})>"
