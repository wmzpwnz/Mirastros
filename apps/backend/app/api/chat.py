"""Chat API Endpoints for Clarify with Mirastros"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user, require_premium
from app.models.user import User
from app.services.chat import ChatService
from app.services.llm import UnifiedLLMService
from app.services.rag import RAGService
from app.schemas.chat import (
    ChatConversationCreate,
    ChatConversationResponse,
    ChatMessageCreate,
    ChatMessageResponse,
    ConversationListResponse
)

router = APIRouter(prefix="/chat", tags=["chat"])


def get_chat_service(
    db: AsyncSession = Depends(get_db)
) -> ChatService:
    """Dependency to get ChatService instance"""
    llm_service = UnifiedLLMService()
    rag_service = RAGService()
    return ChatService(llm_service=llm_service, rag_service=rag_service)


@router.post("/conversations", response_model=ChatConversationResponse)
async def create_conversation(
    request: ChatConversationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_premium),
    chat_service: ChatService = Depends(get_chat_service)
):
    """
    Create a new chat conversation with Mirastros AI
    
    **Requires Premium or Platinum subscription**
    
    - **service_type**: Type of service (tarot, horoscope, dream, etc.)
    - **reading_id**: Optional ID of the original reading
    - **context_data**: Optional original reading data for context
    - **initial_message**: Optional initial message to start the conversation
    
    Returns the created conversation with optional initial AI response
    """
    try:
        # Create conversation
        conversation = await chat_service.create_conversation(
            db=db,
            user_id=str(current_user.id),
            service_type=request.service_type,
            reading_id=request.reading_id,
            context_data=request.context_data
        )
        
        # If initial message provided, send it
        messages = []
        if request.initial_message:
            response = await chat_service.send_message(
                db=db,
                conversation_id=str(conversation.id),
                user_id=str(current_user.id),
                message_content=request.initial_message,
                user=current_user,
                stream=False
            )
            
            # Refresh conversation to get messages
            await db.refresh(conversation)
            messages = [
                {
                    "id": str(msg.id),
                    "role": msg.role,
                    "content": msg.content,
                    "created_at": msg.created_at
                }
                for msg in conversation.messages
            ]
        
        return {
            "id": str(conversation.id),
            "user_id": str(conversation.user_id),
            "service_type": conversation.service_type,
            "reading_id": conversation.reading_id,
            "context_data": conversation.context_data,
            "messages": messages,
            "created_at": conversation.created_at,
            "updated_at": conversation.updated_at
        }
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create conversation: {str(e)}"
        )


@router.get("/conversations", response_model=ConversationListResponse)
async def get_conversations(
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_premium),
    chat_service: ChatService = Depends(get_chat_service)
):
    """
    Get user's chat conversations
    
    **Requires Premium or Platinum subscription**
    
    - **limit**: Maximum number of conversations to return (default: 20)
    - **offset**: Number of conversations to skip (default: 0)
    
    Returns list of conversations ordered by most recent first
    """
    try:
        conversations = await chat_service.get_user_conversations(
            db=db,
            user_id=str(current_user.id),
            limit=limit,
            offset=offset
        )
        
        formatted_conversations = [
            {
                "id": str(conv.id),
                "user_id": str(conv.user_id),
                "service_type": conv.service_type,
                "reading_id": conv.reading_id,
                "context_data": conv.context_data,
                "messages": [
                    {
                        "id": str(msg.id),
                        "role": msg.role,
                        "content": msg.content,
                        "created_at": msg.created_at
                    }
                    for msg in conv.messages
                ],
                "created_at": conv.created_at,
                "updated_at": conv.updated_at
            }
            for conv in conversations
        ]
        
        return {
            "conversations": formatted_conversations,
            "total": len(formatted_conversations)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve conversations: {str(e)}"
        )


@router.get("/conversations/{conversation_id}", response_model=ChatConversationResponse)
async def get_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_premium),
    chat_service: ChatService = Depends(get_chat_service)
):
    """
    Get a specific conversation by ID
    
    **Requires Premium or Platinum subscription**
    
    - **conversation_id**: UUID of the conversation
    
    Returns the conversation with all messages
    """
    try:
        conversation = await chat_service.get_conversation(
            db=db,
            conversation_id=conversation_id,
            user_id=str(current_user.id)
        )
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        return {
            "id": str(conversation.id),
            "user_id": str(conversation.user_id),
            "service_type": conversation.service_type,
            "reading_id": conversation.reading_id,
            "context_data": conversation.context_data,
            "messages": [
                {
                    "id": str(msg.id),
                    "role": msg.role,
                    "content": msg.content,
                    "created_at": msg.created_at
                }
                for msg in conversation.messages
            ],
            "created_at": conversation.created_at,
            "updated_at": conversation.updated_at
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve conversation: {str(e)}"
        )


@router.post("/conversations/{conversation_id}/messages", response_model=ChatMessageResponse)
async def send_message(
    conversation_id: str,
    request: ChatMessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_premium),
    chat_service: ChatService = Depends(get_chat_service)
):
    """
    Send a message in a conversation
    
    **Requires Premium or Platinum subscription**
    
    - **conversation_id**: UUID of the conversation
    - **message**: User's message content
    
    Returns the AI's response
    """
    try:
        response = await chat_service.send_message(
            db=db,
            conversation_id=conversation_id,
            user_id=str(current_user.id),
            message_content=request.message,
            user=current_user,
            stream=False
        )
        
        return response
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}"
        )


@router.post("/conversations/{conversation_id}/messages/stream")
async def send_message_stream(
    conversation_id: str,
    request: ChatMessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_premium),
    chat_service: ChatService = Depends(get_chat_service)
):
    """
    Send a message and stream the AI response using Server-Sent Events (SSE)
    
    **Requires Premium or Platinum subscription**
    
    - **conversation_id**: UUID of the conversation
    - **message**: User's message content
    
    Returns a stream of AI response tokens
    
    Event types:
    - `token`: Contains a piece of the response text
    - `done`: Indicates the response is complete, includes message_id
    - `error`: Indicates an error occurred
    """
    try:
        stream = await chat_service.send_message(
            db=db,
            conversation_id=conversation_id,
            user_id=str(current_user.id),
            message_content=request.message,
            user=current_user,
            stream=True
        )
        
        return StreamingResponse(
            stream,
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"  # Disable nginx buffering
            }
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}"
        )


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_premium),
    chat_service: ChatService = Depends(get_chat_service)
):
    """
    Delete a conversation
    
    **Requires Premium or Platinum subscription**
    
    - **conversation_id**: UUID of the conversation
    
    Returns 204 No Content on success
    """
    try:
        success = await chat_service.delete_conversation(
            db=db,
            conversation_id=conversation_id,
            user_id=str(current_user.id)
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete conversation: {str(e)}"
        )
