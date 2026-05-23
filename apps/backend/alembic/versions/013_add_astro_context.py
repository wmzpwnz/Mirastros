"""add astro_context table

Revision ID: 013
Revises: 012
Create Date: 2025-01-27

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '013'
down_revision = '012'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create astro_context table
    op.create_table(
        'astro_context',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('natal_data', postgresql.JSONB(), nullable=True),
        sa.Column('last_arcana', sa.Integer(), nullable=True),
        sa.Column('dream_symbols', postgresql.JSONB(), nullable=True),
        sa.Column('last_question', sa.Text(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    
    # Create unique index on user_id
    op.create_index(
        'ix_astro_context_user_id',
        'astro_context',
        ['user_id'],
        unique=True
    )
    
    # Create index on updated_at for sorting and filtering
    op.create_index(
        'ix_astro_context_updated_at',
        'astro_context',
        ['updated_at'],
        unique=False
    )


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_astro_context_updated_at', table_name='astro_context')
    op.drop_index('ix_astro_context_user_id', table_name='astro_context')
    
    # Drop table
    op.drop_table('astro_context')

