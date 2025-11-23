from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from sqlalchemy.dialects.postgresql import ARRAY
from app.core.database import Base
from datetime import datetime
from pgvector.sqlalchemy import Vector

class Document(Base):
    """RAG Document storage"""
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    source = Column(String(255))
    category = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DocumentChunk(Base):
    """Chunked documents with embeddings"""
    __tablename__ = "document_chunks"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, nullable=False, index=True)
    chunk_text = Column(Text, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    embedding = Column(Vector(384))  # all-MiniLM-L6-v2 produces 384-dim vectors
    created_at = Column(DateTime, default=datetime.utcnow)

class UserQuery(Base):
    """User query history"""
    __tablename__ = "user_queries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), index=True)
    query = Column(Text, nullable=False)
    response = Column(Text)
    service_type = Column(String(50))  # horoscope, tarot, natal
    created_at = Column(DateTime, default=datetime.utcnow)
