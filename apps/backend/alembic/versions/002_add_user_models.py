"""Add User, NatalChart, and Subscription models

Revision ID: 002
Revises: 001
Create Date: 2025-11-21
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSON

# revision identifiers
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None

def upgrade():
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('birth_date', sa.Date(), nullable=True),
        sa.Column('birth_time', sa.Time(), nullable=True),
        sa.Column('birth_location', JSON, nullable=True),
        sa.Column('zodiac_sign', sa.String(length=50), nullable=True),
        sa.Column('subscription_tier', sa.Enum('freemium', 'premium', 'platinum', name='subscriptiontier'), nullable=False),
        sa.Column('subscription_expires', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.Column('google_id', sa.String(length=255), nullable=True),
        sa.Column('apple_id', sa.String(length=255), nullable=True),
        sa.Column('telegram_id', sa.String(length=255), nullable=True),
        sa.Column('vk_id', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_google_id'), 'users', ['google_id'], unique=True)
    op.create_index(op.f('ix_users_apple_id'), 'users', ['apple_id'], unique=True)
    op.create_index(op.f('ix_users_telegram_id'), 'users', ['telegram_id'], unique=True)
    op.create_index(op.f('ix_users_vk_id'), 'users', ['vk_id'], unique=True)
    
    # Create natal_charts table
    op.create_table(
        'natal_charts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('planets', JSON, nullable=False),
        sa.Column('houses', JSON, nullable=False),
        sa.Column('aspects', JSON, nullable=False),
        sa.Column('ascendant', JSON, nullable=True),
        sa.Column('midheaven', JSON, nullable=True),
        sa.Column('lunar_nodes', JSON, nullable=True),
        sa.Column('house_system', JSON, nullable=True),
        sa.Column('calculated_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_natal_charts_id'), 'natal_charts', ['id'], unique=False)
    op.create_index(op.f('ix_natal_charts_user_id'), 'natal_charts', ['user_id'], unique=True)
    
    # Create subscriptions table
    op.create_table(
        'subscriptions',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('tier', sa.String(length=50), nullable=False),
        sa.Column('status', sa.Enum('active', 'cancelled', 'expired', 'pending', name='subscriptionstatus'), nullable=False),
        sa.Column('payment_method', sa.Enum('stripe', 'yookassa', 'revenue_cat', 'telegram_stars', 'vk_pay', name='paymentmethod'), nullable=False),
        sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('currency', sa.String(length=3), nullable=False),
        sa.Column('stripe_subscription_id', sa.String(length=255), nullable=True),
        sa.Column('yookassa_payment_id', sa.String(length=255), nullable=True),
        sa.Column('revenue_cat_transaction_id', sa.String(length=255), nullable=True),
        sa.Column('starts_at', sa.DateTime(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('cancelled_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('auto_renew', sa.String(length=10), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_subscriptions_id'), 'subscriptions', ['id'], unique=False)
    op.create_index(op.f('ix_subscriptions_user_id'), 'subscriptions', ['user_id'], unique=False)

def downgrade():
    op.drop_index(op.f('ix_subscriptions_user_id'), table_name='subscriptions')
    op.drop_index(op.f('ix_subscriptions_id'), table_name='subscriptions')
    op.drop_table('subscriptions')
    
    op.drop_index(op.f('ix_natal_charts_user_id'), table_name='natal_charts')
    op.drop_index(op.f('ix_natal_charts_id'), table_name='natal_charts')
    op.drop_table('natal_charts')
    
    op.drop_index(op.f('ix_users_vk_id'), table_name='users')
    op.drop_index(op.f('ix_users_telegram_id'), table_name='users')
    op.drop_index(op.f('ix_users_apple_id'), table_name='users')
    op.drop_index(op.f('ix_users_google_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS subscriptiontier')
    op.execute('DROP TYPE IF EXISTS subscriptionstatus')
    op.execute('DROP TYPE IF EXISTS paymentmethod')
