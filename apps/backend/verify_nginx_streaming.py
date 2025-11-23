#!/usr/bin/env python3
"""
Nginx Streaming Configuration Verification
Verifies that nginx is properly configured for SSE streaming
"""

import asyncio
import httpx
import json
import time
from typing import Dict, Any

BASE_URL = "http://localhost:8000"  # Direct backend
NGINX_URL = "https://www.mirastros.com"  # Through nginx
TEST_USER_EMAIL = "nginx_test@mirastros.com"
TEST_USER_PASSWORD = "NginxTest123!"

class NginxStreamingVerifier:
    def __init__(self):
        self.token = None
        
    async def setup(self):
        """Setup test user"""
        print("🔧 Setting up nginx verification test...")
        
        async with httpx.AsyncClient() as client:
            # Try login
            try:
                response = await client.post(
                    f"{BASE_URL}/api/auth/login",
                    json={
                        "email": TEST_USER_EMAIL,
                        "password": TEST_USER_PASSWORD
                    }
                )
                
                if response.status_code == 200:
                    self.token = response.json()["access_token"]
                    print(f"✅ Logged in")
                    return
            except:
                pass
            
            # Register
            try:
                response = await client.post(
                    f"{BASE_URL}/api/auth/register",
                    json={
                        "email": TEST_USER_EMAIL,
                        "password": TEST_USER_PASSWORD,
                        "full_name": "Nginx Test User",
                        "birth_date": "1990-01-01",
                        "birth_time": "12:00",
                        "birth_place": "New York, USA",
                        "timezone": "America/New_York"
                    }
                )
                
                if response.status_code == 200:
                    self.token = response.json()["access_token"]
                    print(f"✅ Registered")
            except Exception as e:
                print(f"❌ Setup failed: {e}")
    
    async def test_streaming(self, url: str, name: str) -> Dict[str, Any]:
        """Test streaming through a specific URL"""
        print(f"\n📡 Testing streaming through {name}...")
        print(f"   URL: {url}")
        
        metrics = {
            "name": name,
            "url": url,
            "first_token_time": None,
            "token_count": 0,
            "buffering_detected": False,
            "headers": {},
            "success": False,
            "error": None
        }
        
        start_time = time.time()
        first_token_time = None
        last_token_time = None
        token_times = []
        
        try:
            async with httpx.AsyncClient(timeout=300.0, verify=False) as client:
                # Create conversation
                conv_response = await client.post(
                    f"{url}/api/chat/conversations",
                    headers={"Authorization": f"Bearer {self.token}"},
                    json={
                        "title": f"Nginx Test {name}",
                        "context_type": "general"
                    }
                )
                
                if conv_response.status_code != 200:
                    metrics["error"] = f"Failed to create conversation: {conv_response.status_code}"
                    return metrics
                
                conversation_id = conv_response.json()["id"]
                
                # Stream message
                async with client.stream(
                    "POST",
                    f"{url}/api/chat/conversations/{conversation_id}/messages/stream",
                    headers={"Authorization": f"Bearer {self.token}"},
                    json={
                        "message": "Tell me about astrology in one sentence.",
                        "context": ""
                    }
                ) as response:
                    # Capture response headers
                    metrics["headers"] = dict(response.headers)
                    
                    if response.status_code != 200:
                        metrics["error"] = f"Stream failed: {response.status_code}"
                        return metrics
                    
                    print(f"   Response headers:")
                    for key, value in response.headers.items():
                        if key.lower() in ['content-type', 'cache-control', 'connection', 'x-accel-buffering']:
                            print(f"     {key}: {value}")
                    
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            current_time = time.time()
                            data_str = line[6:]
                            
                            if data_str == "[DONE]":
                                break
                            
                            try:
                                event = json.loads(data_str)
                                event_type = event.get("type")
                                
                                if event_type == "token":
                                    if first_token_time is None:
                                        first_token_time = current_time - start_time
                                        metrics["first_token_time"] = first_token_time
                                        print(f"   🎯 First token: {first_token_time:.3f}s")
                                    
                                    # Track token timing
                                    if last_token_time is not None:
                                        token_gap = current_time - last_token_time
                                        token_times.append(token_gap)
                                    
                                    last_token_time = current_time
                                    metrics["token_count"] += 1
                                    print(".", end="", flush=True)
                                
                                elif event_type == "done":
                                    metrics["success"] = True
                                    print()  # New line
                            
                            except json.JSONDecodeError:
                                continue
                
                # Analyze token timing for buffering
                if len(token_times) > 5:
                    # Check for large gaps that indicate buffering
                    max_gap = max(token_times)
                    avg_gap = sum(token_times) / len(token_times)
                    
                    # If max gap is more than 3x average, buffering is likely
                    if max_gap > avg_gap * 3 and max_gap > 0.5:
                        metrics["buffering_detected"] = True
                        print(f"   ⚠️  Buffering detected: max gap {max_gap:.3f}s vs avg {avg_gap:.3f}s")
                    else:
                        print(f"   ✅ No buffering: max gap {max_gap:.3f}s, avg {avg_gap:.3f}s")
                
                if metrics["success"]:
                    print(f"   ✅ Complete: {metrics['token_count']} tokens")
                
        except Exception as e:
            metrics["error"] = str(e)
            print(f"   ❌ Exception: {e}")
        
        return metrics
    
    async def verify_configuration(self):
        """Verify nginx configuration"""
        print("\n" + "="*60)
        print("🔍 NGINX STREAMING CONFIGURATION VERIFICATION")
        print("="*60)
        
        # Test direct backend
        direct_result = await self.test_streaming(BASE_URL, "Direct Backend")
        
        # Test through nginx (if available)
        nginx_result = None
        try:
            async with httpx.AsyncClient(timeout=5.0, verify=False) as client:
                response = await client.get(f"{NGINX_URL}/api/health")
                if response.status_code == 200:
                    nginx_result = await self.test_streaming(NGINX_URL, "Through Nginx")
        except:
            print(f"\n⚠️  Nginx not available at {NGINX_URL}")
        
        # Generate report
        self.generate_verification_report(direct_result, nginx_result)
    
    def generate_verification_report(self, direct: Dict[str, Any], nginx: Dict[str, Any] = None):
        """Generate verification report"""
        print("\n" + "="*60)
        print("📊 VERIFICATION REPORT")
        print("="*60)
        
        # Direct backend results
        print("\n🔗 Direct Backend:")
        if direct["success"]:
            print(f"  ✅ Streaming works")
            print(f"  First token: {direct['first_token_time']:.3f}s")
            print(f"  Tokens: {direct['token_count']}")
            print(f"  Buffering: {'❌ Detected' if direct['buffering_detected'] else '✅ None'}")
        else:
            print(f"  ❌ Failed: {direct['error']}")
        
        # Nginx results
        if nginx:
            print("\n🌐 Through Nginx:")
            if nginx["success"]:
                print(f"  ✅ Streaming works")
                print(f"  First token: {nginx['first_token_time']:.3f}s")
                print(f"  Tokens: {nginx['token_count']}")
                print(f"  Buffering: {'❌ Detected' if nginx['buffering_detected'] else '✅ None'}")
                
                # Compare performance
                if direct["success"]:
                    latency_increase = nginx["first_token_time"] - direct["first_token_time"]
                    latency_percent = (latency_increase / direct["first_token_time"]) * 100
                    
                    print(f"\n📊 Nginx Overhead:")
                    print(f"  Latency increase: {latency_increase:.3f}s ({latency_percent:.1f}%)")
                    
                    if latency_percent < 10:
                        print(f"  ✅ EXCELLENT - Minimal overhead")
                    elif latency_percent < 25:
                        print(f"  ⚠️  ACCEPTABLE - Moderate overhead")
                    else:
                        print(f"  ❌ POOR - High overhead")
            else:
                print(f"  ❌ Failed: {nginx['error']}")
        
        # Configuration checks
        print("\n🔧 Configuration Checks:")
        
        if nginx and nginx["success"]:
            headers = nginx["headers"]
            
            # Check Content-Type
            content_type = headers.get("content-type", "")
            if "text/event-stream" in content_type:
                print(f"  ✅ Content-Type: {content_type}")
            else:
                print(f"  ❌ Content-Type: {content_type} (should be text/event-stream)")
            
            # Check Cache-Control
            cache_control = headers.get("cache-control", "")
            if "no-cache" in cache_control:
                print(f"  ✅ Cache-Control: {cache_control}")
            else:
                print(f"  ⚠️  Cache-Control: {cache_control} (should include no-cache)")
            
            # Check X-Accel-Buffering
            x_accel = headers.get("x-accel-buffering", "")
            if x_accel.lower() == "no":
                print(f"  ✅ X-Accel-Buffering: {x_accel}")
            else:
                print(f"  ❌ X-Accel-Buffering: {x_accel} (should be 'no')")
            
            # Check buffering
            if not nginx["buffering_detected"]:
                print(f"  ✅ No buffering detected")
            else:
                print(f"  ❌ Buffering detected - check nginx proxy_buffering")
        
        # Recommendations
        print("\n💡 Recommendations:")
        
        if nginx and nginx["buffering_detected"]:
            print("  ⚠️  Buffering detected in nginx. Verify configuration:")
            print("     - proxy_buffering off;")
            print("     - proxy_cache off;")
            print("     - proxy_set_header X-Accel-Buffering no;")
        
        if nginx and nginx.get("headers", {}).get("x-accel-buffering", "").lower() != "no":
            print("  ⚠️  X-Accel-Buffering header not set to 'no'")
            print("     Add to backend response headers:")
            print("     headers={'X-Accel-Buffering': 'no'}")
        
        if not nginx:
            print("  ℹ️  Nginx not tested - ensure it's running and accessible")
        
        print("\n" + "="*60)

async def main():
    """Run nginx verification"""
    verifier = NginxStreamingVerifier()
    await verifier.setup()
    
    if not verifier.token:
        print("❌ Failed to authenticate")
        return
    
    await verifier.verify_configuration()

if __name__ == "__main__":
    asyncio.run(main())
