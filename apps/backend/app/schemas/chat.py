"""Chat API Schemas for Clarify with Mirastros"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class ChatMessageCreate(BaseModel):
    """Request to send a message in chat"""
    message: str = Field(..., description="User's message", min_length=1, max_length=2000)
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "Can you explain more about what The Magician card means for my career?"
            }
        }


class ChatMessageResponse(BaseModel):
    """A single chat message"""
    id: str
    role: str  # user or assistant
    content: str
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "role": "assistant",
                "content": "The Magician in your career reading represents...",
                "created_at": "2025-11-21T10:30:00"
            }
        }


class ChatConversationCreate(BaseModel):
    """Request to create a new chat conversation"""
    service_type: str = Field(..., description="Type of service (tarot, horoscope, dream, etc.)")
    reading_id: Optional[str] = Field(None, description="ID of the original reading")
    context_data: Optional[Dict[str, Any]] = Field(None, description="Original reading data for context")
    initial_message: Optional[str] = Field(None, description="Optional initial message")
    
    class Config:
        json_schema_extra = {
            "example": {
                "service_type": "tarot",
                "reading_id": "550e8400-e29b-41d4-a716-446655440000",
                "context_data": {
                    "spread_type": "three-card",
                    "cards": [{"name": "The Magician", "position": "Past"}],
                    "interpretation": "The cards reveal..."
                },
                "initial_message": "Can you tell me more about this reading?"
            }
        }


class ChatConversationResponse(BaseModel):
    """Response containing conversation details"""
    id: str
    user_id: str
    service_type: Optional[str]
    reading_id: Optional[str]
    context_data: Optional[Dict[str, Any]]
    messages: List[ChatMessageResponse]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "660e8400-e29b-41d4-a716-446655440000",
                "service_type": "tarot",
                "reading_id": "770e8400-e29b-41d4-a716-446655440000",
                "context_data": {"spread_type": "three-card"},
                "messages": [],
                "created_at": "2025-11-21T10:30:00",
                "updated_at": "2025-11-21T10:30:00"
            }
        }


class ChatStreamResponse(BaseModel):
    """Response for streaming chat (SSE)"""
    type: str = Field(..., description="Type of event: token, done, error")
    content: Optional[str] = Field(None, description="Content for token events")
    message_id: Optional[str] = Field(None, description="Message ID when done")
    error: Optional[str] = Field(None, description="Error message if type is error")
    
    class Config:
        json_schema_extra = {
            "example": {
                "type": "token",
                "content": "The Magician",
                "message_id": None,
                "error": None
            }
        }


class ConversationListResponse(BaseModel):
    """Response containing list of conversations"""
    conversations: List[ChatConversationResponse]
    total: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "conversations": [],
                "total": 0
            }
        }
