"""Add email verification and password reset fields

Revision ID: 011
Revises: 010
Create Date: 2025-11-23

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '011'
down_revision = '010'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add email verification fields
    op.add_column('users', sa.Column('email_verified', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('email_verification_token', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('email_verification_expires', sa.DateTime(), nullable=True))
    
    # Add password reset fields
    op.add_column('users', sa.Column('password_reset_token', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('password_reset_expires', sa.DateTime(), nullable=True))
    
    # Make password_hash nullable for social-only accounts
    op.alter_column('users', 'password_hash', nullable=True)


def downgrade() -> None:
    # Remove email verification fields
    op.drop_column('users', 'email_verified')
    op.drop_column('users', 'email_verification_token')
    op.drop_column('users', 'email_verification_expires')
    
    # Remove password reset fields
    op.drop_column('users', 'password_reset_token')
    op.drop_column('users', 'password_reset_expires')
    
    # Make password_hash not nullable again
    op.alter_column('users', 'password_hash', nullable=False)
