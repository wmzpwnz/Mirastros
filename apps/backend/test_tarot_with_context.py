#!/usr/bin/env python3
"""
Test tarot reading with astro context merge
Checks if context (волк, переезд, 16) appears in interpretation
"""

import asyncio
import httpx
import json
import sys
import re

BASE_URL = "http://localhost:8000"
TEST_EMAIL = "ddiseen@gmail.com"


async def test_tarot_with_context(password: str = None):
    """Test tarot reading and check if context is merged"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        print("🧪 Testing Tarot Reading with Astro Context Merge\n")
        
        # Step 1: Login
        print("Step 1: Logging in...")
        if not password:
            print("   ⚠️  No password provided, trying common passwords...")
            # Попробуем несколько вариантов
            common_passwords = ["password", "123456", "test123", "mirastros", "ddiseen"]
            token = None
            for pwd in common_passwords:
                try:
                    response = await client.post(
                        f"{BASE_URL}/auth/login",
                        json={"email": TEST_EMAIL, "password": pwd}
                    )
                    if response.status_code == 200:
                        data = response.json()
                        token = data.get("access_token")
                        if token:
                            print(f"   ✅ Login successful with password '{pwd}'")
                            break
                except:
                    pass
            
            if not token:
                print("   ❌ Could not login with common passwords")
                print("   Usage: python test_tarot_with_context.py YOUR_PASSWORD")
                return False
        else:
            # Используем предоставленный пароль
            try:
                response = await client.post(
                    f"{BASE_URL}/auth/login",
                    json={"email": TEST_EMAIL, "password": password}
                )
                
                if response.status_code != 200:
                    print(f"   ❌ Login failed: {response.status_code}")
                    print(f"   Response: {response.text[:200]}")
                    return False
                
                data = response.json()
                token = data.get("access_token")
                if not token:
                    print("   ❌ No access_token in response")
                    return False
                
                print(f"   ✅ Login successful")
                print(f"   Token: {token[:30]}...")
                
            except Exception as e:
                print(f"   ❌ Login error: {e}")
                return False
        
        # Step 2: Perform tarot reading
        print(f"\nStep 2: Performing tarot reading...")
        print(f"   Request: POST {BASE_URL}/tarot/reading")
        print(f"   Body: {{'spread_type': 'one-card', 'question': 'Что ждёт меня на новой работе?'}}")
        
        try:
            response = await client.post(
                f"{BASE_URL}/tarot/reading",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                json={
                    "spread_type": "one-card",
                    "question": "Что ждёт меня на новой работе?"
                }
            )
            
            print(f"\n📥 Response Status: {response.status_code}")
            
            if response.status_code != 200:
                print(f"   ❌ Error: {response.status_code}")
                print(f"   Response: {response.text[:500]}")
                return False
            
            data = response.json()
            interpretation = data.get("interpretation", "")
            
            print(f"\n✅ Tarot reading successful!")
            print(f"\n📋 Interpretation (first 500 chars):")
            print("   " + interpretation[:500] + ("..." if len(interpretation) > 500 else ""))
            
            # Step 3: Check for context keywords
            print(f"\nStep 3: Checking if context is merged...")
            print("   Looking for: 'волк', 'переезд', '16', 'Отшельник'")
            
            keywords_found = []
            
            # Check for "волк" (from dream_symbols)
            if re.search(r'\bволк\w*\b', interpretation, re.IGNORECASE):
                keywords_found.append("волк")
                print("   ✅ Found: 'волк' (from dream_symbols)")
            
            # Check for "переезд" (from last_question)
            if re.search(r'\bпереезд\w*\b', interpretation, re.IGNORECASE):
                keywords_found.append("переезд")
                print("   ✅ Found: 'переезд' (from last_question)")
            
            # Check for "16" or "Отшельник" (from last_arcana)
            if re.search(r'\b16\b', interpretation) or re.search(r'\bОтшельник\w*\b', interpretation, re.IGNORECASE):
                keywords_found.append("16/Отшельник")
                print("   ✅ Found: '16' or 'Отшельник' (from last_arcana)")
            
            if keywords_found:
                print(f"\n🎉 SUCCESS! Brain is working!")
                print(f"   Found keywords: {', '.join(keywords_found)}")
                print(f"   Context merge is working correctly!")
                return True
            else:
                print(f"\n⚠️  WARNING: No context keywords found in interpretation")
                print(f"   This means merge might not be working")
                print(f"   Check if merge_astro_context is called in tarot_service")
                return False
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
            import traceback
            traceback.print_exc()
            return False


if __name__ == "__main__":
    password = sys.argv[1] if len(sys.argv) > 1 else None
    result = asyncio.run(test_tarot_with_context(password))
    sys.exit(0 if result else 1)

