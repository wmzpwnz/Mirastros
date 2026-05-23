#!/usr/bin/env python3
"""
Create all database tables from models
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import get_settings

settings = get_settings()
from app.models import User, NatalChart, Subscription, TarotReading, IChingConsultation, Horoscope, NumerologyCalculation, DestinyMatrix, DreamInterpretation, ChatConversation, ChatMessage, JournalEntry, Product, Order, AnalyticsEvent, PushToken, NotificationPreference, LenormandReading, Synastry
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

# Import Base from the actual models
from app.models.user import Base as UserBase

async def create_tables():
    """Create all tables in the database"""
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=True,
    )

    async with engine.begin() as conn:
        # Drop all tables first (be careful!)
        print("Dropping all tables except users and alembic_version...")
        await conn.run_sync(drop_all_except_users)

        # Create all tables
        print("Creating all tables...")
        await conn.run_sync(UserBase.metadata.create_all)

    await engine.dispose()
    print("Done!")

def drop_all_except_users(connection):
    """Drop all tables except users and alembic_version"""
    from sqlalchemy import text

    # Get list of all tables
    result = connection.execute(text("""
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename NOT IN ('users', 'alembic_version')
    """))

    tables = [row[0] for row in result]

    for table in tables:
        print(f"Dropping table: {table}")
        connection.execute(text(f'DROP TABLE IF EXISTS "{table}" CASCADE'))

    print(f"Dropped {len(tables)} tables")

if __name__ == "__main__":
    asyncio.run(create_tables())
