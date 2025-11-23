# Authentication Flow Documentation

## Overview

Mirastros Universal uses JWT (JSON Web Tokens) for authentication across all platforms. The system supports both traditional email/password authentication and social login providers.

## Authentication Methods

### 1. Email/Password Authentication

#### Registration Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database
    
    User->>Frontend: Enter registration details
    Frontend->>API: POST /auth/register
    API->>API: Validate input
    API->>API: Hash password (bcrypt)
    API->>Database: Create user record
    Database-->>API: User created
    API->>API: Generate JWT tokens
    API-->>Frontend: Return tokens + user data
    Frontend->>Frontend: Store tokens securely
    Frontend-->>User: Registration successful
```

**Request:**
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "birth_date": "1990-01-15",
  "birth_time": "14:30:00",
  "birth_location": "New York, USA"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "subscription_tier": "freemium",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

#### Login Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database
    
    User->>Frontend: Enter credentials
    Frontend->>API: POST /auth/login
    API->>Database: Find user by email
    Database-->>API: User record
    API->>API: Verify password (bcrypt)
    API->>API: Generate JWT tokens
    API-->>Frontend: Return tokens
    Frontend->>Frontend: Store tokens securely
    Frontend-->>User: Login successful
```


**Request:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### 2. Social Authentication

#### Google OAuth Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Google
    participant API
    participant Database
    
    User->>Frontend: Click "Sign in with Google"
    Frontend->>Google: Initiate OAuth flow
    Google-->>User: Show consent screen
    User->>Google: Grant permission
    Google-->>Frontend: Return ID token
    Frontend->>API: POST /auth/google {id_token}
    API->>Google: Verify ID token
    Google-->>API: Token valid + user info
    API->>Database: Find or create user
    Database-->>API: User record
    API->>API: Generate JWT tokens
    API-->>Frontend: Return tokens
    Frontend-->>User: Login successful
```

**Request:**
```http
POST /auth/google
Content-Type: application/json

{
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

**Response:** Same as email/password login

#### Apple Sign In Flow

Similar to Google OAuth, but uses Apple's authentication service.

**Endpoint:** `POST /auth/apple`

#### Telegram Login Flow

```mermaid
sequenceDiagram
    participant User
    participant TelegramApp
    participant MiniApp
    participant API
    participant Database
    
    User->>TelegramApp: Open Mirastros Mini App
    TelegramApp->>MiniApp: Pass init_data
    MiniApp->>API: POST /auth/telegram {init_data}
    API->>API: Verify Telegram signature
    API->>Database: Find or create user
    Database-->>API: User record
    API->>API: Generate JWT tokens
    API-->>MiniApp: Return tokens
    MiniApp-->>User: Authenticated
```

**Request:**
```http
POST /auth/telegram
Content-Type: application/json

{
  "init_data": "query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A..."
}
```

#### VK ID Flow

Similar to Telegram, but uses VK's authentication.

**Endpoint:** `POST /auth/vk`

### 3. Token Management

#### JWT Token Structure

**Access Token** (expires in 1 hour):
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "subscription_tier": "premium",
  "exp": 1640995200,
  "iat": 1640991600,
  "type": "access"
}
```

**Refresh Token** (expires in 30 days):
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "exp": 1643587200,
  "iat": 1640991600,
  "type": "refresh"
}
```

#### Token Refresh Flow

```mermaid
sequenceDiagram
    participant Frontend
    participant API
    
    Frontend->>API: Request with expired access token
    API-->>Frontend: 401 Unauthorized
    Frontend->>API: POST /auth/refresh {refresh_token}
    API->>API: Verify refresh token
    API->>API: Generate new access token
    API-->>Frontend: Return new access token
    Frontend->>API: Retry original request
    API-->>Frontend: Success
```

**Request:**
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### 4. Making Authenticated Requests

All protected endpoints require the access token in the Authorization header:

```http
GET /horoscope/daily/aries
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

### 5. Logout

**Endpoint:** `POST /auth/logout`

Invalidates the refresh token (access tokens expire naturally).

```http
POST /auth/logout
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Content-Type: application/json

{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

## Security Best Practices

### Token Storage

**Web Application:**
- Store access token in memory (React state/Redux)
- Store refresh token in httpOnly cookie or secure localStorage
- Never expose tokens in URL parameters

**Mobile Application:**
- Use secure storage (Keychain on iOS, Keystore on Android)
- Implement biometric authentication for token access

**Mini Apps:**
- Use platform-specific secure storage
- Telegram: Store in WebApp.CloudStorage
- VK: Use VK Bridge secure storage

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Rate Limiting

- Login attempts: 5 per 15 minutes per IP
- Registration: 3 per hour per IP
- Token refresh: 10 per hour per user

### Token Expiration

- Access token: 1 hour
- Refresh token: 30 days
- Tokens are automatically invalidated on:
  - Password change
  - Account deletion
  - Manual logout

## Error Handling

### Common Authentication Errors

**Invalid Credentials:**
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect"
  }
}
```

**Token Expired:**
```json
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Access token has expired. Please refresh."
  }
}
```

**Invalid Token:**
```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Token is invalid or malformed"
  }
}
```

**Account Suspended:**
```json
{
  "error": {
    "code": "ACCOUNT_SUSPENDED",
    "message": "Your account has been suspended. Contact support."
  }
}
```

## Platform-Specific Implementation

### Web (Next.js)

```typescript
// lib/auth.ts
import { apiClient } from './api';

export async function login(email: string, password: string) {
  const response = await apiClient.post('/auth/login', {
    email,
    password
  });
  
  // Store tokens
  localStorage.setItem('access_token', response.data.access_token);
  localStorage.setItem('refresh_token', response.data.refresh_token);
  
  return response.data;
}

export async function refreshToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  const response = await apiClient.post('/auth/refresh', {
    refresh_token: refreshToken
  });
  
  localStorage.setItem('access_token', response.data.access_token);
  return response.data.access_token;
}
```

### Mobile (React Native)

```typescript
// services/auth.ts
import * as SecureStore from 'expo-secure-store';
import { apiClient } from './api';

export async function login(email: string, password: string) {
  const response = await apiClient.post('/auth/login', {
    email,
    password
  });
  
  // Store tokens securely
  await SecureStore.setItemAsync('access_token', response.data.access_token);
  await SecureStore.setItemAsync('refresh_token', response.data.refresh_token);
  
  return response.data;
}

export async function refreshToken() {
  const refreshToken = await SecureStore.getItemAsync('refresh_token');
  const response = await apiClient.post('/auth/refresh', {
    refresh_token: refreshToken
  });
  
  await SecureStore.setItemAsync('access_token', response.data.access_token);
  return response.data.access_token;
}
```

### Telegram Mini App

```typescript
// lib/auth.ts
import { apiClient } from './api';

export async function authenticateTelegram() {
  const initData = window.Telegram.WebApp.initData;
  
  const response = await apiClient.post('/auth/telegram', {
    init_data: initData
  });
  
  // Store in Telegram Cloud Storage
  window.Telegram.WebApp.CloudStorage.setItem('access_token', response.data.access_token);
  window.Telegram.WebApp.CloudStorage.setItem('refresh_token', response.data.refresh_token);
  
  return response.data;
}
```

## Testing Authentication

### cURL Examples

**Register:**
```bash
curl -X POST https://www.mirastros.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "full_name": "Test User",
    "birth_date": "1990-01-01",
    "birth_time": "12:00:00",
    "birth_location": "New York, USA"
  }'
```

**Login:**
```bash
curl -X POST https://www.mirastros.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Authenticated Request:**
```bash
curl -X GET https://www.mirastros.com/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Refresh Token:**
```bash
curl -X POST https://www.mirastros.com/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

