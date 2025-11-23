"""add shop tables

Revision ID: 009
Revises: 008
Create Date: 2025-01-22

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '009'
down_revision = '008'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create products table
    op.create_table(
        'products',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('category', sa.String(100), nullable=False),
        sa.Column('price', sa.Numeric(10, 2), nullable=False),
        sa.Column('currency', sa.String(3), nullable=False, server_default='USD'),
        sa.Column('stock_quantity', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('image_url', sa.String(500), nullable=True),
        sa.Column('zodiac_signs', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()'))
    )
    
    # Create orders table
    op.create_table(
        'orders',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('order_number', sa.String(50), nullable=False, unique=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='pending'),
        sa.Column('items', postgresql.JSON(), nullable=False),
        sa.Column('total_amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('currency', sa.String(3), nullable=False, server_default='USD'),
        sa.Column('payment_method', sa.String(50), nullable=True),
        sa.Column('payment_id', sa.String(255), nullable=True),
        sa.Column('shipping_address', postgresql.JSON(), nullable=False),
        sa.Column('tracking_number', sa.String(255), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )
    
    # Create indexes
    op.create_index('ix_products_category', 'products', ['category'])
    op.create_index('ix_products_is_active', 'products', ['is_active'])
    op.create_index('ix_orders_user_id', 'orders', ['user_id'])
    op.create_index('ix_orders_status', 'orders', ['status'])
    op.create_index('ix_orders_order_number', 'orders', ['order_number'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_orders_order_number', 'orders')
    op.drop_index('ix_orders_status', 'orders')
    op.drop_index('ix_orders_user_id', 'orders')
    op.drop_index('ix_products_is_active', 'products')
    op.drop_index('ix_products_category', 'products')
    
    # Drop tables
    op.drop_table('orders')
    op.drop_table('products')
