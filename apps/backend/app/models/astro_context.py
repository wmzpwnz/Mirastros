"""Astro Context Database Model"""

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from app.core.database import Base


def _utc_now():
    return datetime.now(timezone.utc)


class AstroContext(Base):
    """Astro Context model - stores user's astrological context (brain)"""
    
    __tablename__ = "astro_context"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # Full natal chart data
    natal_data = Column(JSONB, nullable=True)
    
    # Active arcana from destiny matrix
    last_arcana = Column(Integer, nullable=True)
    
    # Last dream symbols
    dream_symbols = Column(JSONB, nullable=True)
    
    # Last question from Tarot or I-Ching
    last_question = Column(Text, nullable=True)
    
    # Metadata
    updated_at = Column(DateTime, default=_utc_now, onupdate=_utc_now, nullable=True)
    
    # Relationship to User
    user = relationship("User", back_populates="astro_context")
    
    def __repr__(self):
        return f"<AstroContext(id={self.id}, user_id={self.user_id}, last_arcana={self.last_arcana})>"



