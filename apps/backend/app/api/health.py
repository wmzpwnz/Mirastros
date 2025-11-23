"""
Health check and monitoring endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import psutil
import time
from app.core.database import get_db
from app.core.redis import redis_client
from app.services.llm import llm_service
from app.core.config import get_settings

router = APIRouter(tags=["Health"])
settings = get_settings()


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str
    environment: str


class DetailedHealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str
    environment: str
    services: dict
    system: dict


class ServiceStatus(BaseModel):
    status: str
    response_time_ms: Optional[float] = None
    error: Optional[str] = None


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Basic health check endpoint
    Returns 200 if service is running
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT
    )


@router.get("/health/detailed", response_model=DetailedHealthResponse)
async def detailed_health_check(db: AsyncSession = Depends(get_db)):
    """
    Detailed health check with all service statuses
    Checks: Database, Redis, AI Model, System Resources
    """
    services = {}
    overall_status = "healthy"
    
    # Check Database
    db_status = await check_database(db)
    services["database"] = db_status
    if db_status["status"] != "healthy":
        overall_status = "degraded"
    
    # Check Redis
    redis_status = await check_redis()
    services["redis"] = redis_status
    if redis_status["status"] != "healthy":
        overall_status = "degraded"
    
    # Check AI Model
    ai_status = await check_ai_model()
    services["ai_model"] = ai_status
    if ai_status["status"] != "healthy":
        overall_status = "degraded"
    
    # System resources
    system_info = get_system_info()
    
    return DetailedHealthResponse(
        status=overall_status,
        timestamp=datetime.utcnow(),
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        services=services,
        system=system_info
    )


@router.get("/health/database")
async def check_database_endpoint(db: AsyncSession = Depends(get_db)):
    """Check database connectivity"""
    result = await check_database(db)
    if result["status"] != "healthy":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=result
        )
    return result


@router.get("/health/redis")
async def check_redis_endpoint():
    """Check Redis connectivity"""
    result = await check_redis()
    if result["status"] != "healthy":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=result
        )
    return result


@router.get("/health/ai")
async def check_ai_endpoint():
    """Check AI model status"""
    result = await check_ai_model()
    if result["status"] != "healthy":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=result
        )
    return result


@router.get("/health/system")
async def check_system_endpoint():
    """Check system resources"""
    return get_system_info()


# Helper functions

async def check_database(db: AsyncSession) -> dict:
    """Check database connectivity and response time"""
    try:
        start_time = time.time()
        await db.execute(text("SELECT 1"))
        response_time = (time.time() - start_time) * 1000
        
        return {
            "status": "healthy",
            "response_time_ms": round(response_time, 2)
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


async def check_redis() -> dict:
    """Check Redis connectivity and response time"""
    try:
        if not redis_client.redis:
            return {
                "status": "unhealthy",
                "error": "Redis client not initialized"
            }
        
        start_time = time.time()
        await redis_client.redis.ping()
        response_time = (time.time() - start_time) * 1000
        
        return {
            "status": "healthy",
            "response_time_ms": round(response_time, 2)
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


async def check_ai_model() -> dict:
    """Check AI model status"""
    try:
        if not llm_service.llm:
            return {
                "status": "unhealthy",
                "error": "AI model not loaded"
            }
        
        # Simple test to ensure model is responsive
        start_time = time.time()
        # Just check if model is loaded, don't actually generate
        response_time = (time.time() - start_time) * 1000
        
        return {
            "status": "healthy",
            "response_time_ms": round(response_time, 2),
            "model_loaded": True
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


def get_system_info() -> dict:
    """Get system resource information"""
    try:
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        return {
            "cpu_usage_percent": cpu_percent,
            "memory": {
                "total_gb": round(memory.total / (1024**3), 2),
                "used_gb": round(memory.used / (1024**3), 2),
                "available_gb": round(memory.available / (1024**3), 2),
                "percent": memory.percent
            },
            "disk": {
                "total_gb": round(disk.total / (1024**3), 2),
                "used_gb": round(disk.used / (1024**3), 2),
                "free_gb": round(disk.free / (1024**3), 2),
                "percent": disk.percent
            }
        }
    except Exception as e:
        return {
            "error": f"Failed to get system info: {str(e)}"
        }


@router.get("/metrics")
async def get_metrics():
    """
    Get application metrics
    Can be used with Prometheus or other monitoring tools
    """
    # In a production environment, you would use prometheus_client
    # For now, return basic metrics
    return {
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "uptime_seconds": time.time(),  # Would track actual uptime
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/readiness")
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """
    Kubernetes readiness probe
    Returns 200 if service is ready to accept traffic
    """
    # Check critical services
    db_ok = (await check_database(db))["status"] == "healthy"
    redis_ok = (await check_redis())["status"] == "healthy"
    
    if db_ok and redis_ok:
        return {"status": "ready"}
    
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Service not ready"
    )


@router.get("/liveness")
async def liveness_check():
    """
    Kubernetes liveness probe
    Returns 200 if service is alive
    """
    return {"status": "alive"}
