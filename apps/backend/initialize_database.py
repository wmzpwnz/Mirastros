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
    return existing_database


if __name__ == '__main__':
    existing_database = asyncio.run(initialize())
    if existing_database:
        # Run Alembic after asyncio.run has closed the initializer's event
        # loop. Alembic's async env owns a loop of its own.
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
