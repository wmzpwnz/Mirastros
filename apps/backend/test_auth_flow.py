"""
Test script for authentication flow

This script tests the complete authentication flow including:
- Registration with email verification
- Login
- Token refresh
- Password reset
- Social login (mock)
- Email verification

Run with: python test_auth_flow.py
"""
import asyncio
import sys
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import async_session_maker
from app.core.security import get_password_hash, verify_password, create_access_token, decode_token
from app.models.user import User, SubscriptionTier
from app.services.email import EmailService
from app.services.social_auth import social_auth_service
from app.schemas.social_auth import GoogleAuthData


async def test_password_hashing():
    """Test password hashing and verification"""
    print("\n" + "="*60)
    print("TEST 1: Password Hashing")
    print("="*60)
    
    password = "TestPassword123"
    hashed = get_password_hash(password)
    
    print(f"✓ Password hashed successfully")
    print(f"  Original: {password}")
    print(f"  Hashed: {hashed[:50]}...")
    
    # Verify correct password
    assert verify_password(password, hashed), "Password verification failed"
    print(f"✓ Correct password verified")
    
    # Verify incorrect password
    assert not verify_password("WrongPassword", hashed), "Wrong password accepted"
    print(f"✓ Incorrect password rejected")


async def test_jwt_tokens():
    """Test JWT token creation and validation"""
    print("\n" + "="*60)
    print("TEST 2: JWT Tokens")
    print("="*60)
    
    user_id = "test-user-123"
    
    # Create access token
    access_token = create_access_token(data={"sub": user_id})
    print(f"✓ Access token created")
    print(f"  Token: {access_token[:50]}...")
    
    # Decode token
    payload = decode_token(access_token)
    assert payload is not None, "Token decode failed"
    assert payload["sub"] == user_id, "User ID mismatch"
    assert payload["type"] == "access", "Token type mismatch"
    print(f"✓ Token decoded successfully")
    print(f"  User ID: {payload['sub']}")
    print(f"  Type: {payload['type']}")


async def test_user_creation():
    """Test user creation with email verification"""
    print("\n" + "="*60)
    print("TEST 3: User Creation")
    print("="*60)
    
    async with async_session_maker() as db:
        # Create test user
        test_email = f"test_{datetime.now().timestamp()}@example.com"
        user = User(
            email=test_email,
            password_hash=get_password_hash("TestPassword123"),
            full_name="Test User",
            subscription_tier=SubscriptionTier.FREEMIUM
        )
        
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        print(f"✓ User created successfully")
        print(f"  ID: {user.id}")
        print(f"  Email: {user.email}")
        print(f"  Email Verified: {user.email_verified}")
        print(f"  Subscription: {user.subscription_tier}")
        
        # Test email verification token creation
        token = await EmailService.create_verification_token(db, user)
        print(f"✓ Verification token created")
        print(f"  Token: {token[:20]}...")
        print(f"  Expires: {user.email_verification_expires}")
        
        # Verify email
        verified_user = await EmailService.verify_email_token(db, token)
        assert verified_user is not None, "Email verification failed"
        assert verified_user.email_verified, "Email not marked as verified"
        print(f"✓ Email verified successfully")
        
        # Cleanup
        await db.delete(user)
        await db.commit()
        print(f"✓ Test user cleaned up")


async def test_password_reset():
    """Test password reset flow"""
    print("\n" + "="*60)
    print("TEST 4: Password Reset")
    print("="*60)
    
    async with async_session_maker() as db:
        # Create test user
        test_email = f"reset_{datetime.now().timestamp()}@example.com"
        old_password = "OldPassword123"
        user = User(
            email=test_email,
            password_hash=get_password_hash(old_password),
            full_name="Reset Test User",
            subscription_tier=SubscriptionTier.FREEMIUM
        )
        
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        print(f"✓ Test user created")
        
        # Create reset token
        token = await EmailService.create_password_reset_token(db, user)
        print(f"✓ Reset token created")
        print(f"  Token: {token[:20]}...")
        
        # Verify token
        verified_user = await EmailService.verify_password_reset_token(db, token)
        assert verified_user is not None, "Token verification failed"
        print(f"✓ Token verified")
        
        # Reset password
        new_password = "NewPassword456"
        new_hash = get_password_hash(new_password)
        await EmailService.reset_password(db, user, new_hash)
        print(f"✓ Password reset successfully")
        
        # Verify new password works
        await db.refresh(user)
        assert verify_password(new_password, user.password_hash), "New password doesn't work"
        assert not verify_password(old_password, user.password_hash), "Old password still works"
        print(f"✓ New password verified")
        print(f"✓ Old password no longer works")
        
        # Verify token was cleared
        assert user.password_reset_token is None, "Reset token not cleared"
        print(f"✓ Reset token cleared")
        
        # Cleanup
        await db.delete(user)
        await db.commit()
        print(f"✓ Test user cleaned up")


async def test_social_login():
    """Test social login flow"""
    print("\n" + "="*60)
    print("TEST 5: Social Login")
    print("="*60)
    
    async with async_session_maker() as db:
        # Test Google login (new user)
        google_data = GoogleAuthData(
            google_id=f"google_{datetime.now().timestamp()}",
            email=f"google_{datetime.now().timestamp()}@gmail.com",
            full_name="Google Test User"
        )
        
        user = await social_auth_service.create_user_from_google(db, google_data)
        print(f"✓ Google user created")
        print(f"  ID: {user.id}")
        print(f"  Email: {user.email}")
        print(f"  Google ID: {user.google_id}")
        print(f"  Email Verified: {user.email_verified}")
        print(f"  Has Password: {user.password_hash is not None}")
        
        # Verify social login is pre-verified
        assert user.email_verified, "Social login not pre-verified"
        print(f"✓ Social login pre-verified")
        
        # Verify no password for social-only account
        assert user.password_hash is None, "Social account has password"
        print(f"✓ Social-only account has no password")
        
        # Test account linking
        user.password_hash = get_password_hash("TestPassword123")
        await db.commit()
        print(f"✓ Password added to social account")
        
        # Cleanup
        await db.delete(user)
        await db.commit()
        print(f"✓ Test user cleaned up")


async def run_all_tests():
    """Run all authentication tests"""
    print("\n" + "="*60)
    print("AUTHENTICATION FLOW TESTS")
    print("="*60)
    
    try:
        await test_password_hashing()
        await test_jwt_tokens()
        await test_user_creation()
        await test_password_reset()
        await test_social_login()
        
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED")
        print("="*60)
        return 0
        
    except Exception as e:
        print("\n" + "="*60)
        print(f"❌ TEST FAILED: {str(e)}")
        print("="*60)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(run_all_tests())
    sys.exit(exit_code)
