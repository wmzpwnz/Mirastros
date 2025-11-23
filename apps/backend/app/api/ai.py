from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.core.redis import get_redis, RedisClient
from app.services.llm import llm_service
from app.services.rag import rag_service
from app.models.document import UserQuery
import json

router = APIRouter(prefix="/ai", tags=["AI"])

class PredictRequest(BaseModel):
    query: str
    service_type: str  # horoscope, tarot, natal
    user_id: Optional[str] = "anonymous"
    use_rag: bool = True
    stream: bool = False

class PredictResponse(BaseModel):
    response: str
    sources: Optional[list] = None

@router.post("/predict", response_model=PredictResponse)
async def predict(
    request: PredictRequest,
    db: AsyncSession = Depends(get_db),
    redis: RedisClient = Depends(get_redis)
):
    """Generate AI prediction"""
    
    # Check cache for horoscopes
    if request.service_type == "horoscope":
        cache_key = f"horoscope:{request.query}"
        cached = await redis.get(cache_key)
        if cached:
            return PredictResponse(response=cached["response"], sources=cached.get("sources"))
    
    # Get RAG context if enabled
    context = ""
    sources = []
    if request.use_rag:
        context = await rag_service.get_context(
            db,
            request.query,
            category=request.service_type
        )
        chunks = await rag_service.retrieve(db, request.query, category=request.service_type)
        sources = [{"title": c["title"], "similarity": c["similarity"]} for c in chunks]
    
    # Generate response
    if request.stream:
        async def generate_stream():
            async for chunk in llm_service.generate(
                request.query,
                context=context,
                stream=True
            ):
                yield f"data: {json.dumps({'text': chunk})}\n\n"
            yield "data: [DONE]\n\n"
        
        return StreamingResponse(generate_stream(), media_type="text/event-stream")
    else:
        response = await llm_service.generate(
            request.query,
            context=context,
            stream=False
        )
        
        # Save to database
        user_query = UserQuery(
            user_id=request.user_id,
            query=request.query,
            response=response,
            service_type=request.service_type
        )
        db.add(user_query)
        await db.commit()
        
        # Cache horoscopes
        if request.service_type == "horoscope":
            await redis.set(
                cache_key,
                {"response": response, "sources": sources},
                ttl=86400  # 24 hours
            )
        
        return PredictResponse(response=response, sources=sources)

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "ai"}
