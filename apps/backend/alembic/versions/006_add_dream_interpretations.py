"""add dream interpretations table

Revision ID: 006
Revises: 005
Create Date: 2025-11-21

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '006'
down_revision = '005'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create dream_interpretations table
    op.create_table(
        'dream_interpretations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('dream_description', sa.Text(), nullable=False),
        sa.Column('symbols', postgresql.JSON(), nullable=True),
        sa.Column('interpretation', sa.Text(), nullable=False),
        sa.Column('themes', postgresql.JSON(), nullable=True),
        sa.Column('emotions', postgresql.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
    )
    
    # Create index on user_id for faster queries
    op.create_index('ix_dream_interpretations_user_id', 'dream_interpretations', ['user_id'])
    
    # Create index on created_at for sorting
    op.create_index('ix_dream_interpretations_created_at', 'dream_interpretations', ['created_at'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_dream_interpretations_created_at', table_name='dream_interpretations')
    op.drop_index('ix_dream_interpretations_user_id', table_name='dream_interpretations')
    
    # Drop table
    op.drop_table('dream_interpretations')
