"""add journal entries table

Revision ID: 008
Revises: 007
Create Date: 2025-11-22

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '008'
down_revision = '007'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create entry_type enum (use DO block to avoid duplicate error)
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entrytype') THEN
                CREATE TYPE entrytype AS ENUM ('dream', 'meditation', 'reading', 'ritual', 'reflection', 'other');
            END IF;
        END $$;
    """)
    entry_type_enum = postgresql.ENUM(
        'dream', 'meditation', 'reading', 'ritual', 'reflection', 'other',
        name='entrytype',
        create_type=False
    )
    
    # Create journal_entries table
    op.create_table(
        'journal_entries',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('entry_type', entry_type_enum, nullable=False, server_default='reflection'),
        sa.Column('tags', postgresql.JSONB(), nullable=True),
        sa.Column('metadata', postgresql.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
    )
    
    # Create index on user_id for faster queries
    op.create_index('ix_journal_entries_user_id', 'journal_entries', ['user_id'])
    
    # Create index on created_at for sorting
    op.create_index('ix_journal_entries_created_at', 'journal_entries', ['created_at'])
    
    # Create index on entry_type for filtering
    op.create_index('ix_journal_entries_entry_type', 'journal_entries', ['entry_type'])
    
    # Create GIN index on tags for efficient tag filtering (jsonb_path_ops for jsonb)
    op.execute(
        "CREATE INDEX ix_journal_entries_tags ON journal_entries USING gin (tags jsonb_path_ops)"
    )


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_journal_entries_tags', table_name='journal_entries')
    op.drop_index('ix_journal_entries_entry_type', table_name='journal_entries')
    op.drop_index('ix_journal_entries_created_at', table_name='journal_entries')
    op.drop_index('ix_journal_entries_user_id', table_name='journal_entries')
    
    # Drop table
    op.drop_table('journal_entries')
    
    # Drop enum type
    entry_type_enum = postgresql.ENUM(
        'dream', 'meditation', 'reading', 'ritual', 'reflection', 'other',
        name='entrytype'
    )
    entry_type_enum.drop(op.get_bind(), checkfirst=True)
