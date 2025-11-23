"""Test Payment Integration"""

import asyncio
import httpx
from decimal import Decimal

BASE_URL = "http://localhost:8000"

# Test credentials
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "testpassword123"
ADMIN_EMAIL = "admin@mirastros.ru"
ADMIN_PASSWORD = "adminpassword123"


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


async def create_test_product(token: str):
    """Create a test product"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/shop/products",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Test Crystal",
                "description": "Test crystal for payment testing",
                "category": "crystals",
                "price": 49.99,
                "currency": "USD",
                "stock_quantity": 100,
                "is_active": True
            }
        )
        print(f"\n✨ Create Test Product: {response.status_code}")
        if response.status_code == 201:
            data = response.json()
            print(f"Product ID: {data['id']}")
            return data
        return None


async def create_test_order(token: str, product_id: str, product_name: str, price: float):
    """Create a test order"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/shop/orders",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "items": [
                    {
                        "product_id": product_id,
                        "name": product_name,
                        "quantity": 1,
                        "price": price
                    }
                ],
                "shipping_address": {
                    "name": "Test User",
                    "address": "123 Test St",
                    "city": "Test City",
                    "country": "USA",
                    "postal_code": "12345",
                    "phone": "+1234567890"
                }
            }
        )
        print(f"\n🛒 Create Test Order: {response.status_code}")
        if response.status_code == 201:
            data = response.json()
            print(f"Order ID: {data['id']}")
            print(f"Order Number: {data['order_number']}")
            print(f"Total: ${data['total_amount']}")
            return data
        return None


async def create_stripe_payment(token: str, order_id: str):
    """Create a Stripe payment"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/payments/create",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "order_id": order_id,
                "payment_method": "stripe",
                "return_url": "https://mirastros.ru/orders/success"
            }
        )
        print(f"\n💳 Create Stripe Payment: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Payment ID: {data['payment_id']}")
            print(f"Status: {data['status']}")
            print(f"Client Secret: {data.get('client_secret', 'N/A')[:20]}...")
            print("\n📝 To complete payment, use Stripe Elements with this client_secret")
            print("   Test card: 4242 4242 4242 4242")
            print("   Expiry: Any future date")
            print("   CVC: Any 3 digits")
            return data
        else:
            print(f"Error: {response.text}")
        return None


async def create_yookassa_payment(token: str, order_id: str):
    """Create a YooKassa payment"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/payments/create",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "order_id": order_id,
                "payment_method": "yookassa",
                "return_url": "https://mirastros.ru/orders/success"
            }
        )
        print(f"\n💳 Create YooKassa Payment: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Payment ID: {data['payment_id']}")
            print(f"Status: {data['status']}")
            print(f"Confirmation URL: {data.get('confirmation_url', 'N/A')}")
            print("\n📝 To complete payment, open the confirmation URL in browser")
            return data
        else:
            print(f"Error: {response.text}")
        return None


async def get_payment_status(token: str, payment_id: str, payment_method: str):
    """Get payment status"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/payments/status/{payment_id}",
            headers={"Authorization": f"Bearer {token}"},
            params={"payment_method": payment_method}
        )
        print(f"\n🔍 Get Payment Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Payment ID: {data['payment_id']}")
            print(f"Status: {data['status']}")
            print(f"Amount: {data['amount']} {data['currency']}")
            print(f"Paid: {data['paid']}")
            return data
        else:
            print(f"Error: {response.text}")
        return None


async def test_stripe_flow():
    """Test complete Stripe payment flow"""
    print("\n" + "=" * 60)
    print("🧪 Testing Stripe Payment Flow")
    print("=" * 60)
    
    # Login
    admin_token = await login(ADMIN_EMAIL, ADMIN_PASSWORD)
    if not admin_token:
        print("❌ Admin login failed")
        return
    
    user_token = await login(TEST_EMAIL, TEST_PASSWORD)
    if not user_token:
        print("❌ User login failed")
        return
    
    # Create product
    product = await create_test_product(admin_token)
    if not product:
        print("❌ Failed to create product")
        return
    
    # Create order
    order = await create_test_order(
        user_token,
        product['id'],
        product['name'],
        float(product['price'])
    )
    if not order:
        print("❌ Failed to create order")
        return
    
    # Create Stripe payment
    payment = await create_stripe_payment(user_token, order['id'])
    if not payment:
        print("❌ Failed to create payment")
        return
    
    # Get payment status
    await get_payment_status(user_token, payment['payment_id'], 'stripe')
    
    print("\n" + "=" * 60)
    print("✅ Stripe flow test completed!")
    print("=" * 60)


async def test_yookassa_flow():
    """Test complete YooKassa payment flow"""
    print("\n" + "=" * 60)
    print("🧪 Testing YooKassa Payment Flow")
    print("=" * 60)
    
    # Login
    admin_token = await login(ADMIN_EMAIL, ADMIN_PASSWORD)
    if not admin_token:
        print("❌ Admin login failed")
        return
    
    user_token = await login(TEST_EMAIL, TEST_PASSWORD)
    if not user_token:
        print("❌ User login failed")
        return
    
    # Create product
    product = await create_test_product(admin_token)
    if not product:
        print("❌ Failed to create product")
        return
    
    # Create order
    order = await create_test_order(
        user_token,
        product['id'],
        product['name'],
        float(product['price'])
    )
    if not order:
        print("❌ Failed to create order")
        return
    
    # Create YooKassa payment
    payment = await create_yookassa_payment(user_token, order['id'])
    if not payment:
        print("❌ Failed to create payment")
        return
    
    # Get payment status
    await get_payment_status(user_token, payment['payment_id'], 'yookassa')
    
    print("\n" + "=" * 60)
    print("✅ YooKassa flow test completed!")
    print("=" * 60)


async def main():
    """Run all payment tests"""
    print("\n" + "=" * 60)
    print("🧪 Payment Integration Tests")
    print("=" * 60)
    print("\n⚠️  Prerequisites:")
    print("  1. Backend server running on http://localhost:8000")
    print("  2. Admin user registered with email: admin@mirastros.ru")
    print("  3. Test user registered with email: test@example.com")
    print("  4. Payment gateway credentials configured in .env")
    print("\n" + "=" * 60)
    
    # Test Stripe
    await test_stripe_flow()
    
    # Test YooKassa
    await test_yookassa_flow()
    
    print("\n" + "=" * 60)
    print("✅ All payment tests completed!")
    print("=" * 60)
    print("\n📝 Next steps:")
    print("  1. Test actual payment with test cards")
    print("  2. Verify webhook handling")
    print("  3. Check order status updates")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
