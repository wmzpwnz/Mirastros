import redis.asyncio as aioredis
from redis.exceptions import RedisError
from app.core.config import get_settings
from typing import Optional, Any, Callable
import json
import hashlib
from functools import wraps
import inspect

settings = get_settings()

class RedisClient:
    def __init__(self):
        self.redis: Optional[aioredis.Redis] = None
    
    async def connect(self):
        """Connect to Redis"""
        self.redis = await aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.redis:
            await self.redis.close()
    
    async def get(self, key: str):
        """Get value from cache"""
        if not self.redis:
            return None
        value = await self.redis.get(key)
        if value:
            return json.loads(value)
        return None
    
    async def set(self, key: str, value: any, ttl: int = None):
        """Set value in cache"""
        if not self.redis:
            return
        ttl = ttl or settings.REDIS_CACHE_TTL
        await self.redis.setex(key, ttl, json.dumps(value))
    
    async def get_cached(self, key: str):
        """Read an optional cache for results the caller can recompute."""
        try:
            return await self.get(key)
        except (RedisError, json.JSONDecodeError):
            return None

    async def set_cached(self, key: str, value: Any, ttl: int):
        try:
            await self.set(key, value, ttl)
        except RedisError:
            pass  # The calculated result is still available to the caller.

    async def delete(self, key: str):
        """Delete key from cache"""
        if not self.redis:
            return
        await self.redis.delete(key)
    
    async def exists(self, key: str) -> bool:
        """Check if key exists"""
        if not self.redis:
            return False
        return await self.redis.exists(key) > 0
    
    async def delete_pattern(self, pattern: str):
        """Delete all keys matching pattern"""
        if not self.redis:
            return
        cursor = 0
        while True:
            cursor, keys = await self.redis.scan(cursor, match=pattern, count=100)
            if keys:
                await self.redis.delete(*keys)
            if cursor == 0:
                break
    
    async def get_ttl(self, key: str) -> int:
        """Get TTL for a key"""
        if not self.redis:
            return -1
        return await self.redis.ttl(key)
    
    async def increment(self, key: str, amount: int = 1) -> int:
        """Increment a counter"""
        if not self.redis:
            return 0
        return await self.redis.incrby(key, amount)
    
    async def decrement(self, key: str, amount: int = 1) -> int:
        """Decrement a counter"""
        if not self.redis:
            return 0
        return await self.redis.decrby(key, amount)

# Global Redis client instance
redis_client = RedisClient()

async def get_redis() -> RedisClient:
    """Dependency for FastAPI"""
    return redis_client


# Caching utilities

def generate_cache_key(prefix: str, *args, **kwargs) -> str:
    """
    Generate a cache key from function arguments
    """
    # Create a string representation of arguments
    key_parts = [prefix]
    
    # Add positional arguments
    for arg in args:
        if isinstance(arg, (str, int, float, bool)):
            key_parts.append(str(arg))
        else:
            # For complex objects, use hash
            key_parts.append(hashlib.md5(str(arg).encode()).hexdigest()[:8])
    
    # Add keyword arguments
    for k, v in sorted(kwargs.items()):
        if isinstance(v, (str, int, float, bool)):
            key_parts.append(f"{k}:{v}")
        else:
            key_parts.append(f"{k}:{hashlib.md5(str(v).encode()).hexdigest()[:8]}")
    
    return ":".join(key_parts)


def cache_result(ttl: int = 3600, prefix: str = "cache"):
    """
    Decorator to cache function results in Redis
    
    Usage:
        @cache_result(ttl=86400, prefix="horoscope")
        async def get_horoscope(sign: str, date: str):
            ...
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = generate_cache_key(prefix, *args, **kwargs)
            
            # Try to get from cache
            cached_value = await redis_client.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Call function
            result = await func(*args, **kwargs)
            
            # Cache result
            await redis_client.set(cache_key, result, ttl)
            
            return result
        
        return wrapper
    return decorator


async def invalidate_cache(prefix: str, *args, **kwargs):
    """
    Invalidate cache for specific key or pattern
    """
    if args or kwargs:
        # Invalidate specific key
        cache_key = generate_cache_key(prefix, *args, **kwargs)
        await redis_client.delete(cache_key)
    else:
        # Invalidate all keys with prefix
        await redis_client.delete_pattern(f"{prefix}:*")


# Predefined cache TTLs (in seconds)
class CacheTTL:
    """Cache TTL constants"""
    HOROSCOPE_DAILY = 86400  # 24 hours
    HOROSCOPE_WEEKLY = 604800  # 7 days
    HOROSCOPE_MONTHLY = 2592000  # 30 days
    GENERAL_QUERY = 3600  # 1 hour
    NATAL_CHART = 2592000  # 30 days (rarely changes)
    TAROT_CARD_DATA = 604800  # 7 days (static data)
    USER_PROFILE = 1800  # 30 minutes
    SUBSCRIPTION_STATUS = 300  # 5 minutes
    PRODUCT_CATALOG = 3600  # 1 hour
    DREAM_DICTIONARY = 86400  # 24 hours (static data)
    RUNE_DATA = 604800  # 7 days (static data)
    ICHING_DATA = 604800  # 7 days (static data)
    LUNAR_PHASE = 3600  # 1 hour
    CRYSTAL_DATA = 86400  # 24 hours (static data)
