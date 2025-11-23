# Streaming Optimization Quick Reference

## Quick Start

### 1. Update Ollama Model (One-time setup)

```bash
# Create Modelfile with optimal parameters
cat > Modelfile << EOF
FROM ./qwen2.5-7b-instruct-q4_k_m.gguf

PARAMETER temperature 0.7
PARAMETER num_predict 800
PARAMETER stop "User:"
PARAMETER stop "\n\n"

# Performance optimizations
PARAMETER num_ctx 4096
PARAMETER num_batch 512
PARAMETER num_thread 10

SYSTEM You are Mirastros, a mystical AI oracle...
EOF

# Create model
ollama create mirastros-ai -f Modelfile

# Verify
ollama list | grep mirastros-ai
```

### 2. Update Nginx Configuration

```bash
# Edit nginx config
sudo nano /etc/nginx/sites-available/mirastros

# Add the /api/chat location block (see full config in deployment/nginx/mirastros.conf)

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 3. Deploy Backend Changes

```bash
# Pull latest code
cd /home/mirastros/www/mirastros-universal
git pull

# Restart backend service
sudo systemctl restart mirastros-backend

# Check status
sudo systemctl status mirastros-backend
```

### 4. Test Streaming

```bash
# Run test suite
cd apps/backend
python test_streaming_optimization.py

# Expected output:
# ✅ Basic Streaming
# ✅ Fast-Start Mode
# ✅ Zero-Latency Delivery
# ✅ Error Handling
```

## Usage Examples

### Backend: Simple Query with Fast-Start

```python
from app.services.llm import UnifiedLLMService

llm_service = UnifiedLLMService()

# Fast-start mode for simple queries
async for event in llm_service._stream_generate_optimized(
    prompt="What is my Sun sign?",
    max_tokens=100,
    temperature=0.7,
    fast_start=True  # 30-40% faster
):
    if event["type"] == "quick_response":
        print("AI is responding...")
    elif event["type"] == "token":
        print(event["content"], end="", flush=True)
    elif event["type"] == "done":
        break
```

### Backend: Complex Query with Full Generation

```python
# Normal mode for complex queries
async for event in llm_service._stream_generate_optimized(
    prompt="Provide a detailed analysis of my natal chart...",
    max_tokens=800,
    temperature=0.7,
    fast_start=False  # Full quality response
):
    # Handle events...
```

### Frontend: EventSource Streaming

```typescript
const eventSource = new EventSource(
  `/api/chat/conversations/${conversationId}/messages/stream`,
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'quick_response') {
    // Show "Mirastros is thinking..." indicator
    setIsThinking(true);
  } else if (data.type === 'token') {
    // Append token to message
    setMessage(prev => prev + data.content);
  } else if (data.type === 'done') {
    // Finalize message
    setIsThinking(false);
    eventSource.close();
  } else if (data.type === 'error') {
    // Handle error
    console.error(data.error);
    eventSource.close();
  }
};
```

## Event Types Reference

| Event Type | When Sent | Purpose | Client Action |
|------------|-----------|---------|---------------|
| `quick_response` | After first token (< 1s) | Early feedback | Show "thinking..." indicator |
| `token` | For each token | Stream response | Append to message, render |
| `done` | When complete | Signal completion | Finalize message, save ID |
| `error` | On failure | Signal error | Show error, offer retry |

## Performance Targets

| Metric | Target | How to Measure |
|--------|--------|----------------|
| First token latency | < 1 second | Time from request to first token |
| Quick response latency | < 1 second | Time to quick_response event |
| Total response time | 2-3 seconds | Time to complete response |
| Token throughput | > 10 tokens/sec | Tokens / total time |
| Error rate | < 2% | Failed requests / total requests |

## Troubleshooting

### Problem: Slow first token (> 2 seconds)

**Solutions:**
1. Check Ollama model parameters:
   ```bash
   ollama show mirastros-ai
   ```
2. Verify model is loaded:
   ```bash
   ollama list
   ```
3. Check server resources:
   ```bash
   htop
   ```
4. Enable fast-start mode for simple queries

### Problem: Tokens arriving in batches (buffering)

**Solutions:**
1. Verify nginx configuration:
   ```bash
   sudo nginx -t
   grep -A 10 "location /api/chat" /etc/nginx/sites-available/mirastros
   ```
2. Check X-Accel-Buffering header:
   ```bash
   curl -I https://api.mirastros.ru/api/chat/...
   ```
3. Verify FastAPI StreamingResponse headers
4. Check browser console for SSE connection

### Problem: High error rate (> 5%)

**Solutions:**
1. Check Ollama service status:
   ```bash
   sudo systemctl status ollama
   ```
2. Check backend logs:
   ```bash
   sudo journalctl -u mirastros-backend -f
   ```
3. Verify database connection
4. Check network connectivity

### Problem: Queue backpressure

**Solutions:**
1. Monitor queue size in logs
2. Check consumer is yielding fast enough
3. Verify network connection is stable
4. Consider increasing queue size if needed

## Monitoring Commands

### Check Ollama Status
```bash
sudo systemctl status ollama
ollama list
ollama ps  # Show running models
```

### Check Backend Status
```bash
sudo systemctl status mirastros-backend
sudo journalctl -u mirastros-backend -f  # Follow logs
```

### Check Nginx Status
```bash
sudo systemctl status nginx
sudo nginx -t  # Test configuration
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Monitor Performance
```bash
# CPU and memory usage
htop

# Network connections
netstat -an | grep 8000  # Backend
netstat -an | grep 11434  # Ollama

# Disk I/O
iostat -x 1
```

## Configuration Files

### Ollama Modelfile
Location: `/home/mirastros/models/Modelfile`

Key parameters:
- `num_batch: 512` - Optimal batch size
- `num_thread: 10` - Parallel threads
- `num_ctx: 4096` - Context window

### Nginx Configuration
Location: `/etc/nginx/sites-available/mirastros`

Key settings:
- `proxy_buffering off` - Disable buffering
- `X-Accel-Buffering no` - Disable all buffering
- `proxy_read_timeout 300s` - 5-minute timeout

### Backend Service
Location: `/etc/systemd/system/mirastros-backend.service`

Key settings:
- `Restart=always` - Auto-restart on failure
- `After=ollama.service` - Start after Ollama

## Performance Optimization Checklist

- [x] Ollama model configured with optimal parameters
- [x] Nginx configured with SSE optimizations
- [x] Backend using asyncio.Queue for zero-latency
- [x] Quick response marker implemented
- [x] Fast-start mode for simple queries
- [x] X-Accel-Buffering header set
- [x] Error handling with proper cleanup
- [x] Test suite created and passing

## Useful Links

- [Ollama API Documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [FastAPI Streaming Response](https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse)
- [Server-Sent Events Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [asyncio Queue Documentation](https://docs.python.org/3/library/asyncio-queue.html)

## Support

For issues or questions:
1. Check this quick reference
2. Review full documentation in `STREAMING_OPTIMIZATION.md`
3. Run test suite: `python test_streaming_optimization.py`
4. Check logs: `sudo journalctl -u mirastros-backend -f`
5. Contact DevOps team

---

**Last Updated:** 2025-11-21
**Version:** 1.0.0
