"""Astro Context API endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.astro_context import AstroContext

router = APIRouter(prefix="/astro", tags=["Astro Context"])
logger = logging.getLogger(__name__)


@router.post("/merge")
async def get_user_context(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user's astrological context (brain)
    
    Returns merged context from astro_context table:
    - natal: Full natal chart data
    - arcana: Active arcana from destiny matrix
    - dream: Last dream symbols
    - question: Last question from Tarot or I-Ching
    """
    try:
        logger.info(f"Getting astro context for user {current_user.id} ({current_user.email})")
        
        # Query astro_context for current user
        result = await db.execute(
            select(AstroContext).filter_by(user_id=current_user.id)
        )
        ctx = result.scalar_one_or_none()
        
        if not ctx:
            logger.info(f"No astro context found for user {current_user.id}")
            return {"status": "no_context_yet"}
        
        logger.info(f"Found astro context for user {current_user.id}")
        
        response = {
            "natal": ctx.natal_data,
            "arcana": ctx.last_arcana,
            "dream": ctx.dream_symbols,
            "question": ctx.last_question
        }
        
        logger.info(f"Returning context: natal={bool(ctx.natal_data)}, arcana={ctx.last_arcana}, dream={bool(ctx.dream_symbols)}, question={bool(ctx.last_question)}")
        
        return response
    
    except Exception as e:
        logger.error(f"Error getting user context: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user context: {str(e)}"
        )

