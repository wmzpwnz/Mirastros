# Mirastros Universal API Documentation

## Overview

The Mirastros Universal API provides AI-powered esoteric services including astrology, tarot, numerology, dream interpretation, and more. Built with FastAPI and powered by Qwen 2.5-7B AI model with RAG capabilities.

**Base URL:** `https://www.mirastros.com/api`  
**Version:** 1.0.0  
**Authentication:** JWT Bearer Token

## Table of Contents

1. [Authentication](#authentication)
2. [Core Services](#core-services)
3. [Esoteric Services](#esoteric-services)
4. [Subscription & Payments](#subscription--payments)
5. [User Features](#user-features)
6. [Admin Endpoints](#admin-endpoints)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

## Quick Start

### 1. Register a User

```bash
curl -X POST https://www.mirastros.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "full_name": "John Doe",
    "birth_date": "1990-01-15",
    "birth_time": "14:30:00",
    "birth_location": "New York, USA"
  }'
```

### 2. Login

```bash
curl -X POST https://www.mirastros.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### 3. Make Authenticated Request

```bash
curl -X GET https://www.mirastros.com/api/horoscope/daily/aries \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```


## Authentication

### Register User

**Endpoint:** `POST /auth/register`

Creates a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "birth_date": "1990-01-15",
  "birth_time": "14:30:00",
  "birth_location": "New York, USA"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "subscription_tier": "freemium",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

### Login

**Endpoint:** `POST /auth/login`

Authenticates user and returns JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### Refresh Token

**Endpoint:** `POST /auth/refresh`

Refreshes access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### Get Current User

**Endpoint:** `GET /auth/me`

Returns current authenticated user information.

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "birth_date": "1990-01-15",
  "birth_time": "14:30:00",
  "birth_location": "New York, USA",
  "subscription_tier": "premium",
  "subscription_expires": "2024-12-31T23:59:59Z",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Social Authentication

**Google OAuth:** `POST /auth/google`
**Apple Sign In:** `POST /auth/apple`
**Telegram Login:** `POST /auth/telegram`
**VK ID:** `POST /auth/vk`

**Request Body:**
```json
{
  "id_token": "oauth_token_from_provider"
}
```

**Response:** Same as login endpoint


## Core Services

### Natal Chart

#### Calculate Natal Chart

**Endpoint:** `POST /natal/calculate`

Calculates natal chart from birth data.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "birth_date": "1990-01-15",
  "birth_time": "14:30:00",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "house_system": "placidus"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "planets": {
    "sun": {"sign": "Capricorn", "degree": 24.5, "house": 10},
    "moon": {"sign": "Pisces", "degree": 12.3, "house": 12},
    "mercury": {"sign": "Capricorn", "degree": 18.7, "house": 10}
  },
  "houses": {
    "1": {"sign": "Aries", "degree": 15.2},
    "2": {"sign": "Taurus", "degree": 20.5}
  },
  "aspects": [
    {"planet1": "sun", "planet2": "moon", "aspect": "sextile", "orb": 2.1}
  ],
  "interpretation": "Your Sun in Capricorn in the 10th house indicates...",
  "calculated_at": "2024-01-01T00:00:00Z"
}
```

#### Get User's Natal Chart

**Endpoint:** `GET /natal/{user_id}`

Retrieves stored natal chart for user.

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK` (same structure as calculate)

### Tarot Reading

#### Perform Tarot Reading

**Endpoint:** `POST /tarot/reading`

Performs tarot reading with AI interpretation.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "spread_type": "three-card",
  "question": "What should I focus on this month?",
  "reversed_allowed": true
}
```

**Spread Types:**
- `one-card`: Single card reading
- `three-card`: Past, Present, Future
- `five-card`: Cross spread
- `celtic-cross`: 10-card Celtic Cross

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "spread_type": "three-card",
  "question": "What should I focus on this month?",
  "cards": [
    {
      "position": 1,
      "card": "The Fool",
      "suit": "Major Arcana",
      "number": 0,
      "reversed": false,
      "meaning": "New beginnings, innocence, spontaneity",
      "image_url": "/cards/fool.jpg"
    },
    {
      "position": 2,
      "card": "Three of Cups",
      "suit": "Cups",
      "number": 3,
      "reversed": false,
      "meaning": "Celebration, friendship, creativity",
      "image_url": "/cards/three_cups.jpg"
    }
  ],
  "interpretation": "The Fool in your past position suggests...",
  "clarify_button": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Get Tarot Cards

**Endpoint:** `GET /tarot/cards`

Returns all 78 tarot cards with meanings.

**Response:** `200 OK`
```json
{
  "cards": [
    {
      "name": "The Fool",
      "suit": "Major Arcana",
      "number": 0,
      "upright_meaning": "New beginnings, innocence...",
      "reversed_meaning": "Recklessness, naivety...",
      "image_url": "/cards/fool.jpg"
    }
  ]
}
```

#### Get Reading History

**Endpoint:** `GET /tarot/history`

Returns user's tarot reading history.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `limit`: Number of readings (default: 10)
- `offset`: Pagination offset (default: 0)

**Response:** `200 OK`
```json
{
  "readings": [...],
  "total": 25,
  "limit": 10,
  "offset": 0
}
```


### Horoscope

#### Get Daily Horoscope

**Endpoint:** `GET /horoscope/daily/{sign}`

Returns daily horoscope for zodiac sign (cached 24h).

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `sign`: Zodiac sign (aries, taurus, gemini, cancer, leo, virgo, libra, scorpio, sagittarius, capricorn, aquarius, pisces)

**Response:** `200 OK`
```json
{
  "zodiac_sign": "aries",
  "period": "daily",
  "date": "2024-01-01",
  "prediction": "Today brings exciting opportunities...",
  "lucky_numbers": [7, 14, 23],
  "lucky_colors": ["red", "gold"],
  "compatibility": {
    "best": "leo",
    "challenging": "cancer"
  },
  "love": "Romance is in the air...",
  "career": "Focus on networking...",
  "health": "Energy levels are high...",
  "clarify_button": true
}
```

#### Get Weekly Horoscope

**Endpoint:** `GET /horoscope/weekly/{sign}`

**Tier Required:** Premium or Platinum

**Response:** Similar to daily, with `period: "weekly"`

#### Get Monthly Horoscope

**Endpoint:** `GET /horoscope/monthly/{sign}`

**Tier Required:** Premium or Platinum

**Response:** Similar to daily, with `period: "monthly"`

#### Get Personalized Horoscope

**Endpoint:** `POST /horoscope/personalized`

Generates personalized horoscope based on natal chart.

**Tier Required:** Premium or Platinum

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "period": "daily",
  "include_transits": true
}
```

**Response:** `200 OK` (enhanced with natal chart context)

### Numerology

#### Calculate Numerology

**Endpoint:** `POST /numerology/calculate`

Calculates numerology numbers from name and birth date.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "full_name": "John Doe",
  "birth_date": "1990-01-15"
}
```

**Response:** `200 OK`
```json
{
  "life_path_number": 7,
  "destiny_number": 5,
  "soul_urge_number": 3,
  "personality_number": 2,
  "interpretations": {
    "life_path": "Life Path 7 indicates a seeker of truth...",
    "destiny": "Destiny Number 5 suggests freedom and adventure...",
    "soul_urge": "Soul Urge 3 reveals creative expression...",
    "personality": "Personality Number 2 shows diplomacy..."
  },
  "clarify_button": true
}
```

### Dream Interpretation

#### Interpret Dream

**Endpoint:** `POST /dreams/interpret`

Interprets dream using AI and dream dictionary.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "dream_text": "I was flying over a city at night...",
  "mood": "peaceful",
  "recurring": false
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "dream_text": "I was flying over a city at night...",
  "symbols": [
    {"symbol": "flying", "meaning": "Freedom, transcendence"},
    {"symbol": "city", "meaning": "Social connections, ambitions"},
    {"symbol": "night", "meaning": "Unconscious, mystery"}
  ],
  "interpretation": "Flying in your dream represents...",
  "advice": "This dream suggests you're ready to...",
  "clarify_button": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Get Dream Dictionary

**Endpoint:** `GET /dreams/dictionary`

Returns dream symbol dictionary.

**Query Parameters:**
- `search`: Search term (optional)

**Response:** `200 OK`
```json
{
  "symbols": [
    {
      "symbol": "water",
      "meanings": ["Emotions", "Unconscious", "Purification"],
      "context": "Clear water: clarity; Murky water: confusion"
    }
  ]
}
```


## Esoteric Services

### Runes

#### Perform Rune Reading

**Endpoint:** `POST /runes/reading`

**Request Body:**
```json
{
  "spread_type": "three-rune",
  "question": "What guidance do I need?"
}
```

**Spread Types:** `one-rune`, `three-rune`, `cross`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "runes": [
    {
      "position": 1,
      "rune": "Fehu",
      "meaning": "Wealth, abundance, cattle",
      "reversed": false
    }
  ],
  "interpretation": "Fehu in the first position...",
  "clarify_button": true
}
```

### I Ching

#### Consult I Ching

**Endpoint:** `POST /iching/consult`

**Request Body:**
```json
{
  "question": "Should I pursue this opportunity?",
  "method": "coin"
}
```

**Methods:** `coin`, `yarrow`

**Response:** `200 OK`
```json
{
  "hexagram_number": 14,
  "hexagram_name": "Possession in Great Measure",
  "changing_lines": [2, 5],
  "resulting_hexagram": 26,
  "interpretation": "This hexagram indicates great success...",
  "advice": "The time is favorable for...",
  "clarify_button": true
}
```

### Lenormand Cards

#### Perform Lenormand Reading

**Endpoint:** `POST /lenormand/reading`

**Request Body:**
```json
{
  "spread_type": "three-card",
  "question": "What's the outcome of my project?"
}
```

**Spread Types:** `three-card`, `five-card`, `nine-card`

**Response:** `200 OK`
```json
{
  "cards": [
    {
      "position": 1,
      "card": "Clover",
      "number": 2,
      "meaning": "Luck, opportunity"
    }
  ],
  "interpretation": "The Clover and Ship combination suggests...",
  "clarify_button": true
}
```

### Planetary Transits

#### Get Current Transits

**Endpoint:** `GET /transits/current`

**Tier Required:** Premium or Platinum

**Response:** `200 OK`
```json
{
  "date": "2024-01-01",
  "transits": [
    {
      "planet": "Jupiter",
      "sign": "Taurus",
      "degree": 15.3,
      "retrograde": false
    }
  ],
  "significant_aspects": [
    {
      "transit_planet": "Saturn",
      "natal_planet": "Sun",
      "aspect": "square",
      "orb": 1.2,
      "interpretation": "This challenging aspect..."
    }
  ]
}
```

#### Get Personal Transits

**Endpoint:** `GET /transits/personal/{user_id}`

Analyzes transits against user's natal chart.

**Tier Required:** Premium or Platinum

**Response:** Enhanced with natal chart context

### Synastry (Compatibility)

#### Calculate Synastry

**Endpoint:** `POST /synastry/calculate`

**Tier Required:** Premium or Platinum

**Request Body:**
```json
{
  "partner_birth_date": "1992-05-20",
  "partner_birth_time": "10:00:00",
  "partner_latitude": 40.7128,
  "partner_longitude": -74.0060
}
```

**Response:** `200 OK`
```json
{
  "compatibility_score": 78,
  "strengths": [
    "Strong emotional connection (Moon trine Venus)",
    "Intellectual compatibility (Mercury conjunct Mercury)"
  ],
  "challenges": [
    "Power struggles possible (Mars square Pluto)"
  ],
  "advice": "Focus on communication and...",
  "aspects": [...],
  "clarify_button": true
}
```

### Lunar Calendar

#### Get Current Lunar Phase

**Endpoint:** `GET /lunar/current`

**Response:** `200 OK`
```json
{
  "phase": "Waxing Gibbous",
  "illumination": 0.78,
  "zodiac_sign": "Gemini",
  "recommendations": {
    "favorable": ["Learning", "Communication", "Social activities"],
    "avoid": ["Major decisions", "Surgery"]
  }
}
```

#### Get Lunar Calendar

**Endpoint:** `GET /lunar/calendar`

**Query Parameters:**
- `months`: Number of months ahead (default: 3)

**Response:** `200 OK`
```json
{
  "calendar": [
    {
      "date": "2024-01-15",
      "phase": "Full Moon",
      "zodiac_sign": "Cancer",
      "type": "Full Moon in Cancer"
    }
  ]
}
```

### Crystals & Stones

#### Get All Crystals

**Endpoint:** `GET /crystals/all`

**Response:** `200 OK`
```json
{
  "crystals": [
    {
      "name": "Amethyst",
      "properties": ["Spiritual growth", "Protection", "Clarity"],
      "chakra": "Crown",
      "zodiac_signs": ["Pisces", "Aquarius"],
      "color": "Purple",
      "image_url": "/crystals/amethyst.jpg"
    }
  ]
}
```

#### Get Crystal Recommendations

**Endpoint:** `GET /crystals/recommend`

**Query Parameters:**
- `goal`: Goal (protection, love, wealth, healing)
- `zodiac_sign`: User's zodiac sign (optional)

**Response:** `200 OK`
```json
{
  "recommendations": [
    {
      "crystal": "Rose Quartz",
      "reason": "Perfect for attracting love and compassion",
      "usage": "Wear close to heart or place in bedroom"
    }
  ]
}
```


### Rituals & Meditations

#### Generate Personalized Ritual

**Endpoint:** `POST /rituals/generate`

**Request Body:**
```json
{
  "goal": "prosperity",
  "lunar_phase": "new_moon",
  "include_meditation": true
}
```

**Goals:** `prosperity`, `love`, `protection`, `healing`, `clarity`

**Response:** `200 OK`
```json
{
  "ritual": {
    "title": "New Moon Prosperity Ritual",
    "duration": "30 minutes",
    "materials": ["Green candle", "Cinnamon", "Bay leaves"],
    "steps": [
      "1. Cleanse your space with sage or incense",
      "2. Light the green candle",
      "3. Write your intentions on bay leaves"
    ],
    "meditation_script": "Close your eyes and visualize...",
    "affirmations": [
      "I am open to abundance",
      "Prosperity flows to me easily"
    ]
  }
}
```

### Horary Astrology (Platinum Only)

#### Ask Horary Question

**Endpoint:** `POST /horary/question`

**Tier Required:** Platinum

**Request Body:**
```json
{
  "question": "Will I get the job?",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response:** `200 OK`
```json
{
  "answer": "yes",
  "confidence": "high",
  "timing": "Within 2-3 weeks",
  "chart": {...},
  "interpretation": "The Moon applying to Jupiter suggests...",
  "clarify_button": true
}
```

### Chakra Analysis

#### Analyze Chakras

**Endpoint:** `POST /chakra/analyze`

**Request Body:**
```json
{
  "birth_date": "1990-01-15"
}
```

**Response:** `200 OK`
```json
{
  "chakras": [
    {
      "name": "Root",
      "status": "balanced",
      "percentage": 85,
      "color": "red"
    },
    {
      "name": "Sacral",
      "status": "blocked",
      "percentage": 45,
      "color": "orange",
      "issues": ["Creative blocks", "Emotional suppression"]
    }
  ],
  "practices": [
    {
      "chakra": "Sacral",
      "practice": "Hip-opening yoga poses",
      "duration": "15 minutes daily"
    }
  ],
  "visualization_data": {...}
}
```

### Solar Return (Platinum Only)

#### Calculate Solar Return

**Endpoint:** `POST /solar-return/calculate`

**Tier Required:** Platinum

**Request Body:**
```json
{
  "year": 2024
}
```

**Response:** `200 OK`
```json
{
  "year": 2024,
  "chart": {...},
  "yearly_themes": [
    "Career advancement",
    "Relationship transformation"
  ],
  "monthly_forecast": [
    {
      "month": "January",
      "focus": "New beginnings in career",
      "challenges": "Communication issues"
    }
  ],
  "key_dates": [
    {
      "date": "2024-03-15",
      "event": "Major career opportunity"
    }
  ]
}
```

### Karmic Tasks

#### Analyze Karmic Lessons

**Endpoint:** `POST /karmic/analyze`

**Response:** `200 OK`
```json
{
  "north_node": {
    "sign": "Gemini",
    "house": 3,
    "lesson": "Develop communication and learning"
  },
  "south_node": {
    "sign": "Sagittarius",
    "house": 9,
    "past_life": "Teacher or philosopher"
  },
  "karmic_debts": [
    {
      "number": 13,
      "meaning": "Laziness in past life",
      "lesson": "Discipline and hard work"
    }
  ],
  "soul_purpose": "To become a bridge between ideas...",
  "recommendations": [
    "Study new subjects",
    "Practice active listening"
  ]
}
```

### Mandala Generation

#### Generate Personalized Mandala

**Endpoint:** `POST /mandala/generate`

**Request Body:**
```json
{
  "birth_date": "1990-01-15",
  "style": "geometric"
}
```

**Styles:** `geometric`, `floral`, `cosmic`

**Response:** `200 OK`
```json
{
  "mandala_url": "/mandalas/uuid.svg",
  "download_url": "/mandalas/uuid.pdf",
  "colors": ["#4A0E4E", "#FFD700", "#1A1A2E"],
  "symbolism": "The 7-pointed star represents...",
  "meditation_instructions": "Gaze at the center point..."
}
```


## Subscription & Payments

### Subscriptions

#### Get Subscription Plans

**Endpoint:** `GET /subscriptions/plans`

**Response:** `200 OK`
```json
{
  "plans": [
    {
      "tier": "freemium",
      "price": 0,
      "features": [
        "1 daily horoscope",
        "1 tarot reading per week",
        "7-day history"
      ]
    },
    {
      "tier": "premium",
      "monthly_price": 9.99,
      "annual_price": 99.00,
      "features": [
        "Unlimited horoscopes",
        "Unlimited tarot readings",
        "Full natal chart",
        "Clarify with Mirastros AI",
        "Unlimited history"
      ]
    },
    {
      "tier": "platinum",
      "monthly_price": 29.99,
      "annual_price": 299.00,
      "features": [
        "All Premium features",
        "Personalized AI Astrologer",
        "Priority processing",
        "Horary astrology",
        "Solar return chart",
        "1 live consultation/month"
      ]
    }
  ]
}
```

#### Create Subscription

**Endpoint:** `POST /subscriptions/create`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "tier": "premium",
  "billing_period": "monthly",
  "payment_method": "stripe"
}
```

**Response:** `200 OK`
```json
{
  "subscription_id": "uuid",
  "tier": "premium",
  "status": "active",
  "amount": 9.99,
  "currency": "USD",
  "starts_at": "2024-01-01T00:00:00Z",
  "expires_at": "2024-02-01T00:00:00Z",
  "auto_renew": true,
  "payment_url": "https://checkout.stripe.com/..."
}
```

#### Get Subscription Status

**Endpoint:** `GET /subscriptions/status`

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "tier": "premium",
  "status": "active",
  "expires_at": "2024-02-01T00:00:00Z",
  "auto_renew": true,
  "usage": {
    "horoscopes_today": 5,
    "tarot_readings_week": 3
  }
}
```

#### Upgrade Subscription

**Endpoint:** `POST /subscriptions/upgrade`

**Request Body:**
```json
{
  "new_tier": "platinum"
}
```

**Response:** `200 OK`

#### Cancel Subscription

**Endpoint:** `POST /subscriptions/cancel`

**Response:** `200 OK`
```json
{
  "message": "Subscription cancelled. Access until 2024-02-01",
  "expires_at": "2024-02-01T00:00:00Z"
}
```

### Payments

#### Create Payment Intent

**Endpoint:** `POST /payments/create-intent`

**Request Body:**
```json
{
  "amount": 9.99,
  "currency": "USD",
  "payment_method": "stripe",
  "metadata": {
    "subscription_tier": "premium",
    "billing_period": "monthly"
  }
}
```

**Response:** `200 OK`
```json
{
  "payment_intent_id": "pi_xxx",
  "client_secret": "pi_xxx_secret_xxx",
  "amount": 9.99,
  "currency": "USD"
}
```

#### Payment Webhook

**Endpoint:** `POST /payments/webhook`

Handles payment provider webhooks (Stripe, ЮKassa).

**Headers:** `Stripe-Signature` or `X-YooKassa-Signature`

**Response:** `200 OK`

#### Get Payment History

**Endpoint:** `GET /payments/history`

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "payments": [
    {
      "id": "uuid",
      "amount": 9.99,
      "currency": "USD",
      "status": "succeeded",
      "description": "Premium subscription - Monthly",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```


## User Features

### Chat (Clarify with Mirastros)

#### Start Chat Session

**Endpoint:** `POST /chat/start`

**Tier Required:** Premium or Platinum

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "context_type": "tarot",
  "context_data": {
    "reading_id": "uuid",
    "cards": [...]
  }
}
```

**Context Types:** `tarot`, `horoscope`, `dream`, `natal`, `general`

**Response:** `200 OK`
```json
{
  "session_id": "uuid",
  "context_type": "tarot",
  "message": "I'm here to help clarify your tarot reading. What would you like to know?"
}
```

#### Send Chat Message

**Endpoint:** `POST /chat/message`

**Request Body:**
```json
{
  "session_id": "uuid",
  "message": "What does the Fool card mean for my career?"
}
```

**Response:** `200 OK`
```json
{
  "session_id": "uuid",
  "message": "The Fool in your career context suggests...",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Stream Chat Response (SSE)

**Endpoint:** `POST /chat/stream`

**Request Body:** Same as `/chat/message`

**Response:** `text/event-stream`
```
data: {"token": "The", "done": false}

data: {"token": " Fool", "done": false}

data: {"token": " suggests", "done": false}

data: {"done": true, "full_message": "The Fool suggests..."}
```

#### Get Chat History

**Endpoint:** `GET /chat/history/{session_id}`

**Response:** `200 OK`
```json
{
  "session_id": "uuid",
  "messages": [
    {
      "role": "user",
      "content": "What does the Fool mean?",
      "timestamp": "2024-01-01T00:00:00Z"
    },
    {
      "role": "assistant",
      "content": "The Fool represents...",
      "timestamp": "2024-01-01T00:00:05Z"
    }
  ]
}
```

### Journal

#### Create Journal Entry

**Endpoint:** `POST /journal/entry`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "entry_type": "dream",
  "title": "Flying Dream",
  "content": "I dreamed I was flying over mountains...",
  "tags": ["flying", "freedom", "mountains"],
  "mood": "peaceful"
}
```

**Entry Types:** `dream`, `meditation`, `reading`, `reflection`

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "entry_type": "dream",
  "title": "Flying Dream",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Get Journal Entries

**Endpoint:** `GET /journal/entries`

**Query Parameters:**
- `entry_type`: Filter by type (optional)
- `tags`: Comma-separated tags (optional)
- `limit`: Number of entries (default: 20)
- `offset`: Pagination offset (default: 0)

**Response:** `200 OK`
```json
{
  "entries": [...],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

#### Get AI Insights

**Endpoint:** `GET /journal/insights`

**Tier Required:** Premium or Platinum

**Response:** `200 OK`
```json
{
  "patterns": [
    {
      "theme": "Water symbols",
      "frequency": 8,
      "interpretation": "Recurring water imagery suggests..."
    }
  ],
  "progress": {
    "entries_this_month": 15,
    "most_common_mood": "peaceful",
    "growth_areas": ["Emotional awareness", "Dream recall"]
  },
  "recommendations": [
    "Continue exploring water symbolism",
    "Consider moon phase correlation"
  ]
}
```

### Shop

#### Get Products

**Endpoint:** `GET /shop/products`

**Query Parameters:**
- `category`: Filter by category (optional)
- `search`: Search term (optional)

**Categories:** `crystal`, `tarot-deck`, `book`, `ritual-item`

**Response:** `200 OK`
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Amethyst Crystal",
      "description": "Natural amethyst for spiritual growth",
      "category": "crystal",
      "price": 24.99,
      "currency": "USD",
      "image_url": "/products/amethyst.jpg",
      "stock": 15,
      "zodiac_signs": ["Pisces", "Aquarius"]
    }
  ]
}
```

#### Get Product Recommendations

**Endpoint:** `POST /shop/recommend`

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "recommendations": [
    {
      "product": {...},
      "reason": "Perfect for your Capricorn Sun",
      "priority": "high"
    }
  ]
}
```

#### Create Order

**Endpoint:** `POST /shop/order`

**Request Body:**
```json
{
  "products": [
    {
      "product_id": "uuid",
      "quantity": 1
    }
  ],
  "shipping_address": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA"
  }
}
```

**Response:** `201 Created`
```json
{
  "order_id": "uuid",
  "total_amount": 24.99,
  "currency": "USD",
  "status": "pending",
  "payment_url": "https://checkout.stripe.com/..."
}
```

#### Get Order Status

**Endpoint:** `GET /shop/order/{order_id}`

**Response:** `200 OK`
```json
{
  "order_id": "uuid",
  "status": "shipped",
  "tracking_number": "1Z999AA10123456784",
  "estimated_delivery": "2024-01-10",
  "products": [...]
}
```


## Admin Endpoints

### Analytics

#### Get Platform Statistics

**Endpoint:** `GET /admin/stats`

**Headers:** `Authorization: Bearer {admin_token}`

**Response:** `200 OK`
```json
{
  "users": {
    "total": 10000,
    "new_today": 45,
    "new_this_week": 312,
    "new_this_month": 1250
  },
  "subscriptions": {
    "freemium": 7500,
    "premium": 2000,
    "platinum": 500,
    "conversion_rate": 0.25,
    "mrr": 34950.00
  },
  "services": {
    "horoscope_requests": 5000,
    "tarot_readings": 1200,
    "natal_charts": 800,
    "ai_chat_sessions": 450
  },
  "ai_performance": {
    "avg_response_time": 2.3,
    "total_tokens": 1500000,
    "cache_hit_rate": 0.65
  }
}
```

#### Get User List

**Endpoint:** `GET /admin/users`

**Query Parameters:**
- `tier`: Filter by subscription tier
- `search`: Search by email or name
- `limit`: Number of users (default: 50)
- `offset`: Pagination offset

**Response:** `200 OK`
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "subscription_tier": "premium",
      "created_at": "2024-01-01T00:00:00Z",
      "last_active": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 10000
}
```

### Document Management (RAG)

#### Upload Document

**Endpoint:** `POST /documents/upload`

**Headers:** `Authorization: Bearer {admin_token}`

**Request Body:**
```json
{
  "title": "Tarot Card Meanings",
  "content": "The Fool represents...",
  "category": "tarot",
  "source": "Traditional Rider-Waite"
}
```

**Response:** `201 Created`
```json
{
  "document_id": "uuid",
  "chunks_created": 15,
  "embeddings_generated": 15
}
```

#### Upload PDF

**Endpoint:** `POST /documents/upload-pdf`

**Headers:** 
- `Authorization: Bearer {admin_token}`
- `Content-Type: multipart/form-data`

**Form Data:**
- `file`: PDF file
- `category`: Document category
- `source`: Source name

**Response:** `201 Created`

#### List Documents

**Endpoint:** `GET /documents/`

**Response:** `200 OK`
```json
{
  "documents": [
    {
      "id": "uuid",
      "title": "Tarot Card Meanings",
      "category": "tarot",
      "chunks": 15,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Delete Document

**Endpoint:** `DELETE /documents/{id}`

**Response:** `200 OK`

## Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect",
    "details": {
      "field": "password"
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_CREDENTIALS` | 401 | Invalid email or password |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `INSUFFICIENT_TIER` | 403 | Feature requires higher subscription tier |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `SERVER_ERROR` | 500 | Internal server error |
| `AI_SERVICE_ERROR` | 503 | AI service temporarily unavailable |

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request format
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

## Rate Limiting

### Default Limits

- **General API**: 60 requests per minute per IP
- **AI Services**: 20 requests per minute per user
- **Chat Streaming**: 10 concurrent connections per user

### Rate Limit Headers

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

### Rate Limit Response

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 30 seconds.",
    "retry_after": 30
  }
}
```

## Webhooks

### Payment Webhooks

**Stripe:** `POST /payments/webhook`
**ЮKassa:** `POST /payments/webhook`

Webhooks are used to handle payment events:
- `payment.succeeded`: Payment completed
- `payment.failed`: Payment failed
- `subscription.created`: Subscription created
- `subscription.cancelled`: Subscription cancelled

### Webhook Security

All webhooks are verified using provider signatures:
- Stripe: `Stripe-Signature` header
- ЮKassa: `X-YooKassa-Signature` header

## SDKs and Client Libraries

### JavaScript/TypeScript

```typescript
import { MirastrosClient } from '@mirastros/client';

const client = new MirastrosClient({
  apiKey: 'your_jwt_token',
  baseURL: 'https://www.mirastros.com/api'
});

// Get daily horoscope
const horoscope = await client.horoscope.getDaily('aries');

// Perform tarot reading
const reading = await client.tarot.performReading({
  spreadType: 'three-card',
  question: 'What should I focus on?'
});
```

### Python

```python
from mirastros import MirastrosClient

client = MirastrosClient(
    api_key='your_jwt_token',
    base_url='https://www.mirastros.com/api'
)

# Get daily horoscope
horoscope = client.horoscope.get_daily('aries')

# Perform tarot reading
reading = client.tarot.perform_reading(
    spread_type='three-card',
    question='What should I focus on?'
)
```

## Support

- **Documentation**: https://docs.mirastros.com
- **API Status**: https://status.mirastros.com
- **Support Email**: support@mirastros.com
- **Discord Community**: https://discord.gg/mirastros

## Changelog

### Version 1.0.0 (2024-01-01)
- Initial API release
- All core services implemented
- Authentication and subscription system
- Payment integration (Stripe, ЮKassa)
- RAG system for enhanced AI responses
- Streaming chat support

