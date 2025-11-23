"""Add analytics events table

Revision ID: 010_add_analytics_events
Revises: 009_add_shop_tables
Create Date: 2025-11-23

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '010_add_analytics_events'
down_revision = '009_add_shop_tables'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create analytics_events table
    op.create_table(
        'analytics_events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('event_type', sa.String(), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('platform', sa.String(), nullable=True),
        sa.Column('session_id', sa.String(), nullable=True),
        sa.Column('response_time_ms', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('idx_analytics_event_type', 'analytics_events', ['event_type'])
    op.create_index('idx_analytics_user_id', 'analytics_events', ['user_id'])
    op.create_index('idx_analytics_timestamp', 'analytics_events', ['timestamp'])
    op.create_index('idx_analytics_session_id', 'analytics_events', ['session_id'])
    op.create_index('idx_analytics_platform', 'analytics_events', ['platform'])
    op.create_index('idx_event_type_timestamp', 'analytics_events', ['event_type', 'timestamp'])
    op.create_index('idx_user_timestamp', 'analytics_events', ['user_id', 'timestamp'])
    op.create_index('idx_platform_timestamp', 'analytics_events', ['platform', 'timestamp'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('idx_platform_timestamp', table_name='analytics_events')
    op.drop_index('idx_user_timestamp', table_name='analytics_events')
    op.drop_index('idx_event_type_timestamp', table_name='analytics_events')
    op.drop_index('idx_analytics_platform', table_name='analytics_events')
    op.drop_index('idx_analytics_session_id', table_name='analytics_events')
    op.drop_index('idx_analytics_timestamp', table_name='analytics_events')
    op.drop_index('idx_analytics_user_id', table_name='analytics_events')
    op.drop_index('idx_analytics_event_type', table_name='analytics_events')
    
    # Drop table
    op.drop_table('analytics_events')
