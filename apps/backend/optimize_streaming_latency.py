#!/usr/bin/env python3
"""
Streaming Latency Optimization Tool
Tests different configurations to find optimal streaming parameters
"""

import asyncio
import httpx
import json
import time
from typing import Dict, Any, List
import statistics

BASE_URL = "http://localhost:11434"  # Ollama direct
MODEL_NAME = "mirastros-ai"

class LatencyOptimizer:
    def __init__(self):
        self.results: List[Dict[str, Any]] = []
    
    async def test_configuration(
        self,
        config_name: str,
        num_batch: int,
        num_thread: int,
        temperature: float,
        num_predict: int
    ) -> Dict[str, Any]:
        """Test a specific Ollama configuration"""
        print(f"\n🧪 Testing: {config_name}")
        print(f"   num_batch={num_batch}, num_thread={num_thread}, temp={temperature}, num_predict={num_predict}")
        
        metrics = {
            "config_name": config_name,
            "num_batch": num_batch,
            "num_thread": num_thread,
            "temperature": temperature,
            "num_predict": num_predict,
            "first_token_time": None,
            "total_time": None,
            "token_count": 0,
            "tokens_per_second": 0,
            "success": False,
            "error": None
        }
        
        prompt = "Explain astrology in simple terms."
        start_time = time.time()
        first_token_time = None
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream(
                    "POST",
                    f"{BASE_URL}/api/generate",
                    json={
                        "model": MODEL_NAME,
                        "prompt": prompt,
                        "stream": True,
                        "options": {
                            "temperature": temperature,
                            "num_predict": num_predict,
                            "num_batch": num_batch,
                            "num_thread": num_thread,
                            "stop": ["\n\n"]
                        }
                    }
                ) as response:
                    if response.status_code != 200:
                        metrics["error"] = f"Request failed: {response.status_code}"
                        return metrics
                    
                    async for line in response.aiter_lines():
                        if line:
                            try:
                                data = json.loads(line)
                                
                                if "response" in data and data["response"]:
                                    if first_token_time is None:
                                        first_token_time = time.time() - start_time
                                        metrics["first_token_time"] = first_token_time
                                        print(f"   🎯 First token: {first_token_time:.3f}s")
                                    
                                    metrics["token_count"] += 1
                                    print(".", end="", flush=True)
                                
                                if data.get("done", False):
                                    metrics["success"] = True
                                    print()  # New line
                                    break
                            
                            except json.JSONDecodeError:
                                continue
            
            metrics["total_time"] = time.time() - start_time
            
            if metrics["success"] and metrics["total_time"] > 0:
                metrics["tokens_per_second"] = metrics["token_count"] / metrics["total_time"]
                print(f"   ✅ Complete: {metrics['total_time']:.3f}s, {metrics['token_count']} tokens, {metrics['tokens_per_second']:.2f} tok/s")
        
        except Exception as e:
            metrics["error"] = str(e)
            metrics["total_time"] = time.time() - start_time
            print(f"   ❌ Error: {e}")
        
        return metrics
    
    async def run_optimization_tests(self):
        """Run tests with different configurations"""
        print("="*60)
        print("🔬 STREAMING LATENCY OPTIMIZATION")
        print("="*60)
        
        # Test configurations
        configs = [
            # Baseline
            ("Baseline (default)", 128, 4, 0.7, 256),
            
            # Batch size variations
            ("Batch 256", 256, 10, 0.7, 256),
            ("Batch 512 (current)", 512, 10, 0.7, 256),
            ("Batch 1024", 1024, 10, 0.7, 256),
            
            # Thread variations
            ("Threads 6", 512, 6, 0.7, 256),
            ("Threads 8", 512, 8, 0.7, 256),
            ("Threads 10 (current)", 512, 10, 0.7, 256),
            ("Threads 12", 512, 12, 0.7, 256),
            
            # Temperature variations
            ("Temp 0.5 (focused)", 512, 10, 0.5, 256),
            ("Temp 0.7 (current)", 512, 10, 0.7, 256),
            ("Temp 0.9 (creative)", 512, 10, 0.9, 256),
            
            # Prediction length variations
            ("Predict 128 (short)", 512, 10, 0.7, 128),
            ("Predict 256 (current)", 512, 10, 0.7, 256),
            ("Predict 512 (long)", 512, 10, 0.7, 512),
            
            # Optimized combinations
            ("Fast Start", 512, 12, 0.5, 128),
            ("Balanced", 512, 10, 0.7, 256),
            ("High Quality", 1024, 12, 0.7, 512),
        ]
        
        for config in configs:
            result = await self.test_configuration(*config)
            self.results.append(result)
            await asyncio.sleep(2)  # Pause between tests
        
        # Generate report
        self.generate_optimization_report()
    
    def generate_optimization_report(self):
        """Generate optimization report"""
        print("\n" + "="*60)
        print("📊 OPTIMIZATION REPORT")
        print("="*60)
        
        successful = [r for r in self.results if r["success"]]
        
        if not successful:
            print("❌ No successful tests")
            return
        
        # Sort by first token time
        by_first_token = sorted(successful, key=lambda r: r["first_token_time"])
        
        # Sort by throughput
        by_throughput = sorted(successful, key=lambda r: r["tokens_per_second"], reverse=True)
        
        print("\n🏆 Best First Token Latency:")
        for i, result in enumerate(by_first_token[:3], 1):
            print(f"  {i}. {result['config_name']}: {result['first_token_time']:.3f}s")
            print(f"     Params: batch={result['num_batch']}, threads={result['num_thread']}, temp={result['temperature']}")
        
        print("\n🏆 Best Throughput:")
        for i, result in enumerate(by_throughput[:3], 1):
            print(f"  {i}. {result['config_name']}: {result['tokens_per_second']:.2f} tok/s")
            print(f"     Params: batch={result['num_batch']}, threads={result['num_thread']}, temp={result['temperature']}")
        
        # Analyze batch size impact
        print("\n📊 Batch Size Impact:")
        batch_groups = {}
        for result in successful:
            batch = result["num_batch"]
            if batch not in batch_groups:
                batch_groups[batch] = []
            batch_groups[batch].append(result)
        
        for batch in sorted(batch_groups.keys()):
            results = batch_groups[batch]
            avg_first_token = statistics.mean(r["first_token_time"] for r in results)
            avg_throughput = statistics.mean(r["tokens_per_second"] for r in results)
            print(f"  Batch {batch}: first_token={avg_first_token:.3f}s, throughput={avg_throughput:.2f} tok/s")
        
        # Analyze thread count impact
        print("\n📊 Thread Count Impact:")
        thread_groups = {}
        for result in successful:
            threads = result["num_thread"]
            if threads not in thread_groups:
                thread_groups[threads] = []
            thread_groups[threads].append(result)
        
        for threads in sorted(thread_groups.keys()):
            results = thread_groups[threads]
            avg_first_token = statistics.mean(r["first_token_time"] for r in results)
            avg_throughput = statistics.mean(r["tokens_per_second"] for r in results)
            print(f"  Threads {threads}: first_token={avg_first_token:.3f}s, throughput={avg_throughput:.2f} tok/s")
        
        # Recommendations
        print("\n💡 Recommendations:")
        
        best_overall = by_first_token[0]
        print(f"\n  🎯 Best Overall Configuration: {best_overall['config_name']}")
        print(f"     num_batch: {best_overall['num_batch']}")
        print(f"     num_thread: {best_overall['num_thread']}")
        print(f"     temperature: {best_overall['temperature']}")
        print(f"     num_predict: {best_overall['num_predict']}")
        print(f"     First token: {best_overall['first_token_time']:.3f}s")
        print(f"     Throughput: {best_overall['tokens_per_second']:.2f} tok/s")
        
        # Compare to current
        current = next((r for r in successful if "current" in r["config_name"].lower()), None)
        if current and current != best_overall:
            improvement = ((current["first_token_time"] - best_overall["first_token_time"]) / current["first_token_time"]) * 100
            print(f"\n  📈 Potential Improvement: {improvement:.1f}% faster first token")
        
        print("\n  📝 Configuration Code:")
        print(f"""
options = {{
    "temperature": {best_overall['temperature']},
    "num_predict": {best_overall['num_predict']},
    "num_batch": {best_overall['num_batch']},
    "num_thread": {best_overall['num_thread']},
    "stop": ["User:", "\\n\\n"]
}}
""")
        
        print("\n" + "="*60)

async def main():
    """Run optimization tests"""
    optimizer = LatencyOptimizer()
    
    # Check if Ollama is available
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{BASE_URL}/api/tags")
            if response.status_code != 200:
                print("❌ Ollama not available")
                return
            
            models = response.json().get("models", [])
            if not any(m.get("name") == MODEL_NAME for m in models):
                print(f"❌ Model '{MODEL_NAME}' not found")
                return
    except Exception as e:
        print(f"❌ Cannot connect to Ollama: {e}")
        return
    
    await optimizer.run_optimization_tests()

if __name__ == "__main__":
    asyncio.run(main())
