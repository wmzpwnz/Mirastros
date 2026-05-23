from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List
from app.core.database import get_db
from app.core.deps import require_admin
from app.models.user import User
from app.services.rag import rag_service
from app.models.document import Document
from sqlalchemy import select
import PyPDF2
import io

router = APIRouter(prefix="/documents", tags=["Documents"])

class DocumentCreate(BaseModel):
    title: str
    content: str
    source: str = None
    category: str = None

class DocumentResponse(BaseModel):
    id: int
    title: str
    source: str = None
    category: str = None

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    doc: DocumentCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Upload and ingest a document"""
    doc_id = await rag_service.ingest_document(
        db,
        title=doc.title,
        content=doc.content,
        source=doc.source,
        category=doc.category
    )
    
    result = await db.execute(select(Document).where(Document.id == doc_id))
    document = result.scalar_one()
    
    return DocumentResponse(
        id=document.id,
        title=document.title,
        source=document.source,
        category=document.category
    )

@router.post("/upload-pdf", response_model=DocumentResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    category: str = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Upload and ingest a PDF document"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Read PDF
    content = await file.read()
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
    
    # Extract text
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    
    # Ingest
    doc_id = await rag_service.ingest_document(
        db,
        title=file.filename,
        content=text,
        source=file.filename,
        category=category
    )
    
    result = await db.execute(select(Document).where(Document.id == doc_id))
    document = result.scalar_one()
    
    return DocumentResponse(
        id=document.id,
        title=document.title,
        source=document.source,
        category=document.category
    )

@router.get("/", response_model=List[DocumentResponse])
async def list_documents(
    category: str = None,
    db: AsyncSession = Depends(get_db)
):
    """List all documents"""
    query = select(Document)
    if category:
        query = query.where(Document.category == category)
    
    result = await db.execute(query)
    documents = result.scalars().all()
    
    return [
        DocumentResponse(
            id=doc.id,
            title=doc.title,
            source=doc.source,
            category=doc.category
        )
        for doc in documents
    ]

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific document"""
    result = await db.execute(select(Document).where(Document.id == document_id))
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return DocumentResponse(
        id=document.id,
        title=document.title,
        source=document.source,
        category=document.category
    )

@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: int,
    doc: DocumentCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Update a document"""
    result = await db.execute(select(Document).where(Document.id == document_id))
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Update document fields
    document.title = doc.title
    document.content = doc.content
    if doc.source:
        document.source = doc.source
    if doc.category:
        document.category = doc.category
    
    await db.commit()
    await db.refresh(document)
    
    # Re-ingest to update embeddings
    await rag_service.ingest_document(
        db,
        title=doc.title,
        content=doc.content,
        source=doc.source,
        category=doc.category
    )
    
    return DocumentResponse(
        id=document.id,
        title=document.title,
        source=document.source,
        category=document.category
    )

@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Delete a document and its chunks"""
    result = await db.execute(select(Document).where(Document.id == document_id))
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete document (chunks will be deleted via cascade)
    await db.delete(document)
    await db.commit()
    
    return {"message": "Document deleted successfully"}
