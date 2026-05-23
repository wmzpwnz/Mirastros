"""Initial migration - Create tables

Revision ID: 001
Create Date: 2025-11-21
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Enable pgvector extension (optional - skip if not installed for postgresql@14)
    # Use DO block so failure doesn't abort the transaction
    op.execute("""
        DO $$
        BEGIN
            CREATE EXTENSION IF NOT EXISTS vector;
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END $$;
    """)
    # Check if vector type exists
    conn = op.get_bind()
    has_vector = conn.execute(sa.text(
        "SELECT 1 FROM pg_extension WHERE extname = 'vector'"
    )).scalar() is not None

    # Create documents table
    op.create_table(
        'documents',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('source', sa.String(length=255), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_documents_id'), 'documents', ['id'], unique=False)
    
    # Create document_chunks table (with or without vector embedding)
    if has_vector:
        from pgvector.sqlalchemy import Vector
        op.create_table(
            'document_chunks',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('document_id', sa.Integer(), nullable=False),
            sa.Column('chunk_text', sa.Text(), nullable=False),
            sa.Column('chunk_index', sa.Integer(), nullable=False),
            sa.Column('embedding', Vector(384), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_document_chunks_id'), 'document_chunks', ['id'], unique=False)
        op.create_index(op.f('ix_document_chunks_document_id'), 'document_chunks', ['document_id'], unique=False)
        op.execute("""
            CREATE INDEX document_chunks_embedding_idx 
            ON document_chunks 
            USING ivfflat (embedding vector_cosine_ops)
            WITH (lists = 100)
        """)
    else:
        op.create_table(
            'document_chunks',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('document_id', sa.Integer(), nullable=False),
            sa.Column('chunk_text', sa.Text(), nullable=False),
            sa.Column('chunk_index', sa.Integer(), nullable=False),
            sa.Column('embedding', sa.LargeBinary(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_document_chunks_id'), 'document_chunks', ['id'], unique=False)
        op.create_index(op.f('ix_document_chunks_document_id'), 'document_chunks', ['document_id'], unique=False)
    
    # Create user_queries table
    op.create_table(
        'user_queries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=True),
        sa.Column('query', sa.Text(), nullable=False),
        sa.Column('response', sa.Text(), nullable=True),
        sa.Column('service_type', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_queries_id'), 'user_queries', ['id'], unique=False)
    op.create_index(op.f('ix_user_queries_user_id'), 'user_queries', ['user_id'], unique=False)

def downgrade():
    op.drop_index(op.f('ix_user_queries_user_id'), table_name='user_queries')
    op.drop_index(op.f('ix_user_queries_id'), table_name='user_queries')
    op.drop_table('user_queries')
    
    op.execute('DROP INDEX IF EXISTS document_chunks_embedding_idx')
    op.drop_index(op.f('ix_document_chunks_document_id'), table_name='document_chunks')
    op.drop_index(op.f('ix_document_chunks_id'), table_name='document_chunks')
    op.drop_table('document_chunks')
    
    op.drop_index(op.f('ix_documents_id'), table_name='documents')
    op.drop_table('documents')
    
    try:
        op.execute('DROP EXTENSION IF EXISTS vector')
    except Exception:
        pass
