"""Test Shop API Endpoints"""

import asyncio
import httpx
from decimal import Decimal

BASE_URL = "http://localhost:8000"

# Test credentials (you'll need to register first or use existing user)
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "testpassword123"

# Admin credentials (configure in deps.py)
ADMIN_EMAIL = "admin@mirastros.ru"
ADMIN_PASSWORD = "adminpassword123"


async def register_user(email: str, password: str, full_name: str):
    """Register a new user"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/auth/register",
            json={
                "email": email,
                "password": password,
                "full_name": full_name
            }
        )
        print(f"Register {email}: {response.status_code}")
        if response.status_code == 200:
            return response.json()
        return None


async def login(email: str, password: str):
    """Login and get access token"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/auth/login",
            data={
                "username": email,
                "password": password
            }
        )
        print(f"Login {email}: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            return data.get("access_token")
        return None


async def create_product(token: str):
    """Create a new product (admin only)"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/shop/products",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Amethyst Crystal",
                "description": "Beautiful purple amethyst crystal for meditation and spiritual growth",
                "category": "crystals",
                "price": 29.99,
                "currency": "USD",
                "stock_quantity": 50,
                "image_url": "https://example.com/amethyst.jpg",
                "zodiac_signs": "Pisces,Aquarius,Capricorn",
                "is_active": True
            }
        )
        print(f"\n✨ Create Product: {response.status_code}")
        if response.status_code == 201:
            data = response.json()
            print(f"Product ID: {data['id']}")
            print(f"Name: {data['name']}")
            print(f"Price: ${data['price']}")
            return data
        else:
            print(f"Error: {response.text}")
        return None


async def get_products(token: str = None):
    """Get all products"""
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/shop/products",
            headers=headers,
            params={"page": 1, "page_size": 10}
        )
        print(f"\n📦 Get Products: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Total products: {data['total']}")
            for product in data['products']:
                print(f"  - {product['name']}: ${product['price']} ({product['category']})")
            return data['products']
        return []


async def get_product(product_id: str, token: str = None):
    """Get a specific product"""
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/shop/products/{product_id}",
            headers=headers
        )
        print(f"\n🔍 Get Product {product_id}: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Name: {data['name']}")
            print(f"Description: {data['description']}")
            print(f"Price: ${data['price']}")
            print(f"Stock: {data['stock_quantity']}")
            return data
        return None


async def create_order(token: str, product_id: str, product_name: str, price: float):
    """Create a new order"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/shop/orders",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "items": [
                    {
                        "product_id": product_id,
                        "name": product_name,
                        "quantity": 2,
                        "price": price
                    }
                ],
                "shipping_address": {
                    "name": "John Doe",
                    "address": "123 Main St",
                    "city": "New York",
                    "country": "USA",
                    "postal_code": "10001",
                    "phone": "+1234567890"
                },
                "notes": "Please handle with care"
            }
        )
        print(f"\n🛒 Create Order: {response.status_code}")
        if response.status_code == 201:
            data = response.json()
            print(f"Order Number: {data['order_number']}")
            print(f"Status: {data['status']}")
            print(f"Total: ${data['total_amount']}")
            return data
        else:
            print(f"Error: {response.text}")
        return None


async def get_orders(token: str):
    """Get user's orders"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/shop/orders",
            headers={"Authorization": f"Bearer {token}"},
            params={"limit": 10, "offset": 0}
        )
        print(f"\n📋 Get Orders: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Total orders: {data['total']}")
            for order in data['orders']:
                print(f"  - {order['order_number']}: ${order['total_amount']} ({order['status']})")
            return data['orders']
        return []


async def update_order_status(token: str, order_id: str):
    """Update order status (admin only)"""
    async with httpx.AsyncClient() as client:
        response = await client.patch(
            f"{BASE_URL}/shop/orders/{order_id}/status",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "status": "shipped",
                "tracking_number": "TRACK123456789"
            }
        )
        print(f"\n📦 Update Order Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Order: {data['order_number']}")
            print(f"New Status: {data['status']}")
            print(f"Tracking: {data['tracking_number']}")
            return data
        else:
            print(f"Error: {response.text}")
        return None


async def get_recommendations(token: str):
    """Get product recommendations"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/shop/recommendations",
            headers={"Authorization": f"Bearer {token}"},
            params={"limit": 5}
        )
        print(f"\n⭐ Get Recommendations: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Reason: {data['reason']}")
            print("Recommended products:")
            for product in data['products']:
                print(f"  - {product['name']}: ${product['price']}")
            return data
        else:
            print(f"Error: {response.text}")
        return None


async def main():
    """Run all tests"""
    print("=" * 60)
    print("🧪 Testing Shop API Endpoints")
    print("=" * 60)
    
    # Register and login admin (if needed)
    # await register_user(ADMIN_EMAIL, ADMIN_PASSWORD, "Admin User")
    
    # Login as admin
    admin_token = await login(ADMIN_EMAIL, ADMIN_PASSWORD)
    if not admin_token:
        print("❌ Admin login failed. Please register admin user first.")
        return
    
    # Create a product
    product = await create_product(admin_token)
    if not product:
        print("❌ Failed to create product")
        return
    
    product_id = product['id']
    
    # Get all products
    products = await get_products()
    
    # Get specific product
    await get_product(product_id)
    
    # Register and login regular user
    # await register_user(TEST_EMAIL, TEST_PASSWORD, "Test User")
    user_token = await login(TEST_EMAIL, TEST_PASSWORD)
    if not user_token:
        print("❌ User login failed. Please register user first.")
        return
    
    # Create an order
    order = await create_order(user_token, product_id, product['name'], float(product['price']))
    if not order:
        print("❌ Failed to create order")
        return
    
    order_id = order['id']
    
    # Get user's orders
    await get_orders(user_token)
    
    # Update order status (admin)
    await update_order_status(admin_token, order_id)
    
    # Get recommendations (requires zodiac sign in user profile)
    await get_recommendations(user_token)
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
