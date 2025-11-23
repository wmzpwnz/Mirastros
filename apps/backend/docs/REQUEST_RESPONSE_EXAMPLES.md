# API Request & Response Examples

This document provides comprehensive examples of API requests and responses for all major endpoints.

## Table of Contents

1. [Authentication](#authentication)
2. [Natal Chart](#natal-chart)
3. [Tarot Reading](#tarot-reading)
4. [Horoscope](#horoscope)
5. [Numerology](#numerology)
6. [Dream Interpretation](#dream-interpretation)
7. [AI Chat](#ai-chat)
8. [Subscriptions](#subscriptions)
9. [Shop](#shop)

## Authentication

### Register New User

**Request:**
```bash
curl -X POST https://www.mirastros.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "astro.lover@example.com",
    "password": "MySecure123!",
    "full_name": "Sarah Johnson",
    "birth_date": "1995-06-15",
    "birth_time": "08:30:00",
    "birth_location": "Los Angeles, CA, USA"
  }'
```

**Response (201 Created):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "astro.lover@example.com",
  "full_name": "Sarah Johnson",
  "birth_date": "1995-06-15",
  "birth_time": "08:30:00",
  "birth_location": "Los Angeles, CA, USA",
  "subscription_tier": "freemium",
  "subscription_expires": null,
  "created_at": "2024-01-15T10:30:00Z",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhMWIyYzNkNC1lNWY2LTc4OTAtYWJjZC1lZjEyMzQ1Njc4OTAiLCJlbWFpbCI6ImFzdHJvLmxvdmVyQGV4YW1wbGUuY29tIiwic3Vic2NyaXB0aW9uX3RpZXIiOiJmcmVlbWl1bSIsImV4cCI6MTcwNTMxNzAwMCwiaWF0IjoxNzA1MzEzNDAwLCJ0eXBlIjoiYWNjZXNzIn0.signature",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhMWIyYzNkNC1lNWY2LTc4OTAtYWJjZC1lZjEyMzQ1Njc4OTAiLCJleHAiOjE3MDc5MDU0MDAsImlhdCI6MTcwNTMxMzQwMCwidHlwZSI6InJlZnJlc2gifQ.signature",
  "token_type": "bearer"
}
```

### Login

**Request:**
```bash
curl -X POST https://www.mirastros.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "astro.lover@example.com",
    "password": "MySecure123!"
  }'
```

**Response (200 OK):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```


## Natal Chart

### Calculate Natal Chart

**Request:**
```bash
curl -X POST https://www.mirastros.com/api/natal/calculate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "birth_date": "1995-06-15",
    "birth_time": "08:30:00",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "house_system": "placidus"
  }'
```

**Response (200 OK):**
```json
{
  "id": "chart-uuid-123",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "birth_date": "1995-06-15",
  "birth_time": "08:30:00",
  "location": {
    "latitude": 34.0522,
    "longitude": -118.2437,
    "city": "Los Angeles",
    "country": "USA"
  },
  "house_system": "placidus",
  "planets": {
    "sun": {
      "sign": "Gemini",
      "degree": 23.45,
      "house": 10,
      "retrograde": false
    },
    "moon": {
      "sign": "Pisces",
      "degree": 12.30,
      "house": 7,
      "retrograde": false
    },
    "mercury": {
      "sign": "Gemini",
      "degree": 18.20,
      "house": 10,
      "retrograde": false
    },
    "venus": {
      "sign": "Cancer",
      "degree": 5.15,
      "house": 11,
      "retrograde": false
    },
    "mars": {
      "sign": "Virgo",
      "degree": 28.50,
      "house": 1,
      "retrograde": false
    },
    "jupiter": {
      "sign": "Sagittarius",
      "degree": 15.40,
      "house": 4,
      "retrograde": false
    },
    "saturn": {
      "sign": "Pisces",
      "degree": 0.25,
      "house": 7,
      "retrograde": false
    },
    "uranus": {
      "sign": "Capricorn",
      "degree": 28.10,
      "house": 5,
      "retrograde": true
    },
    "neptune": {
      "sign": "Capricorn",
      "degree": 22.35,
      "house": 5,
      "retrograde": true
    },
    "pluto": {
      "sign": "Scorpio",
      "degree": 28.45,
      "house": 3,
      "retrograde": true
    }
  },
  "houses": {
    "1": {"sign": "Virgo", "degree": 15.20},
    "2": {"sign": "Libra", "degree": 10.45},
    "3": {"sign": "Scorpio", "degree": 8.30},
    "4": {"sign": "Sagittarius", "degree": 12.15},
    "5": {"sign": "Capricorn", "degree": 18.50},
    "6": {"sign": "Aquarius", "degree": 22.10},
    "7": {"sign": "Pisces", "degree": 15.20},
    "8": {"sign": "Aries", "degree": 10.45},
    "9": {"sign": "Taurus", "degree": 8.30},
    "10": {"sign": "Gemini", "degree": 12.15},
    "11": {"sign": "Cancer", "degree": 18.50},
    "12": {"sign": "Leo", "degree": 22.10}
  },
  "aspects": [
    {
      "planet1": "sun",
      "planet2": "moon",
      "aspect": "square",
      "orb": 1.15,
      "applying": true
    },
    {
      "planet1": "sun",
      "planet2": "mercury",
      "aspect": "conjunction",
      "orb": 5.25,
      "applying": false
    },
    {
      "planet1": "venus",
      "planet2": "mars",
      "aspect": "sextile",
      "orb": 6.65,
      "applying": true
    },
    {
      "planet1": "moon",
      "planet2": "neptune",
      "aspect": "trine",
      "orb": 10.05,
      "applying": false
    }
  ],
  "interpretation": "Your Sun in Gemini in the 10th house indicates a natural communicator with strong career ambitions. You're intellectually curious and thrive in environments that allow you to express ideas and connect with others. The Moon in Pisces in the 7th house suggests deep emotional sensitivity in relationships and a need for spiritual connection with partners. The square between your Sun and Moon creates an internal tension between your public persona and private emotional needs, which can be a source of creative energy when balanced properly. Mercury conjunct Sun amplifies your communication skills and mental agility. Venus in Cancer in the 11th house brings warmth to friendships and social connections, with a nurturing approach to group dynamics.",
  "calculated_at": "2024-01-15T10:35:00Z"
}
```

## Tarot Reading

### Three-Card Reading

**Request:**
```bash
curl -X POST https://www.mirastros.com/api/tarot/reading \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "spread_type": "three-card",
    "question": "What should I focus on in my career this month?",
    "reversed_allowed": true
  }'
```

**Response (200 OK):**
```json
{
  "id": "reading-uuid-456",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "spread_type": "three-card",
  "question": "What should I focus on in my career this month?",
  "cards": [
    {
      "position": 1,
      "position_name": "Past",
      "card": "The Fool",
      "suit": "Major Arcana",
      "number": 0,
      "reversed": false,
      "meaning": "New beginnings, innocence, spontaneity, free spirit",
      "image_url": "/cards/major/00-fool.jpg"
    },
    {
      "position": 2,
      "position_name": "Present",
      "card": "Three of Pentacles",
      "suit": "Pentacles",
      "number": 3,
      "reversed": false,
      "meaning": "Teamwork, collaboration, learning, implementation",
      "image_url": "/cards/pentacles/03-three.jpg"
    },
    {
      "position": 3,
      "position_name": "Future",
      "card": "The Star",
      "suit": "Major Arcana",
      "number": 17,
      "reversed": false,
      "meaning": "Hope, faith, purpose, renewal, spirituality",
      "image_url": "/cards/major/17-star.jpg"
    }
  ],
  "interpretation": "**Past - The Fool:** Your recent career journey has been marked by a willingness to take risks and embrace new opportunities. You've approached challenges with fresh eyes and an open mind, which has positioned you well for growth.\n\n**Present - Three of Pentacles:** Currently, your focus should be on collaboration and skill development. This is a time to work closely with colleagues, learn from mentors, and contribute your expertise to team projects. Your efforts are being noticed and appreciated.\n\n**Future - The Star:** The path ahead is illuminated with hope and inspiration. Your dedication to teamwork and continuous learning will lead to a period of renewed purpose and recognition. Trust in your abilities and maintain your optimistic outlook - success is on the horizon.\n\n**Overall Guidance:** This month, prioritize collaborative projects and be open to learning from others. Your willingness to be a team player while maintaining your unique perspective will open doors to exciting opportunities. Stay focused on your long-term vision while being present in your current responsibilities.",
  "clarify_button": true,
  "created_at": "2024-01-15T11:00:00Z"
}
```

### Celtic Cross Reading

**Request:**
```bash
curl -X POST https://www.mirastros.com/api/tarot/reading \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "spread_type": "celtic-cross",
    "question": "What do I need to know about my relationship?",
    "reversed_allowed": true
  }'
```

**Response (200 OK):**
```json
{
  "id": "reading-uuid-789",
  "spread_type": "celtic-cross",
  "question": "What do I need to know about my relationship?",
  "cards": [
    {
      "position": 1,
      "position_name": "Present Situation",
      "card": "Two of Cups",
      "suit": "Cups",
      "number": 2,
      "reversed": false,
      "meaning": "Partnership, unity, attraction, connection"
    },
    {
      "position": 2,
      "position_name": "Challenge",
      "card": "Five of Swords",
      "suit": "Swords",
      "number": 5,
      "reversed": true,
      "meaning": "Reconciliation, making amends, past resentment"
    },
    {
      "position": 3,
      "position_name": "Foundation",
      "card": "The Lovers",
      "suit": "Major Arcana",
      "number": 6,
      "reversed": false,
      "meaning": "Love, harmony, relationships, values alignment"
    },
    {
      "position": 4,
      "position_name": "Recent Past",
      "card": "Three of Swords",
      "suit": "Swords",
      "number": 3,
      "reversed": false,
      "meaning": "Heartbreak, emotional pain, sorrow, grief"
    },
    {
      "position": 5,
      "position_name": "Possible Future",
      "card": "Ten of Cups",
      "suit": "Cups",
      "number": 10,
      "reversed": false,
      "meaning": "Divine love, blissful relationships, harmony, alignment"
    },
    {
      "position": 6,
      "position_name": "Near Future",
      "card": "Knight of Cups",
      "suit": "Cups",
      "court": "Knight",
      "reversed": false,
      "meaning": "Romance, charm, imagination, beauty"
    },
    {
      "position": 7,
      "position_name": "Your Approach",
      "card": "Queen of Cups",
      "suit": "Cups",
      "court": "Queen",
      "reversed": false,
      "meaning": "Compassion, calm, comfort, emotional stability"
    },
    {
      "position": 8,
      "position_name": "External Influences",
      "card": "The Sun",
      "suit": "Major Arcana",
      "number": 19,
      "reversed": false,
      "meaning": "Joy, success, celebration, positivity"
    },
    {
      "position": 9,
      "position_name": "Hopes and Fears",
      "card": "Four of Wands",
      "suit": "Wands",
      "number": 4,
      "reversed": false,
      "meaning": "Celebration, joy, harmony, relaxation, homecoming"
    },
    {
      "position": 10,
      "position_name": "Outcome",
      "card": "The World",
      "suit": "Major Arcana",
      "number": 21,
      "reversed": false,
      "meaning": "Completion, accomplishment, travel, fulfillment"
    }
  ],
  "interpretation": "Your relationship reading reveals a powerful journey of healing and growth...\n\n[Full detailed interpretation for all 10 positions]",
  "clarify_button": true,
  "created_at": "2024-01-15T11:15:00Z"
}
```

