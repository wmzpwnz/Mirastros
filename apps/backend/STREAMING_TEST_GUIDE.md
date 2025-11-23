# Streaming Test Guide

This guide explains how to test and optimize SSE streaming across all AI services in Mirastros Universal.

## Overview

The streaming test suite includes four main components:

1. **Comprehensive Service Tests** - Tests streaming across all 15+ AI services
2. **Load Testing** - Tests streaming performance under concurrent load
3. **Nginx Configuration Verification** - Verifies nginx is properly configured for streaming
4. **Latency Optimization** - Tests different Ollama configurations to find optimal parameters

## Prerequisites

### 1. Backend Running

```bash
cd apps/backend
uvicorn app.main:app --reload
```

Verify: `curl http://localhost:8000/api/health`

### 2. Ollama Running

```bash
sudo systemctl start ollama
```

Verify: `curl http://localhost:11434/api/tags`

### 3. Model Loaded

```bash
ollama list | grep mirastros-ai
```

If not present:
```bash
ollama pull qwen2.5:7b-instruct-q4_K_M
ollama create mirastros-ai -f Modelfile
```

## Running Tests

### Quick Start

```bash
cd apps/backend
./run_streaming_tests.sh
```

This will present a menu:
```
1. Comprehensive Service Tests
2. Load Testing
3. Nginx Configuration Verification
4. Latency Optimization
5. Run All Tests
```

### Individual Tests

#### 1. Comprehensive Service Tests

Tests streaming across all AI services (Tarot, Horoscope, Natal Chart, etc.)

```bash
python3 test_streaming_comprehensive.py
```

**What it tests:**
- First token latency for each service
- Quick response marker timing
- Total response time
- Token throughput
- Success rate across services

**Expected results:**
- Quick response: < 1 second
- First token: < 1.5 seconds
- Throughput: > 10 tokens/s
- Success rate: 100%

**Output:**
- Console output with real-time streaming
- JSON report: `streaming_test_report_YYYYMMDD_HHMMSS.json`

#### 2. Load Testing

Tests streaming performance with concurrent users (1, 3, 5, 10 users)

```bash
python3 test_streaming_load.py
```

**What it tests:**
- Performance degradation under load
- Concurrent request handling
- Token delivery consistency
- Error rate under load

**Expected results:**
- First token latency: < 2 seconds (under 10 concurrent users)
- No errors or timeouts
- Consistent throughput across users

**Output:**
- Console output with statistics
- JSON reports: `load_test_report_YYYYMMDD_HHMMSS.json`

#### 3. Nginx Configuration Verification

Verifies nginx is properly configured for SSE streaming

```bash
python3 verify_nginx_streaming.py
```

**What it tests:**
- Direct backend vs through nginx
- Response headers (Content-Type, Cache-Control, X-Accel-Buffering)
- Buffering detection
- Nginx overhead

**Expected results:**
- No buffering detected
- X-Accel-Buffering: no
- Nginx overhead: < 10%

**Output:**
- Console output with configuration checks
- Recommendations for fixes

#### 4. Latency Optimization

Tests different Ollama configurations to find optimal parameters

```bash
python3 optimize_streaming_latency.py
```

**What it tests:**
- Different batch sizes (128, 256, 512, 1024)
- Different thread counts (4, 6, 8, 10, 12)
- Different temperatures (0.5, 0.7, 0.9)
- Different prediction lengths (128, 256, 512)

**Expected results:**
- Identifies best configuration for first token latency
- Identifies best configuration for throughput
- Provides recommendations

**Output:**
- Console output with test results
- Recommended configuration code

## Understanding Results

### Performance Metrics

#### First Token Latency
Time from request to first token received.

- **Excellent**: < 1 second
- **Good**: 1-1.5 seconds
- **Acceptable**: 1.5-2 seconds
- **Poor**: > 2 seconds

#### Quick Response Time
Time to receive quick response marker (first event).

- **Target**: < 1 second
- **Purpose**: Provide early user feedback

#### Total Response Time
Time to complete full response.

- **Short queries**: 2-4 seconds
- **Medium queries**: 4-8 seconds
- **Long queries**: 8-15 seconds

#### Throughput
Tokens generated per second.

- **Excellent**: > 15 tokens/s
- **Good**: 10-15 tokens/s
- **Acceptable**: 5-10 tokens/s
- **Poor**: < 5 tokens/s

### Load Test Metrics

#### Concurrent Users
Number of simultaneous streaming requests.

- **Light load**: 1-3 users
- **Medium load**: 3-5 users
- **Heavy load**: 5-10 users
- **Stress test**: 10+ users

#### Performance Degradation
Increase in latency under load.

- **Excellent**: < 20% increase
- **Good**: 20-40% increase
- **Acceptable**: 40-60% increase
- **Poor**: > 60% increase

## Troubleshooting

### Slow First Token

**Symptoms:**
- First token latency > 2 seconds
- Slow response to user queries

**Possible causes:**
1. Model not loaded in memory
2. Suboptimal Ollama parameters
3. CPU/memory constraints
4. Network latency

**Solutions:**
```bash
# 1. Verify model is loaded
ollama list

# 2. Run latency optimization
python3 optimize_streaming_latency.py

# 3. Check system resources
htop
free -h

# 4. Test direct Ollama
curl http://localhost:11434/api/generate -d '{
  "model": "mirastros-ai",
  "prompt": "Hello",
  "stream": true
}'
```

### Buffering Issues

**Symptoms:**
- Tokens arrive in bursts instead of smoothly
- Large gaps between tokens
- Delayed streaming

**Possible causes:**
1. Nginx buffering enabled
2. Missing X-Accel-Buffering header
3. Client-side buffering

**Solutions:**
```bash
# 1. Verify nginx configuration
python3 verify_nginx_streaming.py

# 2. Check nginx config file
cat /etc/nginx/sites-available/mirastros.conf | grep -A 10 "location /api/chat"

# Should have:
# proxy_buffering off;
# proxy_cache off;
# proxy_set_header X-Accel-Buffering no;

# 3. Restart nginx
sudo systemctl restart nginx
```

### High Error Rate

**Symptoms:**
- Tests failing with errors
- Timeouts
- Connection errors

**Possible causes:**
1. Backend not running
2. Ollama not running
3. Database connection issues
4. Rate limiting

**Solutions:**
```bash
# 1. Check backend
curl http://localhost:8000/api/health

# 2. Check Ollama
curl http://localhost:11434/api/tags

# 3. Check logs
tail -f apps/backend/logs/app.log

# 4. Check database
psql -U mirastros -d mirastros -c "SELECT 1;"
```

### Poor Performance Under Load

**Symptoms:**
- High latency with concurrent users
- Timeouts under load
- Degraded throughput

**Possible causes:**
1. Insufficient CPU/memory
2. Database connection pool exhausted
3. Redis connection issues
4. Ollama model constraints

**Solutions:**
```bash
# 1. Check system resources
htop
free -h
df -h

# 2. Increase database pool size
# Edit apps/backend/app/core/config.py
# DATABASE_POOL_SIZE = 20

# 3. Check Redis
redis-cli ping

# 4. Monitor Ollama
curl http://localhost:11434/api/ps
```

## Optimization Tips

### 1. Ollama Configuration

Based on optimization tests, recommended configuration:

```python
options = {
    "temperature": 0.7,
    "num_predict": 256,
    "num_batch": 512,      # Optimal batch size
    "num_thread": 10,      # Adjust based on CPU cores
    "stop": ["User:", "\n\n"]
}
```

For fast-start mode (simple queries):
```python
options = {
    "temperature": 0.5,    # More focused
    "num_predict": 128,    # Shorter response
    "num_batch": 512,
    "num_thread": 12,      # More threads for speed
}
```

### 2. Nginx Configuration

Optimal nginx configuration for streaming:

```nginx
location /api/chat {
    proxy_pass http://localhost:8000;
    proxy_http_version 1.1;
    
    # Disable buffering (critical!)
    proxy_buffering off;
    proxy_cache off;
    
    # Disable nginx buffering
    proxy_set_header X-Accel-Buffering no;
    
    # SSE connection headers
    proxy_set_header Connection '';
    
    # Long timeout for AI responses
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;
    
    # Standard headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 3. Backend Configuration

Optimal FastAPI streaming response:

```python
return StreamingResponse(
    stream,
    media_type="text/event-stream",
    headers={
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"  # Critical for nginx
    }
)
```

### 4. System Resources

Recommended system resources:

- **CPU**: 4+ cores (8+ recommended)
- **RAM**: 8GB minimum (16GB recommended)
- **Disk**: SSD for model storage
- **Network**: Low latency connection

## Continuous Monitoring

### Daily Health Checks

```bash
# Quick health check
curl http://localhost:8000/api/health
curl http://localhost:11434/api/tags

# Quick streaming test
python3 -c "
import asyncio
import httpx

async def test():
    async with httpx.AsyncClient() as client:
        response = await client.get('http://localhost:8000/api/health')
        print(f'Backend: {response.status_code}')
        
        response = await client.get('http://localhost:11434/api/tags')
        print(f'Ollama: {response.status_code}')

asyncio.run(test())
"
```

### Weekly Performance Tests

```bash
# Run comprehensive tests weekly
./run_streaming_tests.sh
# Select option 5 (Run All Tests)

# Review reports
ls -lh streaming_test_report_*.json load_test_report_*.json
```

### Production Monitoring

Set up monitoring for:

1. **First Token Latency** - Alert if > 2 seconds
2. **Error Rate** - Alert if > 5%
3. **Throughput** - Alert if < 5 tokens/s
4. **Concurrent Users** - Monitor peak usage
5. **System Resources** - CPU, memory, disk

## Performance Targets

### Development Environment

- First token: < 1.5 seconds
- Throughput: > 10 tokens/s
- Success rate: > 95%
- Concurrent users: 5

### Production Environment

- First token: < 1 second
- Throughput: > 15 tokens/s
- Success rate: > 99%
- Concurrent users: 20+

## References

- [Ollama API Documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [FastAPI Streaming](https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse)
- [Server-Sent Events](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [Nginx Proxy Configuration](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)

## Support

For issues or questions:

1. Check logs: `tail -f apps/backend/logs/app.log`
2. Run diagnostics: `./run_streaming_tests.sh`
3. Review documentation: `STREAMING_OPTIMIZATION.md`
4. Check system resources: `htop`, `free -h`

---

**Last Updated**: 2025-11-23
**Version**: 1.0.0
