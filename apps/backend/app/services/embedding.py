try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    SentenceTransformer = None

try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False
    np = None

from typing import List
from app.core.config import get_settings

settings = get_settings()

class EmbeddingService:
    """Service for generating embeddings"""
    
    def __init__(self):
        self.model = None
    
    async def load_model(self):
        """Load embedding model"""
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            return  # Skip loading if not available
        if not self.model:
            self.model = SentenceTransformer(settings.EMBEDDING_MODEL)
    
    async def embed_text(self, text: str) -> List[float]:
        """Generate embedding for a single text"""
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            # Return dummy embedding for local development
            return [0.0] * 384
        if not self.model:
            await self.load_model()
        embedding = self.model.encode(text, convert_to_numpy=True)
        return embedding.tolist()
    
    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts"""
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            # Return dummy embeddings for local development
            return [[0.0] * 384 for _ in texts]
        if not self.model:
            await self.load_model()
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        return embeddings.tolist()

# Global instance
embedding_service = EmbeddingService()
