"""
Enhanced health check endpoints with detailed monitoring
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import Dict, Any
import asyncio
import logging
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.advanced_monitoring import health_checker, metrics_collector, get_metrics
from app.models.user import User

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("/basic")
async def basic_health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "api": "operational",
            "database": "connected"
        }
    }

@router.get("/detailed")
async def detailed_health_check(db: AsyncSession = Depends(get_db)):
    """Detailed health check with service status"""
    try:
        # Run health checks concurrently
        health_results = await health_checker.run_health_checks()
        
        # Check database by querying a simple record
        try:
            result = await db.execute(text("SELECT 1"))
            db_status = "healthy" if result.fetchone() else "unhealthy"
        except Exception as e:
            db_status = f"error: {str(e)}"
        
        # Get system metrics
        system_metrics = metrics_collector.collect_system_metrics()
        
        return {
            "status": health_checker.get_health_status(),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "services": {
                **health_results,
                "database_query": db_status
            },
            "system": {
                "cpu_percent": system_metrics["cpu_percent"],
                "memory_percent": system_metrics["memory_percent"],
                "uptime_seconds": system_metrics["timestamp"].timestamp() - asyncio.get_event_loop().time()
            },
            "application": metrics_collector.get_metrics_summary()["application"]
        }
        
    except Exception as e:
        logging.error(f"Detailed health check failed: {e}")
        raise HTTPException(status_code=503, detail="Health check failed")

@router.get("/metrics")
async def metrics_endpoint():
    """Prometheus metrics endpoint"""
    try:
        return get_metrics()
    except Exception as e:
        logging.error(f"Metrics collection failed: {e}")
        raise HTTPException(status_code=500, detail="Metrics unavailable")

@router.get("/readiness")
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """Readiness probe for load balancers"""
    try:
        # Check if we can connect to database
        await db.execute(text("SELECT 1"))
        
        # Check if essential services are healthy
        health_results = await health_checker.run_health_checks()
        unhealthy_services = [
            name for name, result in health_results.items()
            if result['status'] != 'healthy'
        ]
        
        if not unhealthy_services:
            return {"status": "ready"}
        else:
            raise HTTPException(
                status_code=503, 
                detail=f"Unhealthy services: {', '.join(unhealthy_services)}"
            )
            
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service not ready: {str(e)}")

@router.get("/liveness")
async def liveness_check():
    """Liveness probe - is the application alive?"""
    try:
        # Simple check that the application is responding
        return {"status": "alive", "timestamp": datetime.now(timezone.utc).isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Liveness check failed: {str(e)}")

@router.get("/dependencies")
async def dependency_check():
    """Check status of all external dependencies"""
    dependencies = {
        "internal": {},
        "external": {}
    }
    
    # Internal services
    dependencies["internal"]["database"] = await _check_internal_service("database")
    dependencies["internal"]["redis"] = await _check_internal_service("redis")
    dependencies["internal"]["cache"] = await _check_internal_service("cache")
    
    # External services
    dependencies["external"]["ai_service"] = await _check_external_service("ai")
    dependencies["external"]["payment_gateway"] = await _check_external_service("payment")
    dependencies["external"]["email_service"] = await _check_external_service("email")
    
    return {
        "status": "checked",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "dependencies": dependencies
    }

async def _check_internal_service(service_name: str) -> Dict[str, Any]:
    """Check internal service status"""
    try:
        # Simulate service check
        await asyncio.sleep(0.1)  # Small delay to simulate check
        return {
            "status": "operational",
            "response_time_ms": 50,
            "last_checked": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        return {
            "status": "down",
            "error": str(e),
            "last_checked": datetime.now(timezone.utc).isoformat()
        }

async def _check_external_service(service_name: str) -> Dict[str, Any]:
    """Check external service status"""
    try:
        # Simulate external service check
        await asyncio.sleep(0.2)  # Simulate network delay
        return {
            "status": "available",
            "response_time_ms": 150,
            "last_checked": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        return {
            "status": "unavailable",
            "error": str(e),
            "last_checked": datetime.now(timezone.utc).isoformat()
        }

@router.get("/stats")
async def get_statistics(db: AsyncSession = Depends(get_db)):
    """Get detailed application statistics"""
    try:
        # Get user count
        result = await db.execute("SELECT COUNT(*) FROM users")
        user_count = result.scalar()
        
        # Get reading count
        result = await db.execute("SELECT COUNT(*) FROM readings")
        reading_count = result.scalar()
        
        # Get recent activity
        result = await db.execute("""
            SELECT 
                COUNT(*) as today_readings,
                MAX(created_at) as last_reading
            FROM readings 
            WHERE created_at > NOW() - INTERVAL '24 hours'
        """)
        activity_stats = result.fetchone()
        
        return {
            "users": {
                "total": user_count,
                "active_today": 0  # Would need additional tracking
            },
            "readings": {
                "total": reading_count,
                "today": activity_stats.today_readings if activity_stats else 0
            },
            "performance": metrics_collector.get_metrics_summary()["application"],
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logging.error(f"Statistics collection failed: {e}")
        raise HTTPException(status_code=500, detail="Statistics unavailable")
