#!/usr/bin/env python3
"""
Comprehensive Streaming Test Suite
Tests SSE streaming across all AI services with performance metrics
"""

import asyncio
import httpx
import json
import time
from typing import Dict, List, Any
from datetime import datetime

# Test configuration
BASE_URL = "http://localhost:8000"
TEST_USER_EMAIL = "test@mirastros.com"
TEST_USER_PASSWORD = "TestPassword123!"

class StreamingTestSuite:
    def __init__(self):
        self.token = None
        self.results: List[Dict[str, Any]] = []
        
    async def setup(self):
        """Setup test user and authentication"""
        print("🔧 Setting up test environment...")
        
        async with httpx.AsyncClient() as client:
            # Try to login first
            try:
                response = await client.post(
                    f"{BASE_URL}/api/auth/login",
                    json={
                        "email": TEST_USER_EMAIL,
                        "password": TEST_USER_PASSWORD
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    self.token = data["access_token"]
                    print(f"✅ Logged in as {TEST_USER_EMAIL}")
                    return
            except:
                pass
            
            # Register if login failed
            try:
                response = await client.post(
                    f"{BASE_URL}/api/auth/register",
                    json={
                        "email": TEST_USER_EMAIL,
                        "password": TEST_USER_PASSWORD,
                        "full_name": "Test User",
                        "birth_date": "1990-01-01",
                        "birth_time": "12:00",
                        "birth_place": "New York, USA",
                        "timezone": "America/New_York"
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    self.token = data["access_token"]
                    print(f"✅ Registered and logged in as {TEST_USER_EMAIL}")
                else:
                    print(f"❌ Failed to register: {response.status_code}")
                    print(response.text)
            except Exception as e:
                print(f"❌ Setup failed: {e}")
    
    async def test_chat_streaming(self, service_name: str, prompt: str, context: str = "") -> Dict[str, Any]:
        """Test streaming for a specific service"""
        print(f"\n📡 Testing {service_name} streaming...")
        
        metrics = {
            "service": service_name,
            "prompt": prompt,
            "first_token_time": None,
            "quick_response_time": None,
            "total_time": None,
            "token_count": 0,
            "tokens": [],
            "success": False,
            "error": None
        }
        
        start_time = time.time()
        first_token_time = None
        quick_response_time = None
        
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                # Create conversation
                conv_response = await client.post(
                    f"{BASE_URL}/api/chat/conversations",
                    headers={"Authorization": f"Bearer {self.token}"},
                    json={
                        "title": f"Test {service_name}",
                        "context_type": service_name.lower().replace(" ", "_")
                    }
                )
                
                if conv_response.status_code != 200:
                    metrics["error"] = f"Failed to create conversation: {conv_response.status_code}"
                    return metrics
                
                conversation_id = conv_response.json()["id"]
                
                # Stream message
                async with client.stream(
                    "POST",
                    f"{BASE_URL}/api/chat/conversations/{conversation_id}/messages/stream",
                    headers={"Authorization": f"Bearer {self.token}"},
                    json={
                        "message": prompt,
                        "context": context
                    }
                ) as response:
                    if response.status_code != 200:
                        metrics["error"] = f"Stream failed: {response.status_code}"
                        return metrics
                    
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data_str = line[6:]  # Remove "data: " prefix
                            
                            if data_str == "[DONE]":
                                break
                            
                            try:
                                event = json.loads(data_str)
                                event_type = event.get("type")
                                
                                if event_type == "quick_response":
                                    quick_response_time = time.time() - start_time
                                    metrics["quick_response_time"] = quick_response_time
                                    print(f"  ⚡ Quick response: {quick_response_time:.3f}s")
                                
                                elif event_type == "token":
                                    if first_token_time is None:
                                        first_token_time = time.time() - start_time
                                        metrics["first_token_time"] = first_token_time
                                        print(f"  🎯 First token: {first_token_time:.3f}s")
                                    
                                    token = event.get("content", "")
                                    metrics["tokens"].append(token)
                                    metrics["token_count"] += 1
                                    print(token, end="", flush=True)
                                
                                elif event_type == "done":
                                    metrics["success"] = True
                                    print()  # New line after streaming
                                
                                elif event_type == "error":
                                    metrics["error"] = event.get("error")
                                    print(f"\n  ❌ Error: {metrics['error']}")
                            
                            except json.JSONDecodeError:
                                continue
                
                metrics["total_time"] = time.time() - start_time
                
                if metrics["success"]:
                    throughput = metrics["token_count"] / metrics["total_time"]
                    print(f"  ✅ Complete: {metrics['total_time']:.3f}s")
                    print(f"  📊 Tokens: {metrics['token_count']}, Throughput: {throughput:.2f} tokens/s")
                
        except Exception as e:
            metrics["error"] = str(e)
            metrics["total_time"] = time.time() - start_time
            print(f"  ❌ Exception: {e}")
        
        return metrics
    
    async def test_all_services(self):
        """Test streaming across all AI services"""
        print("\n" + "="*60)
        print("🚀 COMPREHENSIVE STREAMING TEST SUITE")
        print("="*60)
        
        # Test cases for different services
        test_cases = [
            {
                "service": "Tarot",
                "prompt": "What does the Three of Cups mean in my reading?",
                "context": "Reading: Three of Cups (upright), The Lovers (upright), Ten of Pentacles (upright)"
            },
            {
                "service": "Horoscope",
                "prompt": "What should I focus on today?",
                "context": "Sun sign: Aries, Moon sign: Cancer"
            },
            {
                "service": "Natal Chart",
                "prompt": "What does my Sun in Aries mean?",
                "context": "Sun: Aries, Moon: Cancer, Rising: Leo"
            },
            {
                "service": "Numerology",
                "prompt": "What does my Life Path number 7 mean?",
                "context": "Life Path: 7, Destiny: 3, Soul Urge: 5"
            },
            {
                "service": "Dream",
                "prompt": "I dreamed about flying over the ocean. What does it mean?",
                "context": "Dream symbols: flying, ocean, freedom"
            },
            {
                "service": "Runes",
                "prompt": "What does Fehu mean in my reading?",
                "context": "Runes drawn: Fehu, Ansuz, Wunjo"
            },
            {
                "service": "I Ching",
                "prompt": "What guidance does hexagram 1 offer?",
                "context": "Hexagram: 1 (The Creative)"
            },
            {
                "service": "Lenormand",
                "prompt": "What do the Clover and Heart cards mean together?",
                "context": "Cards: Clover, Heart, Sun"
            },
            {
                "service": "Transits",
                "prompt": "How will Jupiter in Gemini affect me?",
                "context": "Current transit: Jupiter in Gemini, natal Sun in Aries"
            },
            {
                "service": "Synastry",
                "prompt": "What does our Venus-Mars aspect mean?",
                "context": "Person 1 Venus in Taurus, Person 2 Mars in Scorpio"
            },
            {
                "service": "Lunar",
                "prompt": "What should I do during this Full Moon?",
                "context": "Current phase: Full Moon in Scorpio"
            },
            {
                "service": "Crystals",
                "prompt": "Which crystal is best for me right now?",
                "context": "Sun sign: Aries, Current focus: creativity"
            },
            {
                "service": "Rituals",
                "prompt": "Can you guide me through a morning meditation?",
                "context": "Goal: clarity and focus"
            },
            {
                "service": "Chakra",
                "prompt": "How can I balance my throat chakra?",
                "context": "Blocked chakra: Throat (Vishuddha)"
            },
            {
                "service": "Simple Query",
                "prompt": "What is my Sun sign?",
                "context": "Birth date: March 25, 1990"
            }
        ]
        
        # Run all tests
        for test_case in test_cases:
            result = await self.test_chat_streaming(
                test_case["service"],
                test_case["prompt"],
                test_case["context"]
            )
            self.results.append(result)
            await asyncio.sleep(1)  # Brief pause between tests
        
        # Generate report
        self.generate_report()
    
    def generate_report(self):
        """Generate comprehensive test report"""
        print("\n" + "="*60)
        print("📊 STREAMING PERFORMANCE REPORT")
        print("="*60)
        
        successful_tests = [r for r in self.results if r["success"]]
        failed_tests = [r for r in self.results if not r["success"]]
        
        print(f"\n✅ Successful: {len(successful_tests)}/{len(self.results)}")
        print(f"❌ Failed: {len(failed_tests)}/{len(self.results)}")
        
        if successful_tests:
            print("\n📈 Performance Metrics (Successful Tests):")
            print("-" * 60)
            
            # Calculate averages
            avg_quick_response = sum(r["quick_response_time"] or 0 for r in successful_tests) / len(successful_tests)
            avg_first_token = sum(r["first_token_time"] or 0 for r in successful_tests) / len(successful_tests)
            avg_total_time = sum(r["total_time"] for r in successful_tests) / len(successful_tests)
            avg_token_count = sum(r["token_count"] for r in successful_tests) / len(successful_tests)
            avg_throughput = sum(r["token_count"] / r["total_time"] for r in successful_tests) / len(successful_tests)
            
            print(f"  Quick Response Time: {avg_quick_response:.3f}s (avg)")
            print(f"  First Token Latency: {avg_first_token:.3f}s (avg)")
            print(f"  Total Response Time: {avg_total_time:.3f}s (avg)")
            print(f"  Token Count: {avg_token_count:.1f} (avg)")
            print(f"  Throughput: {avg_throughput:.2f} tokens/s (avg)")
            
            # Find best and worst performers
            best_first_token = min(successful_tests, key=lambda r: r["first_token_time"] or float('inf'))
            worst_first_token = max(successful_tests, key=lambda r: r["first_token_time"] or 0)
            
            print(f"\n🏆 Best First Token: {best_first_token['service']} ({best_first_token['first_token_time']:.3f}s)")
            print(f"🐌 Worst First Token: {worst_first_token['service']} ({worst_first_token['first_token_time']:.3f}s)")
            
            # Performance targets
            print("\n🎯 Performance Targets:")
            quick_response_target = 1.0  # < 1 second
            first_token_target = 1.5  # < 1.5 seconds
            throughput_target = 10.0  # > 10 tokens/s
            
            quick_response_pass = avg_quick_response < quick_response_target
            first_token_pass = avg_first_token < first_token_target
            throughput_pass = avg_throughput > throughput_target
            
            print(f"  Quick Response < {quick_response_target}s: {'✅ PASS' if quick_response_pass else '❌ FAIL'} ({avg_quick_response:.3f}s)")
            print(f"  First Token < {first_token_target}s: {'✅ PASS' if first_token_pass else '❌ FAIL'} ({avg_first_token:.3f}s)")
            print(f"  Throughput > {throughput_target} tokens/s: {'✅ PASS' if throughput_pass else '❌ FAIL'} ({avg_throughput:.2f} tokens/s)")
            
            # Detailed results
            print("\n📋 Detailed Results:")
            print("-" * 60)
            for result in successful_tests:
                throughput = result["token_count"] / result["total_time"]
                print(f"\n  {result['service']}:")
                print(f"    Quick Response: {result['quick_response_time']:.3f}s")
                print(f"    First Token: {result['first_token_time']:.3f}s")
                print(f"    Total Time: {result['total_time']:.3f}s")
                print(f"    Tokens: {result['token_count']}")
                print(f"    Throughput: {throughput:.2f} tokens/s")
        
        if failed_tests:
            print("\n❌ Failed Tests:")
            print("-" * 60)
            for result in failed_tests:
                print(f"\n  {result['service']}:")
                print(f"    Error: {result['error']}")
                print(f"    Time: {result['total_time']:.3f}s")
        
        # Save report to file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f"streaming_test_report_{timestamp}.json"
        
        with open(report_file, "w") as f:
            json.dump({
                "timestamp": timestamp,
                "total_tests": len(self.results),
                "successful": len(successful_tests),
                "failed": len(failed_tests),
                "results": self.results
            }, f, indent=2)
        
        print(f"\n💾 Report saved to: {report_file}")
        print("\n" + "="*60)

async def main():
    """Run comprehensive streaming tests"""
    suite = StreamingTestSuite()
    
    # Setup
    await suite.setup()
    
    if not suite.token:
        print("❌ Failed to authenticate. Cannot run tests.")
        return
    
    # Run tests
    await suite.test_all_services()

if __name__ == "__main__":
    asyncio.run(main())
