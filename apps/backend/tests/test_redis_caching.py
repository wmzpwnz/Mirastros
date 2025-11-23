"""Integration tests for Redis caching"""

import pytest
from unittest.mock import AsyncMock
from app.services.cache import CacheService


class TestRedisCaching:
    """Test Redis caching operations"""
    
    @pytest.mark.asyncio
    async def test_cache_set_and_get(self, mock_redis):
        """Test setting and getting cache"""
        cache_service = CacheService(redis_client=mock_redis)
        
        # Mock Redis responses
        mock_redis.set.return_value = True
        mock_redis.get.return_value = b'{"data": "test_value"}'
        
        # Set cache
        await cache_service.set("test_key", {"data": "test_value"}, ttl=3600)
        
        # Get cache
        value = await cache_service.get("test_key")
        
        assert value is not None
        mock_redis.set.assert_called_once()
        mock_redis.get.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_cache_miss(self, mock_redis):
        """Test cache miss"""
        cache_service = CacheService(redis_client=mock_redis)
        
        # Mock Redis to return None (cache miss)
        mock_redis.get.return_value = None
        
        value = await cache_service.get("nonexistent_key")
        
        assert value is None
        mock_redis.get.assert_called_once_with("nonexistent_key")
    
    @pytest.mark.asyncio
    async def test_cache_delete(self, mock_redis):
        """Test cache deletion"""
        cache_service = CacheService(redis_client=mock_redis)
        
        # Mock Redis responses
        mock_redis.delete.return_value = 1
        
        result = await cache_service.delete("test_key")
        
        assert result is True
        mock_redis.delete.assert_called_once_with("test_key")
    
    @pytest.mark.asyncio
    async def test_cache_exists(self, mock_redis):
        """Test checking if key exists"""
        cache_service = CacheService(redis_client=mock_redis)
        
        # Mock Redis responses
        mock_redis.exists.return_value = 1
        
        exists = await cache_service.exists("test_key")
        
        assert exists is True
        mock_redis.exists.assert_called_once_with("test_key")
    
    @pytest.mark.asyncio
    async def test_cache_with_ttl(self, mock_redis):
        """Test cache with TTL"""
        cache_service = CacheService(redis_client=mock_redis)
        
        # Mock Redis responses
        mock_redis.set.return_value = True
        
        await cache_service.set("test_key", "test_value", ttl=3600)
        
        # Verify TTL was set
        mock_redis.set.assert_called_once()
        call_args = mock_redis.set.call_args
        assert call_args[1].get("ex") == 3600 or call_args[0][2] == 3600
    
    @pytest.mark.asyncio
    async def test_horoscope_caching(self, mock_redis):
        """Test horoscope caching pattern"""
        cache_service = CacheService(redis_client=mock_redis)
        
        # Mock horoscope data
        horoscope_data = {
            "sign": "aries",
            "date": "2024-01-01",
            "prediction": "Today is a great day..."
        }
        
        # Cache key pattern
        cache_key = "horoscope:daily:aries:2024-01-01"
        
        # Mock Redis responses
        mock_redis.set.return_value = True
        mock_redis.get.return_value = None  # First call - cache miss
        
        # First call - cache miss
        cached = await cache_service.get(cache_key)
        assert cached is None
        
        # Set cache
        await cache_service.set(cache_key, horoscope_data, ttl=86400)  # 24 hours
        
        # Mock cache hit
        import json
        mock_redis.get.return_value = json.dumps(horoscope_data).encode()
        
        # Second call - cache hit
        cached = await cache_service.get(cache_key)
        assert cached is not None
    
    @pytest.mark.asyncio
    async def test_ai_response_caching(self, mock_redis):
        """Test AI response caching pattern"""
        cache_service = CacheService(redis_client=mock_redis)
        
        # Mock AI response
        ai_response = {
            "query": "What is astrology?",
            "response": "Astrology is the study of celestial bodies..."
        }
        
        # Cache key pattern
        import hashlib
        query_hash = hashlib.md5("What is astrology?".encode()).hexdigest()
        cache_key = f"ai:response:{query_hash}"
        
        # Mock Redis responses
        mock_redis.set.return_value = True
        
        # Set cache with 1 hour TTL
        await cache_service.set(cache_key, ai_response, ttl=3600)
        
        mock_redis.set.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_cache_invalidation(self, mock_redis):
        """Test cache invalidation pattern"""
        cache_service = CacheService(redis_client=mock_redis)
        
        # Mock Redis responses
        mock_redis.delete.return_value = 1
        
        # Invalidate user-specific cache
        user_id = "test-user-123"
        pattern_keys = [
            f"user:{user_id}:horoscope",
            f"user:{user_id}:tarot",
            f"user:{user_id}:natal"
        ]
        
        for key in pattern_keys:
            await cache_service.delete(key)
        
        assert mock_redis.delete.call_count == 3
    
    @pytest.mark.asyncio
    async def test_cache_error_handling(self, mock_redis):
        """Test cache error handling"""
        cache_service = CacheService(redis_client=mock_redis)
        
        # Mock Redis to raise an error
        mock_redis.get.side_effect = Exception("Redis connection error")
        
        # Should handle error gracefully
        value = await cache_service.get("test_key")
        
        # Should return None on error
        assert value is None
