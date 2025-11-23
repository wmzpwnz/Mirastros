"""add lenormand readings table

Revision ID: 006
Revises: 005
Create Date: 2025-11-21 16:00:00.000000

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
    # Create lenormand_readings table
    op.create_table(
        'lenormand_readings',
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
        'ix_lenormand_readings_user_id',
        'lenormand_readings',
        ['user_id']
    )
    
    # Create index on created_at for sorting
    op.create_index(
        'ix_lenormand_readings_created_at',
        'lenormand_readings',
        ['created_at']
    )
    
    # Create index on spread_type for analytics
    op.create_index(
        'ix_lenormand_readings_spread_type',
        'lenormand_readings',
        ['spread_type']
    )


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_lenormand_readings_spread_type', table_name='lenormand_readings')
    op.drop_index('ix_lenormand_readings_created_at', table_name='lenormand_readings')
    op.drop_index('ix_lenormand_readings_user_id', table_name='lenormand_readings')
    
    # Drop table
    op.drop_table('lenormand_readings')
