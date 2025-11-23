"""
Rate limiting middleware using Redis
Implements sliding window rate limiting (60 requests per minute per user)
"""
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.redis import redis_client
from app.core.config import get_settings
import time
from typing import Optional

settings = get_settings()

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware using Redis sliding window algorithm
    Limits: 60 requests per minute per user/IP
    """
    
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.window_size = 60  # 60 seconds
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health check and root endpoints
        if request.url.path in ["/", "/health", "/docs", "/openapi.json"]:
            return await call_next(request)
        
        # Get identifier (user_id from token or IP address)
        identifier = await self._get_identifier(request)
        
        # Check rate limit
        is_allowed, remaining, reset_time = await self._check_rate_limit(identifier)
        
        if not is_allowed:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Rate limit exceeded. Please try again later.",
                    "retry_after": reset_time
                },
                headers={
                    "X-RateLimit-Limit": str(self.requests_per_minute),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(reset_time),
                    "Retry-After": str(reset_time)
                }
            )
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers to response
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset_time)
        
        return response
    
    async def _get_identifier(self, request: Request) -> str:
        """
        Get identifier for rate limiting
        Priority: user_id from JWT token > IP address
        """
        # Try to get user_id from request state (set by auth middleware)
        user_id = getattr(request.state, "user_id", None)
        if user_id:
            return f"user:{user_id}"
        
        # Fallback to IP address
        client_ip = request.client.host if request.client else "unknown"
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        
        return f"ip:{client_ip}"
    
    async def _check_rate_limit(self, identifier: str) -> tuple[bool, int, int]:
        """
        Check rate limit using Redis sliding window
        Returns: (is_allowed, remaining_requests, reset_time)
        """
        if not redis_client.redis:
            # If Redis is not available, allow the request
            return True, self.requests_per_minute, int(time.time()) + self.window_size
        
        current_time = int(time.time())
        window_start = current_time - self.window_size
        key = f"rate_limit:{identifier}"
        
        try:
            # Use Redis pipeline for atomic operations
            pipe = redis_client.redis.pipeline()
            
            # Remove old entries outside the window
            pipe.zremrangebyscore(key, 0, window_start)
            
            # Count requests in current window
            pipe.zcard(key)
            
            # Add current request
            pipe.zadd(key, {str(current_time): current_time})
            
            # Set expiration
            pipe.expire(key, self.window_size)
            
            # Execute pipeline
            results = await pipe.execute()
            
            # Get count (result of zcard)
            count = results[1]
            
            # Check if limit exceeded
            is_allowed = count < self.requests_per_minute
            remaining = max(0, self.requests_per_minute - count - 1)
            reset_time = current_time + self.window_size
            
            return is_allowed, remaining, reset_time
            
        except Exception as e:
            # If Redis fails, allow the request (fail open)
            print(f"Rate limit check failed: {e}")
            return True, self.requests_per_minute, current_time + self.window_size


async def get_rate_limit_info(identifier: str) -> dict:
    """
    Get current rate limit info for an identifier
    Useful for debugging and monitoring
    """
    if not redis_client.redis:
        return {
            "requests_per_minute": 60,
            "current_count": 0,
            "remaining": 60,
            "reset_time": int(time.time()) + 60
        }
    
    current_time = int(time.time())
    window_start = current_time - 60
    key = f"rate_limit:{identifier}"
    
    try:
        # Remove old entries
        await redis_client.redis.zremrangebyscore(key, 0, window_start)
        
        # Count current requests
        count = await redis_client.redis.zcard(key)
        
        return {
            "requests_per_minute": 60,
            "current_count": count,
            "remaining": max(0, 60 - count),
            "reset_time": current_time + 60
        }
    except Exception as e:
        print(f"Failed to get rate limit info: {e}")
        return {
            "requests_per_minute": 60,
            "current_count": 0,
            "remaining": 60,
            "reset_time": current_time + 60
        }
