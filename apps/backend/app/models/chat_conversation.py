"""Chat conversation models for Clarify with Mirastros feature"""

from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime, timezone
import uuid


def _utc_now():
    return datetime.now(timezone.utc)


class ChatConversation(Base):
    """Chat conversation with Mirastros AI"""
    __tablename__ = "chat_conversations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Context information
    service_type = Column(String(50), nullable=True)  # tarot, horoscope, dream, etc.
    reading_id = Column(String(255), nullable=True)  # ID of the original reading
    context_data = Column(JSON, nullable=True)  # Original reading data for context
    
    # Metadata
    created_at = Column(DateTime, default=_utc_now, nullable=False)
    updated_at = Column(DateTime, default=_utc_now, onupdate=_utc_now, nullable=False)
    
    # Relationships
    user = relationship("User", backref="chat_conversations")
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="ChatMessage.created_at")
    
    def __repr__(self):
        return f"<ChatConversation {self.id} user={self.user_id} service={self.service_type}>"


class ChatMessage(Base):
    """Individual message in a chat conversation"""
    __tablename__ = "chat_messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("chat_conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Message content
    role = Column(String(20), nullable=False)  # user or assistant
    content = Column(Text, nullable=False)
    
    # Metadata
    created_at = Column(DateTime, default=_utc_now, nullable=False)
    token_count = Column(Integer, nullable=True)  # For tracking usage
    
    # Relationships
    conversation = relationship("ChatConversation", back_populates="messages")
    
    def __repr__(self):
        return f"<ChatMessage {self.id} role={self.role}>"
