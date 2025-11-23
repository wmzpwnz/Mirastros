"""Unit tests for LLM service"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.llm import UnifiedLLMService


class TestUnifiedLLMService:
    """Test UnifiedLLMService"""
    
    @pytest.mark.asyncio
    async def test_load_model_success(self, mocker):
        """Test successful model loading"""
        # Mock httpx client
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"status": "success"}
        
        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response
        
        mocker.patch("httpx.AsyncClient", return_value=mock_client)
        
        service = UnifiedLLMService()
        await service.load_model()
        
        assert service.is_loaded is True
    
    @pytest.mark.asyncio
    async def test_generate_basic(self, mocker):
        """Test basic text generation"""
        service = UnifiedLLMService()
        service.is_loaded = True
        
        # Mock Ollama API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "response": "This is a test response",
            "done": True
        }
        
        mock_client = AsyncMock()
        mock_client.post.return_value = mock_response
        
        mocker.patch("httpx.AsyncClient", return_value=mock_client)
        
        result = await service.generate(
            prompt="Test prompt",
            max_tokens=100,
            temperature=0.7
        )
        
        assert isinstance(result, str)
        assert len(result) > 0
    
    @pytest.mark.asyncio
    async def test_generate_with_context(self, mocker):
        """Test generation with context"""
        service = UnifiedLLMService()
        service.is_loaded = True
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "response": "Response with context",
            "done": True
        }
        
        mock_client = AsyncMock()
        mock_client.post.return_value = mock_response
        
        mocker.patch("httpx.AsyncClient", return_value=mock_client)
        
        result = await service.generate(
            prompt="What is astrology?",
            context="Astrology is the study of celestial bodies.",
            max_tokens=100
        )
        
        assert isinstance(result, str)
    
    @pytest.mark.asyncio
    async def test_generate_model_not_loaded(self):
        """Test generation when model is not loaded"""
        service = UnifiedLLMService()
        service.is_loaded = False
        
        with pytest.raises(Exception):
            await service.generate(prompt="Test")
    
    @pytest.mark.asyncio
    async def test_streaming_generation(self, mocker):
        """Test streaming generation"""
        service = UnifiedLLMService()
        service.is_loaded = True
        
        # Mock streaming response
        async def mock_stream():
            yield {"type": "token", "content": "Hello"}
            yield {"type": "token", "content": " world"}
            yield {"type": "done"}
        
        mocker.patch.object(
            service,
            "_stream_generate_optimized",
            return_value=mock_stream()
        )
        
        tokens = []
        async for event in service._stream_generate_optimized(
            prompt="Test",
            max_tokens=50
        ):
            if event.get("type") == "token":
                tokens.append(event.get("content"))
        
        assert len(tokens) == 2
        assert "".join(tokens) == "Hello world"
