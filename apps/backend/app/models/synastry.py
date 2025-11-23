"""Synastry (compatibility) database model"""
from sqlalchemy import Column, String, JSON, DateTime, Float
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.core.database import Base


class Synastry(Base):
    """Synastry analysis between two people"""
    __tablename__ = "synastries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Person 1 data (usually the user)
    person1_name = Column(String(100), nullable=False)
    person1_chart = Column(JSON, nullable=False)
    
    # Person 2 data (partner)
    person2_name = Column(String(100), nullable=False)
    person2_chart = Column(JSON, nullable=False)
    
    # Synastry analysis
    aspects = Column(JSON, nullable=False)  # Inter-chart aspects
    compatibility_score = Column(Float, nullable=False)
    relationship_type = Column(String(50), nullable=False)  # romantic, friendship, business
    
    # AI interpretation
    interpretation = Column(String, nullable=True)
    strengths = Column(JSON, nullable=True)  # List of relationship strengths
    challenges = Column(JSON, nullable=True)  # List of relationship challenges
    advice = Column(String, nullable=True)
    
    calculated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Synastry {self.person1_name} & {self.person2_name}>"
