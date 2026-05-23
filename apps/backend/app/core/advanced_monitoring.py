"""
Advanced monitoring and observability system
"""
import time
import asyncio
import logging
from typing import Dict, Any, Optional, Callable
from functools import wraps
from dataclasses import dataclass
from datetime import datetime, timezone
import psutil
import sentry_sdk
from prometheus_client import Counter, Histogram, Gauge, generate_latest

# Metrics definitions
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration', ['method', 'endpoint'])
ACTIVE_CONNECTIONS = Gauge('active_connections', 'Number of active connections')
MEMORY_USAGE = Gauge('memory_usage_bytes', 'Memory usage in bytes')
CPU_USAGE = Gauge('cpu_usage_percent', 'CPU usage percentage')
DATABASE_CONNECTIONS = Gauge('database_connections', 'Active database connections')

@dataclass
class PerformanceMetrics:
    timestamp: datetime
    response_time: float
    memory_usage: float
    cpu_usage: float
    active_connections: int
    error_count: int

class MetricsCollector:
    """Collects and exports application metrics"""
    
    def __init__(self):
        self.metrics_history = []
        self.start_time = time.time()
    
    def collect_system_metrics(self) -> Dict[str, Any]:
        """Collect system-level metrics"""
        return {
            'timestamp': datetime.now(timezone.utc),
            'cpu_percent': psutil.cpu_percent(interval=1),
            'memory_percent': psutil.virtual_memory().percent,
            'memory_used': psutil.virtual_memory().used,
            'disk_usage': psutil.disk_usage('/').percent,
            'network_io': psutil.net_io_counters()._asdict()
        }
    
    def record_request(self, method: str, endpoint: str, status: int, duration: float):
        """Record HTTP request metrics"""
        REQUEST_COUNT.labels(method=method, endpoint=endpoint, status=status).inc()
        REQUEST_DURATION.labels(method=method, endpoint=endpoint).observe(duration)
    
    def update_active_connections(self, count: int):
        """Update active connections gauge"""
        ACTIVE_CONNECTIONS.set(count)
    
    def update_resource_usage(self):
        """Update system resource gauges"""
        MEMORY_USAGE.set(psutil.virtual_memory().used)
        CPU_USAGE.set(psutil.cpu_percent())
    
    def get_metrics_summary(self) -> Dict[str, Any]:
        """Get current metrics summary"""
        system_metrics = self.collect_system_metrics()
        return {
            'system': system_metrics,
            'application': {
                'uptime_seconds': time.time() - self.start_time,
                'request_count': sum(sample.value for sample in REQUEST_COUNT.collect()[0].samples),
                'avg_response_time': self._calculate_avg_response_time()
            }
        }
    
    def _calculate_avg_response_time(self) -> float:
        """Calculate average response time from histogram"""
        try:
            samples = REQUEST_DURATION.collect()[0].samples
            if samples:
                return sum(s.value * s.weight for s in samples) / sum(s.weight for s in samples)
            return 0.0
        except:
            return 0.0

class Tracer:
    """Distributed tracing implementation"""
    
    def __init__(self):
        self.active_traces = {}
    
    def start_trace(self, trace_id: str, operation: str) -> Dict[str, Any]:
        """Start a new trace"""
        trace_data = {
            'trace_id': trace_id,
            'operation': operation,
            'start_time': time.time(),
            'spans': []
        }
        self.active_traces[trace_id] = trace_data
        return trace_data
    
    def add_span(self, trace_id: str, span_name: str, duration: float, metadata: Dict = None):
        """Add a span to existing trace"""
        if trace_id in self.active_traces:
            span = {
                'name': span_name,
                'duration': duration,
                'timestamp': time.time(),
                'metadata': metadata or {}
            }
            self.active_traces[trace_id]['spans'].append(span)
    
    def end_trace(self, trace_id: str) -> Optional[Dict[str, Any]]:
        """End trace and return trace data"""
        if trace_id in self.active_traces:
            trace_data = self.active_traces[trace_id]
            trace_data['end_time'] = time.time()
            trace_data['total_duration'] = trace_data['end_time'] - trace_data['start_time']
            del self.active_traces[trace_id]
            return trace_data
        return None

class HealthChecker:
    """Application health monitoring"""
    
    def __init__(self):
        self.checks = {}
        self.last_check_results = {}
    
    def register_check(self, name: str, check_func: Callable):
        """Register a health check function"""
        self.checks[name] = check_func
    
    async def run_health_checks(self) -> Dict[str, Any]:
        """Run all registered health checks"""
        results = {}
        for name, check_func in self.checks.items():
            try:
                result = await check_func()
                results[name] = {
                    'status': 'healthy' if result else 'unhealthy',
                    'timestamp': datetime.now(timezone.utc).isoformat()
                }
            except Exception as e:
                results[name] = {
                    'status': 'error',
                    'error': str(e),
                    'timestamp': datetime.now(timezone.utc).isoformat()
                }
        
        self.last_check_results = results
        return results
    
    def get_health_status(self) -> str:
        """Get overall health status"""
        if not self.last_check_results:
            return 'unknown'
        
        unhealthy_checks = [
            name for name, result in self.last_check_results.items()
            if result['status'] != 'healthy'
        ]
        
        if not unhealthy_checks:
            return 'healthy'
        elif len(unhealthy_checks) < len(self.checks) // 2:
            return 'degraded'
        else:
            return 'unhealthy'

# Global instances
metrics_collector = MetricsCollector()
tracer = Tracer()
health_checker = HealthChecker()

def monitor_performance(func):
    """Decorator to monitor function performance"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        trace_id = f"{func.__name__}_{int(start_time * 1000000)}"
        
        # Start tracing
        tracer.start_trace(trace_id, func.__name__)
        
        try:
            result = await func(*args, **kwargs)
            
            # Record metrics
            duration = time.time() - start_time
            metrics_collector.record_request(
                method=getattr(args[0], 'method', 'UNKNOWN') if args else 'FUNCTION',
                endpoint=func.__name__,
                status=200,
                duration=duration
            )
            
            tracer.add_span(trace_id, 'execution', duration)
            return result
            
        except Exception as e:
            # Record error
            duration = time.time() - start_time
            metrics_collector.record_request(
                method=getattr(args[0], 'method', 'UNKNOWN') if args else 'FUNCTION',
                endpoint=func.__name__,
                status=500,
                duration=duration
            )
            
            tracer.add_span(trace_id, 'error', duration, {'error': str(e)})
            raise
        finally:
            # End trace
            trace_data = tracer.end_trace(trace_id)
            if trace_data and trace_data['total_duration'] > 1.0:  # Log slow traces
                logging.warning(f"Slow operation detected: {trace_data}")
    
    return wrapper

# Health check functions
async def check_database_connection():
    """Check database connectivity"""
    # Implementation would check actual DB connection
    return True

async def check_redis_connection():
    """Check Redis connectivity"""
    # Implementation would check actual Redis connection
    return True

async def check_external_services():
    """Check external service availability"""
    # Implementation would check AI services, payment gateways, etc.
    return True

# Register health checks
health_checker.register_check('database', check_database_connection)
health_checker.register_check('redis', check_redis_connection)
health_checker.register_check('external_services', check_external_services)

# Export metrics endpoint
def get_metrics():
    """Return Prometheus metrics"""
    metrics_collector.update_resource_usage()
    return generate_latest()