"""Chat service for Clarify with Mirastros AI Assistant"""

import json
from typing import List, Dict, Any, Optional, AsyncGenerator
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.models.chat_conversation import ChatConversation, ChatMessage
from app.models.user import User
from app.services.llm import UnifiedLLMService
from app.services.rag import RAGService


class ChatService:
    """Service for managing chat conversations with Mirastros AI"""
    
    def __init__(self, llm_service: UnifiedLLMService, rag_service: RAGService):
        self.llm_service = llm_service
        self.rag_service = rag_service
    
    async def create_conversation(
        self,
        db: AsyncSession,
        user_id: str,
        service_type: Optional[str] = None,
        reading_id: Optional[str] = None,
        context_data: Optional[Dict[str, Any]] = None
    ) -> ChatConversation:
        """Create a new chat conversation"""
        if service_type and service_type.startswith(("result-explanation:", "welcome-portrait:")):
            raise ValueError("Reserved result explanation service")
        if not get_settings().LEGACY_AI_CHAT_ENABLED:
            raise ValueError("Open-ended AI chat is disabled")
        conversation = ChatConversation(
            user_id=user_id,
            service_type=service_type,
            reading_id=reading_id,
            context_data=context_data
        )
        
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)
        
        return conversation
    
    async def get_conversation(
        self,
        db: AsyncSession,
        conversation_id: str,
        user_id: str
    ) -> Optional[ChatConversation]:
        """Get a conversation by ID (with authorization check)"""
        result = await db.execute(
            select(ChatConversation)
            .options(selectinload(ChatConversation.messages))
            .where(
                ChatConversation.id == conversation_id,
                ChatConversation.user_id == user_id
            )
        )
        return result.scalar_one_or_none()
    
    async def get_user_conversations(
        self,
        db: AsyncSession,
        user_id: str,
        limit: int = 20,
        offset: int = 0
    ) -> List[ChatConversation]:
        """Get all conversations for a user"""
        result = await db.execute(
            select(ChatConversation)
            .options(selectinload(ChatConversation.messages))
            .where(ChatConversation.user_id == user_id)
            .order_by(desc(ChatConversation.updated_at))
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())
    
    async def send_message(
        self,
        db: AsyncSession,
        conversation_id: str,
        user_id: str,
        message_content: str,
        user: User,
        stream: bool = False
    ) -> AsyncGenerator[str, None] | Dict[str, Any]:
        """Send a message and get AI response"""
        # Get conversation
        conversation = await self.get_conversation(db, conversation_id, user_id)
        if not conversation:
            raise ValueError("Conversation not found")
        
        if (conversation.service_type or "").startswith(("result-explanation:", "welcome-portrait:")):
            raise ValueError("Use the bounded result explanation endpoint")

        if not get_settings().LEGACY_AI_CHAT_ENABLED:
            raise ValueError("Open-ended AI chat is disabled")

        # Save user message
        user_message = ChatMessage(
            conversation_id=conversation_id,
            role="user",
            content=message_content
        )
        db.add(user_message)
        await db.commit()
        
        # Build context for AI
        context = await self._build_context(db, conversation, user)
        
        # Get AI response
        if stream:
            return self._stream_ai_response(
                db, conversation, message_content, context
            )
        else:
            ai_response = await self.llm_service.generate(
                prompt=message_content,
                context=context,
                max_tokens=800,
                temperature=0.7,
                stream=False
            )
            
            # Save AI message
            ai_message = ChatMessage(
                conversation_id=conversation_id,
                role="assistant",
                content=ai_response
            )
            db.add(ai_message)
            
            # Update conversation timestamp
            conversation.updated_at = datetime.now(timezone.utc)
            
            await db.commit()
            await db.refresh(ai_message)
            
            return {
                "id": str(ai_message.id),
                "role": "assistant",
                "content": ai_response,
                "created_at": ai_message.created_at.isoformat()
            }
    
    async def _stream_ai_response(
        self,
        db: AsyncSession,
        conversation: ChatConversation,
        message_content: str,
        context: str
    ) -> AsyncGenerator[str, None]:
        """
        Stream AI response using SSE with optimizations:
        - Quick response marker for early feedback (sent after first token)
        - Token-by-token delivery with zero latency via asyncio.Queue
        - Two-phase generation for fast initial feedback
        - Proper error handling with retry support
        """
        full_response = ""
        
        try:
            # Determine if this is a simple query for fast-start mode
            is_simple_query = len(message_content.split()) < 20
            
            # Stream events from optimized LLM service
            async for event in self.llm_service._stream_generate_optimized(
                prompt=f"User: {message_content}\nMirastros:",
                max_tokens=800,
                temperature=0.7,
                fast_start=is_simple_query
            ):
                event_type = event.get("type")
                
                if event_type == "quick_response":
                    # Send quick response marker for early feedback
                    yield f"data: {json.dumps({'type': 'quick_response'})}\n\n"
                
                elif event_type == "token":
                    # Accumulate and yield token
                    token = event.get("content", "")
                    full_response += token
                    yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
                
                elif event_type == "done":
                    # Generation complete
                    break
                
                elif event_type == "error":
                    # Error occurred
                    error_msg = event.get("error", "Unknown error")
                    yield f"data: {json.dumps({'type': 'error', 'error': error_msg})}\n\n"
                    raise Exception(error_msg)
            
            # Save AI message after streaming completes
            ai_message = ChatMessage(
                conversation_id=conversation.id,
                role="assistant",
                content=full_response
            )
            db.add(ai_message)
            
            # Update conversation timestamp
            conversation.updated_at = datetime.now(timezone.utc)
            
            await db.commit()
            await db.refresh(ai_message)
            
            # Send done event with message ID
            yield f"data: {json.dumps({'type': 'done', 'message_id': str(ai_message.id)})}\n\n"
            
        except Exception as e:
            # Send error event
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
            raise
    
    async def _build_context(
        self,
        db: AsyncSession,
        conversation: ChatConversation,
        user: User
    ) -> str:
        """Build context for AI including reading data, user info, and conversation history"""
        context_parts = []
        
        # Add user information
        if user.zodiac_sign:
            context_parts.append(f"User's Zodiac Sign: {user.zodiac_sign}")
        if user.birth_date:
            context_parts.append(f"User's Birth Date: {user.birth_date}")
        
        # Add original reading context
        if conversation.context_data:
            context_parts.append("\n=== Original Reading ===")
            
            # Format based on service type
            if conversation.service_type == "tarot":
                context_parts.append(self._format_tarot_context(conversation.context_data))
            elif conversation.service_type == "horoscope":
                context_parts.append(self._format_horoscope_context(conversation.context_data))
            elif conversation.service_type == "dream":
                context_parts.append(self._format_dream_context(conversation.context_data))
            elif conversation.service_type == "numerology":
                context_parts.append(self._format_numerology_context(conversation.context_data))
            else:
                # Generic formatting
                context_parts.append(json.dumps(conversation.context_data, indent=2))
        
        # Add conversation history (last 10 messages)
        if conversation.messages:
            context_parts.append("\n=== Conversation History ===")
            recent_messages = conversation.messages[-10:]  # Last 10 messages
            for msg in recent_messages:
                context_parts.append(f"{msg.role.capitalize()}: {msg.content}")
        
        # Get relevant RAG context if available
        if conversation.service_type:
            try:
                rag_context = await self.rag_service.get_context(
                    db=db,
                    query=conversation.messages[-1].content if conversation.messages else "",
                    category=conversation.service_type
                )
                if rag_context:
                    context_parts.append("\n=== Esoteric Knowledge ===")
                    context_parts.append(rag_context)
            except Exception:
                pass  # RAG context is optional
        
        return "\n".join(context_parts)
    
    def _format_tarot_context(self, data: Dict[str, Any]) -> str:
        """Format Tarot reading context"""
        parts = []
        if "spread_type" in data:
            parts.append(f"Spread Type: {data['spread_type']}")
        if "question" in data and data["question"]:
            parts.append(f"Question: {data['question']}")
        if "cards" in data:
            parts.append("\nCards Drawn:")
            for card in data["cards"]:
                reversed = " (Reversed)" if card.get("reversed") else ""
                parts.append(f"- {card.get('name')}{reversed} in {card.get('position')} position")
        if "interpretation" in data:
            parts.append(f"\nInterpretation: {data['interpretation']}")
        return "\n".join(parts)
    
    def _format_horoscope_context(self, data: Dict[str, Any]) -> str:
        """Format horoscope context"""
        parts = []
        if "sign" in data:
            parts.append(f"Zodiac Sign: {data['sign']}")
        if "period" in data:
            parts.append(f"Period: {data['period']}")
        if "prediction" in data:
            parts.append(f"Prediction: {data['prediction']}")
        return "\n".join(parts)
    
    def _format_dream_context(self, data: Dict[str, Any]) -> str:
        """Format dream interpretation context"""
        parts = []
        if "dream_description" in data:
            parts.append(f"Dream: {data['dream_description']}")
        if "interpretation" in data:
            parts.append(f"Interpretation: {data['interpretation']}")
        if "symbols" in data:
            parts.append(f"Key Symbols: {', '.join(data['symbols'])}")
        return "\n".join(parts)
    
    def _format_numerology_context(self, data: Dict[str, Any]) -> str:
        """Format numerology context"""
        parts = []
        if "life_path" in data:
            parts.append(f"Life Path Number: {data['life_path']}")
        if "destiny" in data:
            parts.append(f"Destiny Number: {data['destiny']}")
        if "interpretation" in data:
            parts.append(f"Interpretation: {data['interpretation']}")
        return "\n".join(parts)
    
    async def delete_conversation(
        self,
        db: AsyncSession,
        conversation_id: str,
        user_id: str
    ) -> bool:
        """Delete a conversation (with authorization check)"""
        conversation = await self.get_conversation(db, conversation_id, user_id)
        if not conversation:
            return False
        
        await db.delete(conversation)
        await db.commit()
        return True
