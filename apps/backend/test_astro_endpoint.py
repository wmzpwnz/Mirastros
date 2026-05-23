#!/usr/bin/env python3
"""
Full test of /astro/merge endpoint
"""

import asyncio
import httpx
import json
import sys

BASE_URL = "http://localhost:8000"
TEST_EMAIL = "ddiseen@gmail.com"
# Попробуем несколько распространенных паролей или попросим ввести
TEST_PASSWORDS = ["password", "123456", "test123", ""]


async def test_astro_merge():
    """Test the /astro/merge endpoint"""
    async with httpx.AsyncClient(timeout=10.0) as client:
        print("🧪 Testing /astro/merge endpoint\n")
        
        # Step 1: Try to login
        print("Step 1: Attempting to login...")
        token = None
        
        # Если пароль не указан, попробуем несколько вариантов
        if len(sys.argv) > 1:
            password = sys.argv[1]
        else:
            print("   ⚠️  No password provided. Trying common passwords...")
            password = None
            for pwd in TEST_PASSWORDS:
                if not pwd:
                    continue
                try:
                    response = await client.post(
                        f"{BASE_URL}/auth/login",
                        json={"email": TEST_EMAIL, "password": pwd}
                    )
                    if response.status_code == 200:
                        data = response.json()
                        token = data.get("access_token")
                        print(f"   ✅ Login successful with password '{pwd}'")
                        break
                except:
                    pass
        
        if not token and password:
            try:
                response = await client.post(
                    f"{BASE_URL}/auth/login",
                    json={"email": TEST_EMAIL, "password": password}
                )
                if response.status_code == 200:
                    data = response.json()
                    token = data.get("access_token")
                    print(f"   ✅ Login successful")
                else:
                    print(f"   ❌ Login failed: {response.status_code} - {response.text[:100]}")
            except Exception as e:
                print(f"   ❌ Login error: {e}")
        
        if not token:
            print("\n   ⚠️  Could not get token. Please provide password:")
            print(f"   python test_astro_endpoint.py YOUR_PASSWORD")
            print("\n   Or login manually and test in Postman:")
            print(f"   POST {BASE_URL}/astro/merge")
            print("   Header: Authorization: Bearer YOUR_TOKEN")
            return
        
        # Step 2: Test /astro/merge endpoint
        print(f"\nStep 2: Testing POST {BASE_URL}/astro/merge")
        print(f"   Token: {token[:20]}...")
        
        try:
            response = await client.post(
                f"{BASE_URL}/astro/merge",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
            )
            
            print(f"\n📥 Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Success! Response:")
                print(json.dumps(data, indent=2, ensure_ascii=False))
                
                # Check response format
                if "natal" in data and "arcana" in data and "dream" in data and "question" in data:
                    print("\n✅ Response format is correct!")
                    print(f"   - natal: {bool(data.get('natal'))}")
                    print(f"   - arcana: {data.get('arcana')}")
                    print(f"   - dream: {data.get('dream')}")
                    print(f"   - question: {data.get('question')}")
                    return True
                elif "status" in data:
                    print(f"\n⚠️  Status: {data['status']}")
                    return False
                else:
                    print("\n⚠️  Unexpected response format")
                    return False
            else:
                print(f"❌ Error: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
            return False


if __name__ == "__main__":
    asyncio.run(test_astro_merge())



