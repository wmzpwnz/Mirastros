"""I Ching Consultation Database Model"""

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Integer, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from app.core.database import Base


def _utc_now():
    return datetime.now(timezone.utc)


class IChingConsultation(Base):
    """I Ching Consultation model for storing consultation history"""
    
    __tablename__ = "iching_consultations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    question = Column(Text, nullable=False)
    method = Column(String(20), nullable=False)  # coin or yarrow
    
    # Primary hexagram
    primary_hexagram_number = Column(Integer, nullable=False)
    primary_hexagram_data = Column(JSON, nullable=False)
    
    # Changing lines (if any)
    changing_lines = Column(ARRAY(Integer), nullable=True)
    
    # Resulting hexagram (if changing lines exist)
    resulting_hexagram_number = Column(Integer, nullable=True)
    resulting_hexagram_data = Column(JSON, nullable=True)
    
    # AI interpretation
    interpretation = Column(Text, nullable=False)
    
    created_at = Column(DateTime, default=_utc_now, nullable=False)
    
    # Relationship to User
    user = relationship("User", back_populates="iching_consultations")
    
    def __repr__(self):
        return f"<IChingConsultation(id={self.id}, user_id={self.user_id}, hexagram={self.primary_hexagram_number})>"
