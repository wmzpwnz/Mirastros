from sentence_transformers import SentenceTransformer
from typing import List
import numpy as np
from app.core.config import get_settings

settings = get_settings()

class EmbeddingService:
    """Service for generating embeddings"""
    
    def __init__(self):
        self.model = None
    
    async def load_model(self):
        """Load embedding model"""
        if not self.model:
            self.model = SentenceTransformer(settings.EMBEDDING_MODEL)
    
    async def embed_text(self, text: str) -> List[float]:
        """Generate embedding for a single text"""
        if not self.model:
            await self.load_model()
        embedding = self.model.encode(text, convert_to_numpy=True)
        return embedding.tolist()
    
    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts"""
        if not self.model:
            await self.load_model()
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        return embeddings.tolist()

# Global instance
embedding_service = EmbeddingService()
