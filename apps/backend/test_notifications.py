"""
Test script for push notification functionality
"""
import asyncio
import httpx
from datetime import datetime

BASE_URL = "http://localhost:8000"

async def test_notifications():
    """Test notification endpoints"""
    
    print("🧪 Testing Push Notification System\n")
    
    # Test data
    test_user_id = "test-user-123"
    test_push_token = "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
    
    async with httpx.AsyncClient() as client:
        # 1. Register push token
        print("1️⃣ Testing push token registration...")
        try:
            response = await client.post(
                f"{BASE_URL}/notifications/register",
                json={
                    "user_id": test_user_id,
                    "push_token": test_push_token,
                    "platform": "ios",
                    "device_type": "iPhone 14 Pro"
                }
            )
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.json()}\n")
        except Exception as e:
            print(f"   ❌ Error: {e}\n")
        
        # 2. Subscribe to transit notifications
        print("2️⃣ Testing transit subscription...")
        try:
            response = await client.post(
                f"{BASE_URL}/notifications/subscribe/transits",
                json={
                    "user_id": test_user_id,
                    "transit_types": ["major", "minor"]
                }
            )
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.json()}\n")
        except Exception as e:
            print(f"   ❌ Error: {e}\n")
        
        # 3. Subscribe to lunar notifications
        print("3️⃣ Testing lunar subscription...")
        try:
            response = await client.post(
                f"{BASE_URL}/notifications/subscribe/lunar",
                json={
                    "user_id": test_user_id
                }
            )
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.json()}\n")
        except Exception as e:
            print(f"   ❌ Error: {e}\n")
        
        # 4. Get notification preferences
        print("4️⃣ Testing get preferences...")
        try:
            response = await client.get(
                f"{BASE_URL}/notifications/preferences/{test_user_id}"
            )
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.json()}\n")
        except Exception as e:
            print(f"   ❌ Error: {e}\n")
        
        # 5. Update notification preferences
        print("5️⃣ Testing update preferences...")
        try:
            response = await client.put(
                f"{BASE_URL}/notifications/preferences/{test_user_id}",
                json={
                    "daily_horoscope": True,
                    "daily_horoscope_time": "08:00",
                    "transits": True,
                    "lunar_phases": True,
                    "reminders": True
                }
            )
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.json()}\n")
        except Exception as e:
            print(f"   ❌ Error: {e}\n")
        
        # 6. Send test transit notification
        print("6️⃣ Testing send transit notification...")
        try:
            response = await client.post(
                f"{BASE_URL}/notifications/send/transit",
                params={
                    "user_id": test_user_id,
                    "transit_name": "Mercury Retrograde",
                    "transit_description": "Mercury is going retrograde. Be careful with communication and technology."
                }
            )
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.json()}\n")
        except Exception as e:
            print(f"   ❌ Error: {e}\n")
        
        # 7. Send test lunar notification
        print("7️⃣ Testing send lunar notification...")
        try:
            response = await client.post(
                f"{BASE_URL}/notifications/send/lunar",
                params={
                    "user_id": test_user_id,
                    "phase_name": "Full Moon in Aries",
                    "phase_description": "The full moon in Aries brings powerful energy for new beginnings."
                }
            )
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.json()}\n")
        except Exception as e:
            print(f"   ❌ Error: {e}\n")
        
        # 8. Unregister push token
        print("8️⃣ Testing push token unregistration...")
        try:
            response = await client.post(
                f"{BASE_URL}/notifications/unregister",
                json={
                    "user_id": test_user_id,
                    "push_token": test_push_token
                }
            )
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.json()}\n")
        except Exception as e:
            print(f"   ❌ Error: {e}\n")
    
    print("✅ Notification tests completed!")


if __name__ == "__main__":
    asyncio.run(test_notifications())
