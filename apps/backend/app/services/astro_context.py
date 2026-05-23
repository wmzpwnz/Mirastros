"""Astro Context Service - Get user's astrological context (brain)"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.models.astro_context import AstroContext
import json
import logging

logger = logging.getLogger(__name__)


async def get_user_astro_context(
    db: AsyncSession,
    user_id: str
) -> Optional[str]:
    """
    Get user's astrological context and format it for LLM prompt
    
    Returns formatted context string or None if no context exists
    """
    try:
        # Convert string to UUID if needed
        import uuid
        try:
            user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
        except (ValueError, AttributeError):
            logger.warning(f"Invalid user_id format: {user_id}")
            return None
        
        # Query astro_context for user
        result = await db.execute(
            select(AstroContext).filter_by(user_id=user_uuid)
        )
        ctx = result.scalar_one_or_none()
        
        if not ctx:
            logger.debug(f"No astro_context found for user {user_id}")
            return None
        
        logger.info(f"Found astro_context for user {user_id}")
        
        # Build context string
        context_parts = []
        
        # Add natal data if available
        if ctx.natal_data:
            context_parts.append("=== Натальная карта ===")
            context_parts.append(json.dumps(ctx.natal_data, ensure_ascii=False, indent=2))
        
        # Add active arcana if available
        if ctx.last_arcana is not None:
            context_parts.append(f"\n=== Активный аркан из матрицы судьбы ===")
            context_parts.append(f"Аркан: {ctx.last_arcana}")
        
        # Add dream symbols if available
        if ctx.dream_symbols:
            context_parts.append("\n=== Последние символы из сна ===")
            context_parts.append(json.dumps(ctx.dream_symbols, ensure_ascii=False, indent=2))
        
        # Add last question if available
        if ctx.last_question:
            context_parts.append("\n=== Последний вопрос (Таро/И-Цзин) ===")
            context_parts.append(ctx.last_question)
        
        if not context_parts:
            return None
        
        return "\n".join(context_parts)
    
    except Exception:
        # If there's any error, return None (don't break the flow)
        return None


async def merge_astro_context(
    db: AsyncSession,
    user_id: str,
    existing_context: str = ""
) -> str:
    """
    Merge user's astrological context with existing context
    
    Args:
        db: Database session
        user_id: User ID
        existing_context: Existing context string (e.g., from RAG)
    
    Returns:
        Merged context string
    """
    logger.debug(f"Merging astro context for user {user_id}")
    astro_context = await get_user_astro_context(db, user_id)
    
    if not astro_context:
        logger.debug(f"No astro context to merge for user {user_id}")
        return existing_context
    
    logger.info(f"Merging astro context for user {user_id}. Context length: {len(astro_context)}")
    
    # Merge contexts
    if existing_context:
        merged = f"{existing_context}\n\n=== Контекст пользователя ===\n{astro_context}"
    else:
        merged = f"=== Контекст пользователя ===\n{astro_context}"
    
    logger.debug(f"Merged context length: {len(merged)}")
    return merged

