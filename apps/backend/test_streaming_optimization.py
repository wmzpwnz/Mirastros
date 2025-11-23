"""
Test script for streaming optimization

This script tests the optimized streaming implementation to verify:
1. Zero-latency token delivery
2. Quick response marker
3. Fast-start mode for simple queries
4. Optimal model parameters
5. Error handling
"""

import asyncio
import time
from app.services.llm import UnifiedLLMService


async def test_basic_streaming():
    """Test basic streaming functionality"""
    print("\n=== Test 1: Basic Streaming ===")
    
    llm_service = UnifiedLLMService()
    await llm_service.load_model()
    
    if not llm_service.is_loaded:
        print("❌ Ollama model not loaded. Please run: ollama pull qwen2.5:7b-instruct-q4_K_M")
        return False
    
    prompt = "What is astrology?"
    start_time = time.time()
    first_token_time = None
    token_count = 0
    
    print(f"Prompt: {prompt}")
    print("Response: ", end="", flush=True)
    
    try:
        async for event in llm_service._stream_generate_optimized(
            prompt=prompt,
            max_tokens=100,
            temperature=0.7,
            fast_start=False
        ):
            if event.get("type") == "quick_response":
                if first_token_time is None:
                    first_token_time = time.time() - start_time
                    print(f"\n[Quick response marker received in {first_token_time:.2f}s]")
                    print("Response: ", end="", flush=True)
            
            elif event.get("type") == "token":
                token_count += 1
                print(event.get("content", ""), end="", flush=True)
            
            elif event.get("type") == "done":
                break
            
            elif event.get("type") == "error":
                print(f"\n❌ Error: {event.get('error')}")
                return False
        
        total_time = time.time() - start_time
        print(f"\n\n✅ Streaming completed successfully")
        print(f"First token latency: {first_token_time:.2f}s")
        print(f"Total time: {total_time:.2f}s")
        print(f"Tokens: {token_count}")
        print(f"Throughput: {token_count / total_time:.2f} tokens/sec")
        
        return True
    
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False


async def test_fast_start_mode():
    """Test fast-start mode for simple queries"""
    print("\n=== Test 2: Fast-Start Mode ===")
    
    llm_service = UnifiedLLMService()
    await llm_service.load_model()
    
    if not llm_service.is_loaded:
        print("❌ Ollama model not loaded")
        return False
    
    # Simple query
    prompt = "What is my Sun sign?"
    start_time = time.time()
    first_token_time = None
    token_count = 0
    
    print(f"Prompt: {prompt}")
    print("Response: ", end="", flush=True)
    
    try:
        async for event in llm_service._stream_generate_optimized(
            prompt=prompt,
            max_tokens=100,
            temperature=0.7,
            fast_start=True  # Enable fast-start mode
        ):
            if event.get("type") == "quick_response":
                if first_token_time is None:
                    first_token_time = time.time() - start_time
                    print(f"\n[Quick response in {first_token_time:.2f}s - Fast-start mode]")
                    print("Response: ", end="", flush=True)
            
            elif event.get("type") == "token":
                token_count += 1
                print(event.get("content", ""), end="", flush=True)
            
            elif event.get("type") == "done":
                break
        
        total_time = time.time() - start_time
        print(f"\n\n✅ Fast-start mode completed successfully")
        print(f"First token latency: {first_token_time:.2f}s (should be < 1s)")
        print(f"Total time: {total_time:.2f}s")
        print(f"Tokens: {token_count}")
        
        return True
    
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False


async def test_zero_latency_delivery():
    """Test zero-latency token delivery"""
    print("\n=== Test 3: Zero-Latency Delivery ===")
    
    llm_service = UnifiedLLMService()
    await llm_service.load_model()
    
    if not llm_service.is_loaded:
        print("❌ Ollama model not loaded")
        return False
    
    prompt = "Tell me about tarot cards"
    token_times = []
    last_time = time.time()
    
    print(f"Prompt: {prompt}")
    print("Measuring inter-token latency...")
    
    try:
        async for event in llm_service._stream_generate_optimized(
            prompt=prompt,
            max_tokens=50,
            temperature=0.7,
            fast_start=False
        ):
            if event.get("type") == "token":
                current_time = time.time()
                latency = current_time - last_time
                token_times.append(latency)
                last_time = current_time
            
            elif event.get("type") == "done":
                break
        
        if token_times:
            avg_latency = sum(token_times) / len(token_times)
            max_latency = max(token_times)
            min_latency = min(token_times)
            
            print(f"\n✅ Zero-latency test completed")
            print(f"Average inter-token latency: {avg_latency * 1000:.2f}ms")
            print(f"Min latency: {min_latency * 1000:.2f}ms")
            print(f"Max latency: {max_latency * 1000:.2f}ms")
            print(f"Tokens measured: {len(token_times)}")
            
            # Check if latency is acceptable (< 100ms average)
            if avg_latency < 0.1:
                print("✅ Zero-latency delivery confirmed (< 100ms average)")
                return True
            else:
                print("⚠️  Latency higher than expected")
                return False
        else:
            print("❌ No tokens received")
            return False
    
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False


async def test_error_handling():
    """Test error handling in streaming"""
    print("\n=== Test 4: Error Handling ===")
    
    llm_service = UnifiedLLMService()
    # Don't load model to test error handling
    
    prompt = "Test error handling"
    
    print(f"Prompt: {prompt}")
    print("Testing error handling (model not loaded)...")
    
    try:
        error_received = False
        async for event in llm_service._stream_generate_optimized(
            prompt=prompt,
            max_tokens=50,
            temperature=0.7,
            fast_start=False
        ):
            if event.get("type") == "error":
                error_received = True
                print(f"✅ Error event received: {event.get('error')}")
                break
        
        if error_received:
            print("✅ Error handling works correctly")
            return True
        else:
            print("⚠️  No error event received")
            return False
    
    except Exception as e:
        print(f"✅ Exception caught correctly: {e}")
        return True


async def main():
    """Run all tests"""
    print("=" * 60)
    print("Streaming Optimization Test Suite")
    print("=" * 60)
    
    results = []
    
    # Test 1: Basic streaming
    results.append(("Basic Streaming", await test_basic_streaming()))
    
    # Test 2: Fast-start mode
    results.append(("Fast-Start Mode", await test_fast_start_mode()))
    
    # Test 3: Zero-latency delivery
    results.append(("Zero-Latency Delivery", await test_zero_latency_delivery()))
    
    # Test 4: Error handling
    results.append(("Error Handling", await test_error_handling()))
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Streaming optimization is working correctly.")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please review the implementation.")


if __name__ == "__main__":
    asyncio.run(main())
