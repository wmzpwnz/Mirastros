"""Initialize only a new, empty database. Never drop or rewrite existing tables."""
import asyncio
import sys
from sqlalchemy import inspect, text
from app.core.database import Base, engine
import app.models  # noqa: F401


async def initialize():
    existing_database = False
    schema_state = None
    async with engine.begin() as connection:
        tables = (await connection.execute(text(
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
        ))).scalars().all()
        if tables:
            if '--if-empty' in sys.argv:
                existing_database = True
                def read_schema(sync_connection):
                    inspector = inspect(sync_connection)
                    names = set(inspector.get_table_names())
                    columns = {
                        name: {column['name'] for column in inspector.get_columns(name)}
                        for name in names
                    }
                    version = None
                    if 'alembic_version' in names:
                        version = sync_connection.execute(
                            text('SELECT version_num FROM alembic_version LIMIT 1')
                        ).scalar()
                    return names, columns, version

                schema_state = await connection.run_sync(read_schema)
            else:
                raise RuntimeError("Database is not empty. Apply reviewed migrations instead.")
        else:
            await connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            await connection.run_sync(Base.metadata.create_all)
    await engine.dispose()
    return existing_database, schema_state


if __name__ == '__main__':
    existing_database, schema_state = asyncio.run(initialize())
    if existing_database:
        # Run Alembic after asyncio.run has closed the initializer's event
        # loop. Alembic's async env owns a loop of its own.
        from alembic import command
        from alembic.config import Config

        config = Config("alembic.ini")
        names, columns, version = schema_state

        # Old production databases were created directly from SQLAlchemy
        # metadata and never received an Alembic baseline. Verify that the
        # complete application schema is already present before adopting it.
        expected = {
            table.name: {column.name for column in table.columns}
            for table in Base.metadata.sorted_tables
        }
        expected.get('users', set()).difference_update(
            {'preferred_language', 'timezone'}
        )
        expected.get('natal_charts', set()).discard('calculation_metadata')
        missing = {
            table: sorted(required - columns.get(table, set()))
            for table, required in expected.items()
            if table not in names or required - columns.get(table, set())
        }
        if missing:
            details = '; '.join(
                f"{table}: {', '.join(fields)}" for table, fields in missing.items()
            )
            raise RuntimeError(
                'Existing database schema is incomplete; no migration baseline was changed: '
                + details
            )

        # Partial first attempts can leave Alembic stamped at an old revision
        # even though all current model tables already exist. In that case,
        # adopt the verified pre-sync baseline and let only forward migrations
        # run. Revision 013's descendant migrations normalize legacy indexes
        # and add user/natal metadata columns.
        known_current = {'013', 'a413fe158cd7', '621c0e90faba', '014_natal_metadata'}
        if version not in known_current:
            command.stamp(config, '013')
        command.upgrade(config, "head")
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
