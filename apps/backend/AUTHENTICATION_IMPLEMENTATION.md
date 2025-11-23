# Authentication System Implementation

## Overview

This document describes the authentication system implemented for Mirastros Universal backend.

## Completed Tasks

### 3.1 JWT Authentication ✅

**Files Created:**
- `app/core/security.py` - Password hashing and JWT token utilities
- `app/core/deps.py` - FastAPI dependencies for authentication
- `app/schemas/auth.py` - Pydantic schemas for auth requests/responses
- `app/api/auth.py` - Authentication API endpoints

**Features:**
- User registration with email/password
- User login with JWT token generation
- Token refresh mechanism
- Logout endpoint
- Get current user info endpoint
- Password hashing with bcrypt
- JWT access tokens (30 min expiry)
- JWT refresh tokens (7 day expiry)

**Endpoints:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (client-side token discard)
- `GET /auth/me` - Get current user information

**Dependencies:**
- `python-jose[cryptography]` - JWT handling
- `passlib[bcrypt]` - Password hashing
- `python-multipart` - Form data support

### 3.2 Social Login Preparation ✅

**Files Created:**
- `app/schemas/social_auth.py` - Pydantic schemas for social auth
- `app/services/social_auth.py` - Social authentication service
- `app/api/social_auth.py` - Social authentication API endpoints

**Features:**
- Google OAuth2 login/registration
- Apple Sign In login/registration
- Telegram Mini App authentication
- VK ID authentication
- Account linking (link social accounts to existing users)
- Account unlinking (with safety checks)
- User profile merging (auto-link by email)

**Endpoints:**
- `POST /auth/social/google` - Login/register with Google
- `POST /auth/social/apple` - Login/register with Apple
- `POST /auth/social/telegram` - Login/register with Telegram
- `POST /auth/social/vk` - Login/register with VK
- `POST /auth/social/link` - Link social account to current user
- `DELETE /auth/social/unlink/{provider}` - Unlink social account

**Account Linking Logic:**
1. If user exists with social ID → Login
2. If user exists with same email → Link social account and login
3. If new user → Create account and login

**Safety Features:**
- Cannot unlink last authentication method
- Prevents duplicate social account linking
- Handles missing email from providers (Telegram, VK)

### 3.3 Subscription Management ✅

**Files Created:**
- `app/schemas/subscription.py` - Pydantic schemas for subscriptions
- `app/services/subscription.py` - Subscription management service
- `app/api/subscriptions.py` - Subscription API endpoints

**Features:**
- Create subscription (Premium/Platinum)
- Activate subscription after payment
- Get subscription status
- Cancel subscription (immediate or at period end)
- Upgrade subscription to higher tier
- Tier-based access control middleware
- Automatic subscription expiration checking
- Pricing information endpoint

**Endpoints:**
- `POST /subscriptions/create` - Create new subscription
- `GET /subscriptions/status` - Get subscription status
- `POST /subscriptions/cancel` - Cancel subscription
- `POST /subscriptions/upgrade` - Upgrade to higher tier
- `POST /subscriptions/activate/{id}` - Activate pending subscription
- `GET /subscriptions/pricing` - Get pricing information

**Subscription Tiers:**
- **Freemium** (Free) - Limited access
- **Premium** ($9.99/month or $99/year) - Unlimited core features
- **Platinum** ($29.99/month or $299/year) - VIP features + AI assistant

**Payment Methods Supported:**
- Stripe (international)
- YooKassa (Russian market)
- RevenueCat (mobile in-app purchases)
- Telegram Stars (Telegram Mini App)
- VK Pay (VK Mini App)

**Access Control:**
- `require_subscription(tier)` - Dependency factory for tier-based access
- `require_premium` - Shortcut for Premium+ access
- `require_platinum` - Shortcut for Platinum access
- Automatic subscription expiration checks

## Database Models

### User Model
- Email/password authentication
- Social login IDs (google_id, apple_id, telegram_id, vk_id)
- Birth data for natal chart
- Subscription tier and expiry date
- Last login tracking

### Subscription Model
- User reference
- Tier (premium/platinum)
- Status (pending/active/cancelled/expired)
- Payment method and amount
- External payment IDs (Stripe, YooKassa, etc.)
- Subscription period (starts_at, expires_at)
- Auto-renewal flag

## Security Features

1. **Password Security**
   - Bcrypt hashing with automatic salt
   - Minimum 8 characters password requirement

2. **JWT Security**
   - HS256 algorithm
   - Short-lived access tokens (30 min)
   - Long-lived refresh tokens (7 days)
   - Token type validation (access vs refresh)

3. **API Security**
   - HTTP Bearer authentication
   - CORS configuration
   - Input validation with Pydantic
   - SQL injection prevention with SQLAlchemy

4. **Subscription Security**
   - User ownership verification
   - Tier hierarchy validation
   - Expiration date checks
   - Cannot unlink last auth method

## Configuration

Add to `.env` file:
```env
# JWT Configuration
SECRET_KEY=your-secret-key-change-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

## Usage Examples

### Register and Login
```python
# Register
POST /auth/register
{
  "email": "user@example.com",
  "password": "securepass123",
  "full_name": "John Doe"
}

# Login
POST /auth/login
{
  "email": "user@example.com",
  "password": "securepass123"
}

# Response
{
  "user": {...},
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

### Social Login
```python
# Google Login
POST /auth/social/google
{
  "google_id": "123456789",
  "email": "user@gmail.com",
  "full_name": "John Doe"
}
```

### Protected Endpoints
```python
# Use access token in Authorization header
GET /auth/me
Authorization: Bearer eyJ...

# Require Premium subscription
from app.core.deps import require_premium

@router.get("/premium-feature")
async def premium_feature(
    current_user: User = Depends(require_premium)
):
    # Only Premium/Platinum users can access
    pass
```

### Subscription Management
```python
# Create subscription
POST /subscriptions/create
{
  "tier": "premium",
  "payment_method": "stripe",
  "billing_period": "monthly"
}

# Check status
GET /subscriptions/status

# Cancel subscription
POST /subscriptions/cancel
{
  "immediate": false,  # Cancel at period end
  "reason": "Too expensive"
}
```

## Next Steps

1. **Payment Integration**
   - Implement Stripe payment intent creation
   - Implement YooKassa payment flow
   - Setup payment webhooks for automatic activation

2. **Rate Limiting**
   - Implement Redis-based rate limiting
   - Add per-endpoint rate limits

3. **Email Verification**
   - Add email verification on registration
   - Implement password reset flow

4. **Admin Features**
   - Admin endpoints for user management
   - Subscription analytics
   - Manual subscription activation

5. **Testing**
   - Unit tests for authentication logic
   - Integration tests for API endpoints
   - Test subscription expiration logic

## Migration

Run database migrations to create tables:
```bash
cd apps/backend
alembic upgrade head
```

The migration `002_add_user_models.py` already includes all necessary tables:
- users
- natal_charts
- subscriptions

---

**Implementation Date:** 2025-11-21  
**Status:** Complete ✅
