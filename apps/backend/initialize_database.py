"""Initialize only a new, empty database. Never drop or rewrite existing tables."""
import asyncio
import sys
from sqlalchemy import text
from app.core.database import Base, engine
import app.models  # noqa: F401


async def initialize():
    async with engine.begin() as connection:
        tables = (await connection.execute(text(
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
        ))).scalars().all()
        if tables:
            if '--if-empty' in sys.argv:
                print("Existing database preserved; initialization skipped")
                return
            raise RuntimeError("Database is not empty. Apply reviewed migrations instead.")
        await connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await connection.run_sync(Base.metadata.create_all)
    await engine.dispose()
    print("Empty database initialized successfully")


if __name__ == '__main__':
    asyncio.run(initialize())
