"""Initialize only a new, empty database. Never drop or rewrite existing tables."""
import asyncio
import sys
from sqlalchemy import text
from app.core.database import Base, engine
import app.models  # noqa: F401


async def initialize():
    existing_database = False
    async with engine.begin() as connection:
        tables = (await connection.execute(text(
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
        ))).scalars().all()
        if tables:
            if '--if-empty' in sys.argv:
                existing_database = True
            else:
                raise RuntimeError("Database is not empty. Apply reviewed migrations instead.")
        else:
            await connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            await connection.run_sync(Base.metadata.create_all)
    await engine.dispose()
    if existing_database:
        # Production releases call this script with --if-empty before switching
        # the current symlink. Keep user tables intact, but apply reviewed,
        # versioned Alembic migrations before the new app starts using them.
        from alembic import command
        from alembic.config import Config

        command.upgrade(Config("alembic.ini"), "head")
        print("Existing database preserved; reviewed migrations applied")
    else:
        if '--if-empty' in sys.argv:
            # create_all built the current model schema on a brand new
            # production database; record that baseline so future releases
            # apply only migrations introduced after this edition.
            from alembic import command
            from alembic.config import Config

            command.stamp(Config("alembic.ini"), "head")
        print("Empty database initialized successfully")


if __name__ == '__main__':
    asyncio.run(initialize())
