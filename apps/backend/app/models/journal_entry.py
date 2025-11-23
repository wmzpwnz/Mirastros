"""Journal Entry Database Model"""

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.core.database import Base


class EntryType(str, enum.Enum):
    """Types of journal entries"""
    DREAM = "dream"
    MEDITATION = "meditation"
    READING = "reading"
    RITUAL = "ritual"
    REFLECTION = "reflection"
    OTHER = "other"


class JournalEntry(Base):
    """Journal Entry model for storing practice journal"""
    
    __tablename__ = "journal_entries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    entry_type = Column(Enum(EntryType), nullable=False, default=EntryType.REFLECTION)
    tags = Column(JSON, nullable=True)  # Array of tags
    metadata = Column(JSON, nullable=True)  # Additional metadata (e.g., related reading ID)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationship to User
    user = relationship("User", back_populates="journal_entries")
    
    def __repr__(self):
        return f"<JournalEntry(id={self.id}, user_id={self.user_id}, type={self.entry_type})>"
