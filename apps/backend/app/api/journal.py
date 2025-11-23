"""Journal API Endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.services.journal import JournalService
from app.services.llm import UnifiedLLMService
from app.schemas.journal import (
    JournalEntryCreate,
    JournalEntryUpdate,
    JournalEntryResponse,
    JournalEntriesResponse,
    JournalInsightsResponse,
    JournalStatsResponse
)

router = APIRouter(prefix="/journal", tags=["journal"])


def get_journal_service(
    db: AsyncSession = Depends(get_db)
) -> JournalService:
    """Dependency to get JournalService instance"""
    llm_service = UnifiedLLMService()
    return JournalService(llm_service=llm_service)


@router.post("/entries", response_model=JournalEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_journal_entry(
    request: JournalEntryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    journal_service: JournalService = Depends(get_journal_service)
):
    """
    Create a new journal entry
    
    - **title**: Title of the entry
    - **content**: Content of the entry
    - **entry_type**: Type of entry (dream, meditation, reading, ritual, reflection, other)
    - **tags**: Optional tags for categorization
    - **metadata**: Optional additional metadata
    """
    try:
        entry = await journal_service.create_entry(
            db=db,
            user_id=str(current_user.id),
            title=request.title,
            content=request.content,
            entry_type=request.entry_type,
            tags=request.tags,
            metadata=request.metadata
        )
        
        return entry
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create journal entry: {str(e)}"
        )


@router.get("/entries", response_model=JournalEntriesResponse)
async def get_journal_entries(
    limit: int = Query(20, ge=1, le=100, description="Maximum number of entries to return"),
    offset: int = Query(0, ge=0, description="Number of entries to skip"),
    entry_type: Optional[str] = Query(None, description="Filter by entry type"),
    tags: Optional[str] = Query(None, description="Filter by tags (comma-separated)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    journal_service: JournalService = Depends(get_journal_service)
):
    """
    Get user's journal entries with pagination and filtering
    
    - **limit**: Maximum number of entries to return (1-100, default: 20)
    - **offset**: Number of entries to skip (default: 0)
    - **entry_type**: Filter by entry type (optional)
    - **tags**: Filter by tags, comma-separated (optional)
    """
    try:
        # Parse tags
        tags_list = None
        if tags:
            tags_list = [tag.strip() for tag in tags.split(",") if tag.strip()]
        
        entries = await journal_service.get_entries(
            db=db,
            user_id=str(current_user.id),
            limit=limit,
            offset=offset,
            entry_type=entry_type,
            tags=tags_list
        )
        
        return {
            "entries": entries,
            "total": len(entries),
            "limit": limit,
            "offset": offset
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve journal entries: {str(e)}"
        )


@router.get("/entries/{entry_id}", response_model=JournalEntryResponse)
async def get_journal_entry(
    entry_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    journal_service: JournalService = Depends(get_journal_service)
):
    """
    Get a specific journal entry by ID
    """
    try:
        entry = await journal_service.get_entry_by_id(
            db=db,
            entry_id=entry_id,
            user_id=str(current_user.id)
        )
        
        if not entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Journal entry not found"
            )
        
        return entry
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve journal entry: {str(e)}"
        )


@router.put("/entries/{entry_id}", response_model=JournalEntryResponse)
async def update_journal_entry(
    entry_id: str,
    request: JournalEntryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    journal_service: JournalService = Depends(get_journal_service)
):
    """
    Update a journal entry
    
    - **title**: New title (optional)
    - **content**: New content (optional)
    - **tags**: New tags (optional)
    - **metadata**: New metadata (optional)
    """
    try:
        entry = await journal_service.update_entry(
            db=db,
            entry_id=entry_id,
            user_id=str(current_user.id),
            title=request.title,
            content=request.content,
            tags=request.tags,
            metadata=request.metadata
        )
        
        if not entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Journal entry not found"
            )
        
        return entry
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update journal entry: {str(e)}"
        )


@router.delete("/entries/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_journal_entry(
    entry_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    journal_service: JournalService = Depends(get_journal_service)
):
    """
    Delete a journal entry
    """
    try:
        success = await journal_service.delete_entry(
            db=db,
            entry_id=entry_id,
            user_id=str(current_user.id)
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Journal entry not found"
            )
        
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete journal entry: {str(e)}"
        )


@router.get("/statistics", response_model=JournalStatsResponse)
async def get_journal_statistics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    journal_service: JournalService = Depends(get_journal_service)
):
    """
    Get journal statistics
    
    Returns statistics about the user's journal including:
    - Total entries
    - Entries by type
    - Entries by month
    - Most used tags
    - Current streak
    """
    try:
        stats = await journal_service.get_statistics(
            db=db,
            user_id=str(current_user.id)
        )
        
        return stats
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve journal statistics: {str(e)}"
        )


@router.get("/insights", response_model=JournalInsightsResponse)
async def get_journal_insights(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    journal_service: JournalService = Depends(get_journal_service)
):
    """
    Get AI-generated insights from journal entries
    
    Analyzes patterns, themes, and progress in the user's journal
    and provides personalized insights and encouragement.
    """
    try:
        insights = await journal_service.analyze_patterns(
            db=db,
            user_id=str(current_user.id)
        )
        
        return insights
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate journal insights: {str(e)}"
        )
