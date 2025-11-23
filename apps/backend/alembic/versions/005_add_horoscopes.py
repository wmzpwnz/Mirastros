"""add horoscopes table

Revision ID: 005
Revises: 004
Create Date: 2025-11-21 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create horoscopes table
    op.create_table(
        'horoscopes',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('zodiac_sign', sa.String(length=50), nullable=False),
        sa.Column('period', sa.Enum('DAILY', 'WEEKLY', 'MONTHLY', name='horoscopeperiod'), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('prediction', sa.Text(), nullable=False),
        sa.Column('lucky_numbers', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('lucky_colors', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('compatibility_signs', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('advice', sa.Text(), nullable=True),
        sa.Column('is_personalized', sa.String(length=10), nullable=False, server_default='false'),
        sa.Column('transit_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for faster queries
    op.create_index(
        'ix_horoscopes_user_id',
        'horoscopes',
        ['user_id']
    )
    
    op.create_index(
        'ix_horoscopes_zodiac_sign',
        'horoscopes',
        ['zodiac_sign']
    )
    
    op.create_index(
        'ix_horoscopes_period',
        'horoscopes',
        ['period']
    )
    
    op.create_index(
        'ix_horoscopes_date',
        'horoscopes',
        ['date']
    )
    
    # Create composite index for common query pattern
    op.create_index(
        'ix_horoscopes_sign_period_date',
        'horoscopes',
        ['zodiac_sign', 'period', 'date']
    )


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_horoscopes_sign_period_date', table_name='horoscopes')
    op.drop_index('ix_horoscopes_date', table_name='horoscopes')
    op.drop_index('ix_horoscopes_period', table_name='horoscopes')
    op.drop_index('ix_horoscopes_zodiac_sign', table_name='horoscopes')
    op.drop_index('ix_horoscopes_user_id', table_name='horoscopes')
    
    # Drop table
    op.drop_table('horoscopes')
    
    # Drop enum type
    op.execute('DROP TYPE horoscopeperiod')
