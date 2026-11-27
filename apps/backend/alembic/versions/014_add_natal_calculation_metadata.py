"""Persist reproducible natal chart calculation metadata.

Revision ID: 014_natal_metadata
Revises: 621c0e90faba
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "014_natal_metadata"
down_revision = "621c0e90faba"
branch_labels = None
depends_on = None


def upgrade() -> None:
    existing = {
        column['name']
        for column in sa.inspect(op.get_bind()).get_columns('natal_charts')
    }
    if 'calculation_metadata' not in existing:
        op.add_column(
            "natal_charts",
            sa.Column(
                "calculation_metadata",
                postgresql.JSON(astext_type=sa.Text()),
                nullable=False,
                server_default=sa.text("'{}'::json"),
            ),
        )
    op.alter_column("natal_charts", "calculation_metadata", server_default=None)


def downgrade() -> None:
    op.drop_column("natal_charts", "calculation_metadata")
