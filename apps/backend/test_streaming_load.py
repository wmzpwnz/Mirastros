#!/usr/bin/env python3
"""
Streaming Load Test
Tests streaming performance under concurrent load
"""

import asyncio
import httpx
import json
import time
from typing import List, Dict, Any
from datetime import datetime
import statistics

BASE_URL = "http://localhost:8000"
TEST_USER_EMAIL = "loadtest@mirastros.com"
TEST_USER_PASSWORD = "LoadTest123!"

class LoadTestRunner:
    def __init__(self, concurrent_users: int = 5):
        self.concurrent_users = concurrent_users
        self.token = None
        self.results: List[Dict[str, Any]] = []
        
    async def setup(self):
        """Setup test user"""
        print(f"🔧 Setting up load test with {self.concurrent_users} concurrent users...")
        
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
                        "full_name": "Load Test User",
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
    
    async def simulate_user(self, user_id: int) -> Dict[str, Any]:
        """Simulate a single user streaming request"""
        metrics = {
            "user_id": user_id,
            "first_token_time": None,
            "total_time": None,
            "token_count": 0,
            "success": False,
            "error": None
        }
        
        start_time = time.time()
        first_token_time = None
        
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                # Create conversation
                conv_response = await client.post(
                    f"{BASE_URL}/api/chat/conversations",
                    headers={"Authorization": f"Bearer {self.token}"},
                    json={
                        "title": f"Load Test User {user_id}",
                        "context_type": "general"
                    }
                )
                
                if conv_response.status_code != 200:
                    metrics["error"] = f"Failed to create conversation: {conv_response.status_code}"
                    metrics["total_time"] = time.time() - start_time
                    return metrics
                
                conversation_id = conv_response.json()["id"]
                
                # Stream message
                async with client.stream(
                    "POST",
                    f"{BASE_URL}/api/chat/conversations/{conversation_id}/messages/stream",
                    headers={"Authorization": f"Bearer {self.token}"},
                    json={
                        "message": f"Tell me about my astrological chart (User {user_id})",
                        "context": "Sun: Aries, Moon: Cancer"
                    }
                ) as response:
                    if response.status_code != 200:
                        metrics["error"] = f"Stream failed: {response.status_code}"
                        metrics["total_time"] = time.time() - start_time
                        return metrics
                    
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data_str = line[6:]
                            
                            if data_str == "[DONE]":
                                break
                            
                            try:
                                event = json.loads(data_str)
                                event_type = event.get("type")
                                
                                if event_type == "token":
                                    if first_token_time is None:
                                        first_token_time = time.time() - start_time
                                        metrics["first_token_time"] = first_token_time
                                    
                                    metrics["token_count"] += 1
                                
                                elif event_type == "done":
                                    metrics["success"] = True
                            
                            except json.JSONDecodeError:
                                continue
                
                metrics["total_time"] = time.time() - start_time
                
        except Exception as e:
            metrics["error"] = str(e)
            metrics["total_time"] = time.time() - start_time
        
        return metrics
    
    async def run_load_test(self):
        """Run load test with concurrent users"""
        print(f"\n🚀 Starting load test with {self.concurrent_users} concurrent users...")
        print("="*60)
        
        start_time = time.time()
        
        # Create tasks for concurrent users
        tasks = [
            self.simulate_user(i + 1)
            for i in range(self.concurrent_users)
        ]
        
        # Run all tasks concurrently
        self.results = await asyncio.gather(*tasks)
        
        total_time = time.time() - start_time
        
        # Generate report
        self.generate_load_report(total_time)
    
    def generate_load_report(self, total_time: float):
        """Generate load test report"""
        print("\n" + "="*60)
        print("📊 LOAD TEST REPORT")
        print("="*60)
        
        successful = [r for r in self.results if r["success"]]
        failed = [r for r in self.results if not r["success"]]
        
        print(f"\n✅ Successful: {len(successful)}/{len(self.results)}")
        print(f"❌ Failed: {len(failed)}/{len(self.results)}")
        print(f"⏱️  Total Test Time: {total_time:.2f}s")
        
        if successful:
            # Calculate statistics
            first_token_times = [r["first_token_time"] for r in successful if r["first_token_time"]]
            total_times = [r["total_time"] for r in successful]
            token_counts = [r["token_count"] for r in successful]
            
            if first_token_times:
                print("\n📈 First Token Latency:")
                print(f"  Min: {min(first_token_times):.3f}s")
                print(f"  Max: {max(first_token_times):.3f}s")
                print(f"  Mean: {statistics.mean(first_token_times):.3f}s")
                print(f"  Median: {statistics.median(first_token_times):.3f}s")
                if len(first_token_times) > 1:
                    print(f"  StdDev: {statistics.stdev(first_token_times):.3f}s")
            
            print("\n📈 Total Response Time:")
            print(f"  Min: {min(total_times):.3f}s")
            print(f"  Max: {max(total_times):.3f}s")
            print(f"  Mean: {statistics.mean(total_times):.3f}s")
            print(f"  Median: {statistics.median(total_times):.3f}s")
            if len(total_times) > 1:
                print(f"  StdDev: {statistics.stdev(total_times):.3f}s")
            
            print("\n📈 Token Count:")
            print(f"  Min: {min(token_counts)}")
            print(f"  Max: {max(token_counts)}")
            print(f"  Mean: {statistics.mean(token_counts):.1f}")
            print(f"  Median: {statistics.median(token_counts):.1f}")
            
            # Throughput
            avg_throughput = sum(r["token_count"] / r["total_time"] for r in successful) / len(successful)
            print(f"\n📈 Average Throughput: {avg_throughput:.2f} tokens/s")
            
            # Requests per second
            rps = len(successful) / total_time
            print(f"📈 Requests per Second: {rps:.2f} req/s")
            
            # Performance under load
            print("\n🎯 Performance Under Load:")
            first_token_degradation = statistics.mean(first_token_times) if first_token_times else 0
            print(f"  First Token Latency: {first_token_degradation:.3f}s")
            
            if first_token_degradation < 2.0:
                print(f"  ✅ EXCELLENT - Low latency under load")
            elif first_token_degradation < 3.0:
                print(f"  ⚠️  ACCEPTABLE - Moderate latency under load")
            else:
                print(f"  ❌ POOR - High latency under load")
        
        if failed:
            print("\n❌ Failed Requests:")
            for result in failed:
                print(f"  User {result['user_id']}: {result['error']}")
        
        # Save report
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f"load_test_report_{timestamp}.json"
        
        with open(report_file, "w") as f:
            json.dump({
                "timestamp": timestamp,
                "concurrent_users": self.concurrent_users,
                "total_time": total_time,
                "successful": len(successful),
                "failed": len(failed),
                "results": self.results
            }, f, indent=2)
        
        print(f"\n💾 Report saved to: {report_file}")
        print("\n" + "="*60)

async def main():
    """Run load tests with different concurrency levels"""
    concurrency_levels = [1, 3, 5, 10]
    
    print("="*60)
    print("🔥 STREAMING LOAD TEST SUITE")
    print("="*60)
    
    for level in concurrency_levels:
        runner = LoadTestRunner(concurrent_users=level)
        await runner.setup()
        
        if not runner.token:
            print(f"❌ Failed to authenticate for {level} users")
            continue
        
        await runner.run_load_test()
        
        # Pause between tests
        if level != concurrency_levels[-1]:
            print(f"\n⏸️  Pausing 5 seconds before next test...")
            await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(main())
