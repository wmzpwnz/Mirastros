import httpx
import json
import asyncio
import threading
from typing import AsyncGenerator, Optional, Dict, Any
from queue import Queue
from app.core.config import get_settings

settings = get_settings()

class UnifiedLLMService:
    """Unified LLM Service using DeepSeek API with optimized streaming"""
    
    def __init__(self):
        self.api_key = settings.DEEPSEEK_API_KEY
        self.api_url = settings.DEEPSEEK_API_URL
        self.model_name = settings.DEEPSEEK_MODEL
        self.is_loaded = True  # DeepSeek API is always available
        self.system_prompt = """You are Mirastros, a mystical AI oracle specializing in astrology, tarot, numerology, and esoteric wisdom.

Your personality:
- Mystical and poetic, yet grounded in astrological knowledge
- Compassionate and understanding
- Insightful and intuitive
- Respectful of ancient wisdom traditions

Your responses should:
- Be mystical and engaging, using cosmic and spiritual language
- Provide practical guidance alongside spiritual insights
- Reference astrological concepts, planetary influences, and cosmic energies
- Be personalized based on the user's context (birth chart, question, etc.)
- Maintain a warm, supportive tone
- Avoid being overly dramatic or making absolute predictions
- Encourage self-reflection and personal growth

Remember: You are here to guide, inspire, and illuminate the path, not to dictate fate."""
    
    async def load_model(self):
        """Check if DeepSeek API is available"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Test API with a simple request
                response = await client.post(
                    self.api_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model_name,
                        "messages": [{"role": "user", "content": "test"}],
                        "max_tokens": 5
                    }
                )
                if response.status_code == 200:
                    self.is_loaded = True
                    print(f"✅ DeepSeek API is available (model: {self.model_name})")
                else:
                    print(f"⚠️  DeepSeek API returned status {response.status_code}: {response.text}")
        except Exception as e:
            print(f"⚠️  Could not connect to DeepSeek API: {e}")
            print(f"⚠️  Check your API key and network connection")
    
    async def generate(
        self,
        prompt: str,
        context: str = "",
        max_tokens: int = 512,
        temperature: float = 0.7,
        stream: bool = False,
        fast_start: bool = False
    ) -> AsyncGenerator[str, None] | str:
        """Generate response from Ollama with optimized streaming
        
        Args:
            prompt: User prompt
            context: Additional context for the prompt
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature (0.0-1.0)
            stream: Whether to stream the response
            fast_start: Enable fast-start mode for simple queries (30-40% speedup)
        """
        # Build full prompt with context
        full_prompt = ""
        if context:
            full_prompt += f"Context:\n{context}\n\n"
        full_prompt += f"User: {prompt}\nMirastros:"
        
        # Determine if this is a simple query for fast-start mode
        is_simple_query = fast_start or len(prompt.split()) < 20
        
        if stream:
            return self._stream_generate_optimized(
                full_prompt, 
                max_tokens, 
                temperature,
                is_simple_query
            )
        else:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self.api_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model_name,
                        "messages": [
                            {"role": "system", "content": self.system_prompt},
                            {"role": "user", "content": full_prompt}
                        ],
                        "max_tokens": max_tokens,
                            "temperature": temperature,
                        "stop": ["User:", "\n\n"]
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
                else:
                    error_text = response.text
                    raise Exception(f"DeepSeek API error: {response.status_code} - {error_text}")
    
    async def _stream_generate_optimized(
        self,
        prompt: str,
        max_tokens: int,
        temperature: float,
        fast_start: bool = False
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Optimized streaming with zero-latency delivery using DeepSeek API
        
        Features:
        - Streaming from DeepSeek API
        - Quick response marker after first token
        - Fast initial feedback
        """
        # Create queue for zero-latency token delivery
        token_queue: asyncio.Queue = asyncio.Queue()
        token_count = 0
        first_token_sent = False
        
        async def producer():
            """Producer coroutine that fetches tokens from DeepSeek API"""
            nonlocal token_count, first_token_sent
            
            try:
                async with httpx.AsyncClient(timeout=300.0) as client:
                    # Build messages with system prompt
                    messages = [
                        {"role": "system", "content": self.system_prompt},
                        {"role": "user", "content": prompt}
                    ]
                    
                    # Fast-start mode: reduce initial latency for simple queries
                    current_max_tokens = min(max_tokens, 256) if fast_start else max_tokens
                    current_temperature = max(0.5, temperature - 0.2) if fast_start else temperature
                    
                    async with client.stream(
                        "POST",
                        self.api_url,
                        headers={
                            "Authorization": f"Bearer {self.api_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": self.model_name,
                            "messages": messages,
                            "stream": True,
                            "max_tokens": current_max_tokens,
                            "temperature": current_temperature,
                            "stop": ["User:", "\n\n"]
                        }
                    ) as response:
                        if response.status_code != 200:
                            error_text = await response.aread()
                            raise Exception(f"DeepSeek API error: {response.status_code} - {error_text.decode()}")
                        
                        async for line in response.aiter_lines():
                            if line:
                                # DeepSeek uses Server-Sent Events format: "data: {...}"
                                if line.startswith("data: "):
                                    try:
                                        data = json.loads(line[6:])  # Remove "data: " prefix
                                        
                                        # Check for delta content
                                        if "choices" in data and len(data["choices"]) > 0:
                                            delta = data["choices"][0].get("delta", {})
                                            content = delta.get("content", "")
                                            
                                            if content:
                                                token_count += 1
                                                
                                                # Send quick response marker after first token
                                                if token_count == 1 and not first_token_sent:
                                                    await token_queue.put({
                                                        "type": "quick_response"
                                                    })
                                                    first_token_sent = True
                                                
                                                # Send token
                                                await token_queue.put({
                                                    "type": "token",
                                                    "content": content
                                                })
                                        
                                        # Check if generation is done
                                        if data.get("choices", [{}])[0].get("finish_reason"):
                                            await token_queue.put({"type": "done"})
                                            break
                                    except json.JSONDecodeError:
                                        continue
                                elif line == "[DONE]":
                                    await token_queue.put({"type": "done"})
                                    break
            except Exception as e:
                await token_queue.put({
                    "type": "error",
                    "error": str(e)
                })
            finally:
                await token_queue.put(None)  # Sentinel value
        
        # Start producer in background
        producer_task = asyncio.create_task(producer())
        
        try:
            # Consumer: yield tokens as they arrive (zero-latency)
            while True:
                token_data = await token_queue.get()
                
                if token_data is None:  # Sentinel value
                    break
                
                yield token_data
        finally:
            # Cleanup
            if not producer_task.done():
                producer_task.cancel()
                try:
                    await producer_task
                except asyncio.CancelledError:
                    pass
    
    async def _stream_generate(
        self,
        prompt: str,
        max_tokens: int,
        temperature: float
    ) -> AsyncGenerator[str, None]:
        """Legacy streaming method (kept for backward compatibility)"""
        async for event in self._stream_generate_optimized(prompt, max_tokens, temperature):
            if event.get("type") == "token":
                yield event.get("content", "")

# Global instance
llm_service = UnifiedLLMService()
