"""Tarot Reading Database Model"""

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base


class TarotReading(Base):
    """Tarot Reading model for storing reading history"""
    
    __tablename__ = "tarot_readings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    spread_type = Column(String(50), nullable=False)  # one-card, three-card, five-card, celtic-cross
    question = Column(Text, nullable=True)
    cards = Column(JSON, nullable=False)  # Array of drawn cards with positions
    interpretation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship to User
    user = relationship("User", back_populates="tarot_readings")
    
    def __repr__(self):
        return f"<TarotReading(id={self.id}, user_id={self.user_id}, spread_type={self.spread_type})>"
