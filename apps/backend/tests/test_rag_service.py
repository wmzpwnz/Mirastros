"""Unit tests for RAG service"""

import pytest
from unittest.mock import AsyncMock, MagicMock
from app.services.rag import RAGService
from app.services.embedding import EmbeddingService


class TestRAGService:
    """Test RAG service"""
    
    @pytest.mark.asyncio
    async def test_chunk_text(self):
        """Test text chunking"""
        service = RAGService()
        
        text = "This is a test. " * 100  # Long text
        chunks = service.chunk_text(text, chunk_size=100, overlap=20)
        
        assert len(chunks) > 1
        assert all(len(chunk) <= 120 for chunk in chunks)  # chunk_size + overlap
    
    @pytest.mark.asyncio
    async def test_ingest_document(self, db_session, mocker):
        """Test document ingestion"""
        # Mock embedding service
        mock_embedding = AsyncMock()
        mock_embedding.embed_batch.return_value = [[0.1] * 384] * 3
        
        mocker.patch.object(
            RAGService,
            "embedding_service",
            mock_embedding
        )
        
        service = RAGService()
        
        doc_id = await service.ingest_document(
            db=db_session,
            title="Test Document",
            content="This is test content. " * 50,
            category="astrology"
        )
        
        assert doc_id is not None
    
    @pytest.mark.asyncio
    async def test_retrieve_chunks(self, db_session, mocker):
        """Test chunk retrieval"""
        # Mock embedding service
        mock_embedding = AsyncMock()
        mock_embedding.embed_text.return_value = [0.1] * 384
        
        service = RAGService()
        service.embedding_service = mock_embedding
        
        # Mock database query
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        
        mocker.patch.object(
            db_session,
            "execute",
            return_value=mock_result
        )
        
        chunks = await service.retrieve(
            db=db_session,
            query="What is astrology?",
            top_k=5
        )
        
        assert isinstance(chunks, list)
    
    @pytest.mark.asyncio
    async def test_get_context(self, db_session, mocker):
        """Test context generation"""
        service = RAGService()
        
        # Mock retrieve method
        mock_chunks = [
            {"chunk_text": "Astrology is the study of celestial bodies."},
            {"chunk_text": "Planets influence human affairs."}
        ]
        
        mocker.patch.object(
            service,
            "retrieve",
            return_value=mock_chunks
        )
        
        context = await service.get_context(
            db=db_session,
            query="What is astrology?"
        )
        
        assert isinstance(context, str)
        assert len(context) > 0
        assert "Astrology" in context
