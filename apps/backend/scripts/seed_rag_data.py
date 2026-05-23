
import asyncio
import sys
import os
from typing import List

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import AsyncSessionLocal
from app.services.rag import rag_service
from app.models.document import Document

# Sample data to seed the RAG system
ASTROLOGY_DATA = [
    {
        "title": "Aries Zodiac Sign",
        "content": "Aries is the first sign of the zodiac (March 21 – April 19). It is a cardinal fire sign ruled by Mars. Aries people are known for being energetic, impulsive, independent, and courageous. They often take initiative and are natural leaders. Their weaknesses can include impatience and a hot temper.",
        "category": "astrology"
    },
    {
        "title": "Taurus Zodiac Sign",
        "content": "Taurus is the second sign of the zodiac (April 20 – May 20). It is a fixed earth sign ruled by Venus. Taurus is associated with stability, reliability, sensory pleasure, and material security. Taureans are patient and determined but can be stubborn.",
        "category": "astrology"
    },
    {
        "title": "Gemini Zodiac Sign",
        "content": "Gemini is the third sign of the zodiac (May 21 – June 20). It is a mutable air sign ruled by Mercury. Geminis are adaptable, communicative, curious, and intellectual. They love gathering information and socializing but can be indecisive or restless.",
        "category": "astrology"
    },
    {
        "title": "Cancer Zodiac Sign",
        "content": "Cancer is the fourth sign of the zodiac (June 21 – July 22). It is a cardinal water sign ruled by the Moon. Cancers are emotional, nurturing, intuitive, and protective. They value home and family highly but can be moody or overly sensitive.",
        "category": "astrology"
    },
    {
        "title": "Leo Zodiac Sign",
        "content": "Leo is the fifth sign of the zodiac (July 23 – August 22). It is a fixed fire sign ruled by the Sun. Leos are charismatic, generous, creative, and confident. They love being in the spotlight and leading others, but can sometimes be arrogant.",
        "category": "astrology"
    },
    {
        "title": "Daily Horoscope Context",
        "content": "A daily horoscope provides guidance based on the transiting planets' positions relative to a zodiac sign. It typically covers themes of love, career, and general energy. The Moon's position is particularly important for daily moods.",
        "category": "astrology"
    }
]

TAROT_DATA = [
    {
        "title": "The Fool",
        "content": "The Fool (0) represents new beginnings, spontaneity, innocence, and a free spirit. It suggests taking a leap of faith. Reversed, it can mean recklessness, risk-taking without thought, or naivety.",
        "category": "tarot"
    },
    {
        "title": "The Magician",
        "content": "The Magician (I) represents manifestation, resourcefulness, power, and inspired action. You have all the tools you need to succeed. Reversed, it implies manipulation, poor planning, or untapped talents.",
        "category": "tarot"
    },
    {
        "title": "The High Priestess",
        "content": "The High Priestess (II) symbolizes intuition, sacred knowledge, divine feminine, and the subconscious mind. Trust your inner voice. Reversed, it suggests secrets, disconnectedness from intuition, or withdrawal.",
        "category": "tarot"
    }
]

async def seed_data():
    print("🌟 Starting RAG Data Seeding...")
    
    async with AsyncSessionLocal() as session:
        try:
            # Seed Astrology Data
            print(f"\nSeeding {len(ASTROLOGY_DATA)} astrology documents...")
            for item in ASTROLOGY_DATA:
                print(f"  - Processing: {item['title']}")
                await rag_service.ingest_document(
                    db=session,
                    title=item['title'],
                    content=item['content'],
                    source="System Seed",
                    category=item['category']
                )
            
            # Seed Tarot Data
            print(f"\nSeeding {len(TAROT_DATA)} tarot documents...")
            for item in TAROT_DATA:
                print(f"  - Processing: {item['title']}")
                await rag_service.ingest_document(
                    db=session,
                    title=item['title'],
                    content=item['content'],
                    source="System Seed",
                    category=item['category']
                )

            # Note: We don't need explicit commit here as ingest_document handles it or the context manager does?
            # Checking rag_service.ingest_document implementation: it calls db.commit().
            
            print("\n✅ Seeding completed successfully!")
            
        except Exception as e:
            print(f"\n❌ Seeding failed: {str(e)}")
            raise e

if __name__ == "__main__":
    if os.getenv("EMBEDDING_MODEL") is None:
        # Set default if not in env, trying to ensure it runs
        os.environ["EMBEDDING_MODEL"] = "sentence-transformers/all-MiniLM-L6-v2"
        
    asyncio.run(seed_data())
