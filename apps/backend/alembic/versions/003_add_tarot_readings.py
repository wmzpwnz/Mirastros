"""add tarot readings table

Revision ID: 003
Revises: 002
Create Date: 2025-11-21 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create tarot_readings table
    op.create_table(
        'tarot_readings',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('spread_type', sa.String(length=50), nullable=False),
        sa.Column('question', sa.Text(), nullable=True),
        sa.Column('cards', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('interpretation', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create index on user_id for faster queries
    op.create_index(
        'ix_tarot_readings_user_id',
        'tarot_readings',
        ['user_id']
    )
    
    # Create index on created_at for sorting
    op.create_index(
        'ix_tarot_readings_created_at',
        'tarot_readings',
        ['created_at']
    )


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_tarot_readings_created_at', table_name='tarot_readings')
    op.drop_index('ix_tarot_readings_user_id', table_name='tarot_readings')
    
    # Drop table
    op.drop_table('tarot_readings')
