#!/usr/bin/env python3
"""
Test script for /astro/merge endpoint
Creates test data and tests the endpoint
"""

import asyncio
import httpx
import json
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select
from app.core.config import get_settings
from app.models.user import User
from app.models.astro_context import AstroContext
import uuid

settings = get_settings()

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def create_test_data():
    """Create test astro_context data for a user"""
    async with AsyncSessionLocal() as db:
        try:
            # Find first user
            result = await db.execute(select(User).limit(1))
            user = result.scalar_one_or_none()
            
            if not user:
                print("❌ No users found in database. Please create a user first.")
                return None
            
            print(f"✅ Found user: {user.email} (ID: {user.id})")
            
            # Check if astro_context already exists
            result = await db.execute(
                select(AstroContext).filter_by(user_id=user.id)
            )
            ctx = result.scalar_one_or_none()
            
            if ctx:
                print(f"✅ AstroContext already exists for user {user.id}")
                # Update it with test data
                ctx.natal_data = {
                    "planets": {
                        "sun": {"sign": "Leo", "degree": 15.5, "house": 5},
                        "moon": {"sign": "Scorpio", "degree": 22.3, "house": 8}
                    },
                    "houses": [
                        {"number": 1, "sign": "Aries", "degree": 10.0}
                    ],
                    "aspects": [
                        {"planet1": "Sun", "planet2": "Moon", "type": "trine", "degree": 120}
                    ]
                }
                ctx.last_arcana = 16
                ctx.dream_symbols = {"волк": "страх"}
                ctx.last_question = "когда переезд?"
            else:
                # Create new astro_context
                ctx = AstroContext(
                    id=uuid.uuid4(),
                    user_id=user.id,
                    natal_data={
                        "planets": {
                            "sun": {"sign": "Leo", "degree": 15.5, "house": 5},
                            "moon": {"sign": "Scorpio", "degree": 22.3, "house": 8}
                        },
                        "houses": [
                            {"number": 1, "sign": "Aries", "degree": 10.0}
                        ],
                        "aspects": [
                            {"planet1": "Sun", "planet2": "Moon", "type": "trine", "degree": 120}
                        ]
                    },
                    last_arcana=16,
                    dream_symbols={"волк": "страх"},
                    last_question="когда переезд?"
                )
                db.add(ctx)
                print(f"✅ Created new AstroContext for user {user.id}")
            
            await db.commit()
            await db.refresh(ctx)
            
            print(f"\n📊 Test data created:")
            print(f"   - natal_data: {json.dumps(ctx.natal_data, indent=2, ensure_ascii=False)}")
            print(f"   - last_arcana: {ctx.last_arcana}")
            print(f"   - dream_symbols: {ctx.dream_symbols}")
            print(f"   - last_question: {ctx.last_question}")
            
            return user.id
            
        except Exception as e:
            await db.rollback()
            print(f"❌ Error creating test data: {e}")
            import traceback
            traceback.print_exc()
            return None


async def test_endpoint(user_id: str, token: str):
    """Test the /astro/merge endpoint"""
    BASE_URL = "http://localhost:8000"
    
    async with httpx.AsyncClient() as client:
        try:
            print(f"\n🧪 Testing POST {BASE_URL}/astro/merge")
            print(f"   Token: {token[:20]}...")
            
            response = await client.post(
                f"{BASE_URL}/astro/merge",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
            )
            
            print(f"\n📥 Response Status: {response.status_code}")
            print(f"📥 Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Success! Response:")
                print(json.dumps(data, indent=2, ensure_ascii=False))
                
                # Check if response matches expected format
                if "natal" in data and "arcana" in data and "dream" in data and "question" in data:
                    print("\n✅ Response format is correct!")
                    return True
                elif "status" in data and data["status"] == "no_context_yet":
                    print("\n⚠️  No context found (this is expected if data wasn't created)")
                    return False
                else:
                    print("\n⚠️  Unexpected response format")
                    return False
            else:
                print(f"❌ Error: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error testing endpoint: {e}")
            import traceback
            traceback.print_exc()
            return False


async def main():
    """Main test function"""
    print("🚀 Testing /astro/merge endpoint\n")
    
    # Step 1: Create test data
    print("Step 1: Creating test data...")
    user_id = await create_test_data()
    
    if not user_id:
        print("\n❌ Cannot proceed without user_id")
        return
    
    # Step 2: Get token (user needs to provide)
    print("\n" + "="*60)
    print("Step 2: Testing endpoint")
    print("="*60)
    print("\n⚠️  You need to provide a valid JWT token for testing.")
    print("   Get it by logging in via POST /auth/login")
    print("\n   Example:")
    print("   curl -X POST http://localhost:8000/auth/login \\")
    print("     -H 'Content-Type: application/json' \\")
    print("     -d '{\"email\": \"your@email.com\", \"password\": \"yourpassword\"}'")
    print("\n   Then use the 'access_token' from the response.")
    print("\n" + "-"*60)
    
    token = input("Enter JWT token (or press Enter to skip endpoint test): ").strip()
    
    if token:
        await test_endpoint(str(user_id), token)
    else:
        print("\n⏭️  Skipping endpoint test")
        print("\n✅ Test data created. You can now test in Postman:")
        print(f"   POST http://localhost:8000/astro/merge")
        print(f"   Header: Authorization: Bearer YOUR_TOKEN")
    
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())



