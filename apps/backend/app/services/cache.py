"""
Caching service with predefined strategies
Implements caching for different service types
"""
from app.core.redis import redis_client, generate_cache_key, CacheTTL
from typing import Optional, Any, Dict
from datetime import date, datetime
import json


class CacheService:
    """Service for managing application caching"""
    
    # Horoscope caching
    
    @staticmethod
    async def get_horoscope(zodiac_sign: str, period: str, date_str: str) -> Optional[Dict]:
        """Get cached horoscope"""
        key = generate_cache_key("horoscope", zodiac_sign, period, date_str)
        return await redis_client.get(key)
    
    @staticmethod
    async def set_horoscope(zodiac_sign: str, period: str, date_str: str, data: Dict):
        """Cache horoscope with appropriate TTL"""
        key = generate_cache_key("horoscope", zodiac_sign, period, date_str)
        
        # Set TTL based on period
        if period == "daily":
            ttl = CacheTTL.HOROSCOPE_DAILY
        elif period == "weekly":
            ttl = CacheTTL.HOROSCOPE_WEEKLY
        else:  # monthly
            ttl = CacheTTL.HOROSCOPE_MONTHLY
        
        await redis_client.set(key, data, ttl)
    
    @staticmethod
    async def invalidate_horoscope(zodiac_sign: str = None, period: str = None):
        """Invalidate horoscope cache"""
        if zodiac_sign and period:
            # Invalidate specific horoscope
            pattern = f"horoscope:{zodiac_sign}:{period}:*"
        elif zodiac_sign:
            # Invalidate all periods for a sign
            pattern = f"horoscope:{zodiac_sign}:*"
        else:
            # Invalidate all horoscopes
            pattern = "horoscope:*"
        
        await redis_client.delete_pattern(pattern)
    
    # Natal chart caching
    
    @staticmethod
    async def get_natal_chart(user_id: str) -> Optional[Dict]:
        """Get cached natal chart"""
        key = generate_cache_key("natal_chart", user_id)
        return await redis_client.get(key)
    
    @staticmethod
    async def set_natal_chart(user_id: str, data: Dict):
        """Cache natal chart (long TTL as it rarely changes)"""
        key = generate_cache_key("natal_chart", user_id)
        await redis_client.set(key, data, CacheTTL.NATAL_CHART)
    
    @staticmethod
    async def invalidate_natal_chart(user_id: str):
        """Invalidate natal chart cache"""
        key = generate_cache_key("natal_chart", user_id)
        await redis_client.delete(key)
    
    # Tarot card data caching (static data)
    
    @staticmethod
    async def get_tarot_cards() -> Optional[list]:
        """Get cached tarot cards"""
        return await redis_client.get("tarot:cards:all")
    
    @staticmethod
    async def set_tarot_cards(cards: list):
        """Cache tarot cards"""
        await redis_client.set("tarot:cards:all", cards, CacheTTL.TAROT_CARD_DATA)
    
    # Rune data caching (static data)
    
    @staticmethod
    async def get_runes() -> Optional[list]:
        """Get cached runes"""
        return await redis_client.get("runes:all")
    
    @staticmethod
    async def set_runes(runes: list):
        """Cache runes"""
        await redis_client.set("runes:all", runes, CacheTTL.RUNE_DATA)
    
    # I Ching data caching (static data)
    
    @staticmethod
    async def get_hexagrams() -> Optional[list]:
        """Get cached hexagrams"""
        return await redis_client.get("iching:hexagrams:all")
    
    @staticmethod
    async def set_hexagrams(hexagrams: list):
        """Cache hexagrams"""
        await redis_client.set("iching:hexagrams:all", hexagrams, CacheTTL.ICHING_DATA)
    
    # Dream dictionary caching (static data)
    
    @staticmethod
    async def get_dream_symbol(symbol: str) -> Optional[Dict]:
        """Get cached dream symbol"""
        key = generate_cache_key("dream:symbol", symbol.lower())
        return await redis_client.get(key)
    
    @staticmethod
    async def set_dream_symbol(symbol: str, data: Dict):
        """Cache dream symbol"""
        key = generate_cache_key("dream:symbol", symbol.lower())
        await redis_client.set(key, data, CacheTTL.DREAM_DICTIONARY)
    
    # Lunar phase caching
    
    @staticmethod
    async def get_lunar_phase(date_str: str) -> Optional[Dict]:
        """Get cached lunar phase"""
        key = generate_cache_key("lunar:phase", date_str)
        return await redis_client.get(key)
    
    @staticmethod
    async def set_lunar_phase(date_str: str, data: Dict):
        """Cache lunar phase"""
        key = generate_cache_key("lunar:phase", date_str)
        await redis_client.set(key, data, CacheTTL.LUNAR_PHASE)
    
    # Crystal data caching (static data)
    
    @staticmethod
    async def get_crystals() -> Optional[list]:
        """Get cached crystals"""
        return await redis_client.get("crystals:all")
    
    @staticmethod
    async def set_crystals(crystals: list):
        """Cache crystals"""
        await redis_client.set("crystals:all", crystals, CacheTTL.CRYSTAL_DATA)
    
    # User profile caching
    
    @staticmethod
    async def get_user_profile(user_id: str) -> Optional[Dict]:
        """Get cached user profile"""
        key = generate_cache_key("user:profile", user_id)
        return await redis_client.get(key)
    
    @staticmethod
    async def set_user_profile(user_id: str, data: Dict):
        """Cache user profile"""
        key = generate_cache_key("user:profile", user_id)
        await redis_client.set(key, data, CacheTTL.USER_PROFILE)
    
    @staticmethod
    async def invalidate_user_profile(user_id: str):
        """Invalidate user profile cache"""
        key = generate_cache_key("user:profile", user_id)
        await redis_client.delete(key)
    
    # Subscription status caching
    
    @staticmethod
    async def get_subscription_status(user_id: str) -> Optional[Dict]:
        """Get cached subscription status"""
        key = generate_cache_key("subscription:status", user_id)
        return await redis_client.get(key)
    
    @staticmethod
    async def set_subscription_status(user_id: str, data: Dict):
        """Cache subscription status"""
        key = generate_cache_key("subscription:status", user_id)
        await redis_client.set(key, data, CacheTTL.SUBSCRIPTION_STATUS)
    
    @staticmethod
    async def invalidate_subscription_status(user_id: str):
        """Invalidate subscription status cache"""
        key = generate_cache_key("subscription:status", user_id)
        await redis_client.delete(key)
    
    # Product catalog caching
    
    @staticmethod
    async def get_products(category: str = None) -> Optional[list]:
        """Get cached products"""
        if category:
            key = generate_cache_key("shop:products", category)
        else:
            key = "shop:products:all"
        return await redis_client.get(key)
    
    @staticmethod
    async def set_products(products: list, category: str = None):
        """Cache products"""
        if category:
            key = generate_cache_key("shop:products", category)
        else:
            key = "shop:products:all"
        await redis_client.set(key, products, CacheTTL.PRODUCT_CATALOG)
    
    @staticmethod
    async def invalidate_products():
        """Invalidate product catalog cache"""
        await redis_client.delete_pattern("shop:products:*")
    
    # General query caching (for AI responses)
    
    @staticmethod
    async def get_ai_response(query_hash: str) -> Optional[str]:
        """Get cached AI response"""
        key = generate_cache_key("ai:response", query_hash)
        return await redis_client.get(key)
    
    @staticmethod
    async def set_ai_response(query_hash: str, response: str):
        """Cache AI response"""
        key = generate_cache_key("ai:response", query_hash)
        await redis_client.set(key, response, CacheTTL.GENERAL_QUERY)
    
    # Cache statistics
    
    @staticmethod
    async def get_cache_stats() -> Dict:
        """Get cache statistics"""
        if not redis_client.redis:
            return {"error": "Redis not connected"}
        
        info = await redis_client.redis.info("stats")
        
        return {
            "total_keys": await redis_client.redis.dbsize(),
            "hits": info.get("keyspace_hits", 0),
            "misses": info.get("keyspace_misses", 0),
            "hit_rate": round(
                info.get("keyspace_hits", 0) / 
                (info.get("keyspace_hits", 0) + info.get("keyspace_misses", 1)) * 100, 
                2
            ),
            "memory_used": info.get("used_memory_human", "N/A"),
        }
    
    # Bulk cache operations
    
    @staticmethod
    async def clear_all_cache():
        """Clear all cache (use with caution!)"""
        if redis_client.redis:
            await redis_client.redis.flushdb()
    
    @staticmethod
    async def warm_up_static_data():
        """
        Warm up cache with static data on startup
        This should be called during application startup
        """
        # This would be implemented to pre-load static data
        # like tarot cards, runes, crystals, etc.
        pass


# Global cache service instance
cache_service = CacheService()
