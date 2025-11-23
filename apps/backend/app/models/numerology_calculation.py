"""Numerology Calculation Database Model"""

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base


class NumerologyCalculation(Base):
    """Numerology Calculation model for storing user's numerology data"""
    
    __tablename__ = "numerology_calculations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    full_name = Column(String(255), nullable=False)
    birth_date = Column(String(10), nullable=False)  # YYYY-MM-DD format
    life_path_number = Column(Integer, nullable=False)
    destiny_number = Column(Integer, nullable=False)
    soul_urge_number = Column(Integer, nullable=False)
    personality_number = Column(Integer, nullable=False)
    interpretation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationship to User
    user = relationship("User", back_populates="numerology_calculations")
    
    def __repr__(self):
        return f"<NumerologyCalculation(id={self.id}, user_id={self.user_id}, life_path={self.life_path_number})>"
