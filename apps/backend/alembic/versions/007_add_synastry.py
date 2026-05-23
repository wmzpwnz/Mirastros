"""Add synastry table

Revision ID: 007
Revises: 006
Create Date: 2025-11-21

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '006_3'
down_revision = '006_2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create synastries table
    op.create_table(
        'synastries',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('person1_name', sa.String(length=100), nullable=False),
        sa.Column('person1_chart', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('person2_name', sa.String(length=100), nullable=False),
        sa.Column('person2_chart', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('aspects', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('compatibility_score', sa.Float(), nullable=False),
        sa.Column('relationship_type', sa.String(length=50), nullable=False),
        sa.Column('interpretation', sa.String(), nullable=True),
        sa.Column('strengths', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('challenges', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('advice', sa.String(), nullable=True),
        sa.Column('calculated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create index on user_id for faster queries
    op.create_index(
        'ix_synastries_user_id',
        'synastries',
        ['user_id'],
        unique=False
    )
    
    # Create index on calculated_at for sorting
    op.create_index(
        'ix_synastries_calculated_at',
        'synastries',
        ['calculated_at'],
        unique=False
    )


def downgrade() -> None:
    op.drop_index('ix_synastries_calculated_at', table_name='synastries')
    op.drop_index('ix_synastries_user_id', table_name='synastries')
    op.drop_table('synastries')
