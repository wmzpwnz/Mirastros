"""add numerology calculations table

Revision ID: 006
Revises: 005
Create Date: 2025-11-21 18:00:00.000000

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
    # Create numerology_calculations table
    op.create_table(
        'numerology_calculations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('birth_date', sa.String(length=10), nullable=False),
        sa.Column('life_path_number', sa.Integer(), nullable=False),
        sa.Column('destiny_number', sa.Integer(), nullable=False),
        sa.Column('soul_urge_number', sa.Integer(), nullable=False),
        sa.Column('personality_number', sa.Integer(), nullable=False),
        sa.Column('interpretation', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create index on user_id for faster queries
    op.create_index(
        'ix_numerology_calculations_user_id',
        'numerology_calculations',
        ['user_id']
    )
    
    # Create index on created_at for sorting
    op.create_index(
        'ix_numerology_calculations_created_at',
        'numerology_calculations',
        ['created_at']
    )
    
    # Create index on life_path_number for analytics
    op.create_index(
        'ix_numerology_calculations_life_path',
        'numerology_calculations',
        ['life_path_number']
    )


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_numerology_calculations_life_path', table_name='numerology_calculations')
    op.drop_index('ix_numerology_calculations_created_at', table_name='numerology_calculations')
    op.drop_index('ix_numerology_calculations_user_id', table_name='numerology_calculations')
    
    # Drop table
    op.drop_table('numerology_calculations')
