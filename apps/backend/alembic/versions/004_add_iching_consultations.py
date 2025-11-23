"""add iching consultations table

Revision ID: 004
Revises: 003
Create Date: 2025-11-21 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create iching_consultations table
    op.create_table(
        'iching_consultations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('question', sa.Text(), nullable=False),
        sa.Column('method', sa.String(length=20), nullable=False),
        sa.Column('primary_hexagram_number', sa.Integer(), nullable=False),
        sa.Column('primary_hexagram_data', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('changing_lines', postgresql.ARRAY(sa.Integer()), nullable=True),
        sa.Column('resulting_hexagram_number', sa.Integer(), nullable=True),
        sa.Column('resulting_hexagram_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('interpretation', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create index on user_id for faster queries
    op.create_index(
        'ix_iching_consultations_user_id',
        'iching_consultations',
        ['user_id']
    )
    
    # Create index on created_at for sorting
    op.create_index(
        'ix_iching_consultations_created_at',
        'iching_consultations',
        ['created_at']
    )
    
    # Create index on primary_hexagram_number for analytics
    op.create_index(
        'ix_iching_consultations_primary_hexagram',
        'iching_consultations',
        ['primary_hexagram_number']
    )


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_iching_consultations_primary_hexagram', table_name='iching_consultations')
    op.drop_index('ix_iching_consultations_created_at', table_name='iching_consultations')
    op.drop_index('ix_iching_consultations_user_id', table_name='iching_consultations')
    
    # Drop table
    op.drop_table('iching_consultations')
