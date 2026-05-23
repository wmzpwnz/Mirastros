from typing import List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from app.models.document import Document, DocumentChunk
from app.services.embedding import embedding_service
from app.core.config import get_settings
import re

settings = get_settings()

class RAGService:
    """Retrieval-Augmented Generation Service"""
    
    @staticmethod
    def chunk_text(text: str, chunk_size: int = None, overlap: int = None) -> List[str]:
        """Split text into overlapping chunks"""
        chunk_size = chunk_size or settings.CHUNK_SIZE
        overlap = overlap or settings.CHUNK_OVERLAP
        
        # Split by sentences
        sentences = re.split(r'(?<=[.!?])\s+', text)
        chunks = []
        current_chunk = []
        current_length = 0
        
        for sentence in sentences:
            sentence_length = len(sentence)
            
            if current_length + sentence_length > chunk_size and current_chunk:
                chunks.append(' '.join(current_chunk))
                # Keep last few sentences for overlap
                overlap_sentences = []
                overlap_length = 0
                for s in reversed(current_chunk):
                    if overlap_length + len(s) <= overlap:
                        overlap_sentences.insert(0, s)
                        overlap_length += len(s)
                    else:
                        break
                current_chunk = overlap_sentences
                current_length = overlap_length
            
            current_chunk.append(sentence)
            current_length += sentence_length
        
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        return chunks
    
    async def ingest_document(
        self,
        db: AsyncSession,
        title: str,
        content: str,
        source: str = None,
        category: str = None
    ) -> int:
        """Ingest a document into the RAG system"""
        
        # Create document
        doc = Document(
            title=title,
            content=content,
            source=source,
            category=category
        )
        db.add(doc)
        await db.flush()
        
        # Chunk the content
        chunks = self.chunk_text(content)
        
        # Generate embeddings
        embeddings = await embedding_service.embed_batch(chunks)
        
        # Store chunks with embeddings
        for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            chunk_obj = DocumentChunk(
                document_id=doc.id,
                chunk_text=chunk,
                chunk_index=idx,
                embedding=embedding
            )
            db.add(chunk_obj)
        
        await db.commit()
        return doc.id
    
    async def retrieve(
        self,
        db: AsyncSession,
        query: str,
        top_k: int = None,
        category: str = None
    ) -> List[Dict]:
        """Retrieve relevant chunks for a query"""
        top_k = top_k or settings.TOP_K_RESULTS
        
        # Generate query embedding
        query_embedding = await embedding_service.embed_text(query)
        
        # Build SQL query with vector similarity search
        if category:
            sql = text("""
                SELECT
                    dc.chunk_text,
                    d.title,
                    d.source,
                    d.category,
                    1 - (dc.embedding <=> (:query_embedding)::vector) as similarity
                FROM document_chunks dc
                JOIN documents d ON dc.document_id = d.id
                WHERE d.category = :category
                ORDER BY dc.embedding <=> (:query_embedding)::vector
                LIMIT :top_k
            """)
        else:
            sql = text("""
                SELECT
                    dc.chunk_text,
                    d.title,
                    d.source,
                    d.category,
                    1 - (dc.embedding <=> (:query_embedding)::vector) as similarity
                FROM document_chunks dc
                JOIN documents d ON dc.document_id = d.id
                ORDER BY dc.embedding <=> (:query_embedding)::vector
                LIMIT :top_k
            """)
        
        result = await db.execute(
            sql,
            {
                "query_embedding": str(query_embedding),
                "category": category,
                "top_k": top_k
            }
        )
        
        rows = result.fetchall()
        
        return [
            {
                "text": row[0],
                "title": row[1],
                "source": row[2],
                "category": row[3],
                "similarity": row[4]
            }
            for row in rows
        ]
    
    async def get_context(
        self,
        db: AsyncSession,
        query: str,
        category: str = None
    ) -> str:
        """Get formatted context for LLM"""
        chunks = await self.retrieve(db, query, category=category)
        
        if not chunks:
            return ""
        
        context_parts = []
        for chunk in chunks:
            context_parts.append(f"[{chunk['title']}]\n{chunk['text']}")
        
        return "\n\n".join(context_parts)

# Global instance
rag_service = RAGService()
