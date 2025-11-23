"""Dream Interpretation Database Model"""

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base


class DreamInterpretation(Base):
    """Dream Interpretation model for storing dream journal"""
    
    __tablename__ = "dream_interpretations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    dream_description = Column(Text, nullable=False)
    symbols = Column(JSON, nullable=True)  # Array of identified symbols
    interpretation = Column(Text, nullable=False)
    themes = Column(JSON, nullable=True)  # Array of identified themes
    emotions = Column(JSON, nullable=True)  # Array of emotions in the dream
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship to User
    user = relationship("User", back_populates="dream_interpretations")
    
    def __repr__(self):
        return f"<DreamInterpretation(id={self.id}, user_id={self.user_id})>"
