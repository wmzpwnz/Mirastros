# Tier-Based Access Control Implementation

## Overview

This document describes the implementation of tier-based access control for the Mirastros Universal platform. The system enforces subscription tier requirements and usage limits across all API endpoints.

## Implementation Date

November 23, 2025

## Components Implemented

### 1. Access Control Module (`app/core/access_control.py`)

**Features:**
- `FeatureAccessControl` class with tier-based feature matrix
- Usage limit tracking for Freemium users via Redis
- Decorator `@require_feature_access()` for endpoint protection
- Automatic usage increment after successful requests
- Upgrade prompt generation

**Tier Feature Matrix:**

| Feature | Freemium | Premium | Platinum |
|---------|----------|---------|----------|
| Daily Horoscope | ✅ (1/day) | ✅ Unlimited | ✅ Unlimited |
| Weekly Horoscope | ❌ | ✅ Unlimited | ✅ Unlimited |
| Monthly Horoscope | ❌ | ✅ Unlimited | ✅ Unlimited |
| Tarot Reading | ✅ (1/week) | ✅ Unlimited | ✅ Unlimited |
| Natal Chart | ❌ | ✅ | ✅ |
| Dream Interpretation | ✅ (1/day) | ✅ Unlimited | ✅ Unlimited |
| Numerology | ✅ (1 total) | ✅ Unlimited | ✅ Unlimited |
| Compatibility | ✅ (1/day) | ✅ Unlimited | ✅ Unlimited |
| Clarify Chat | ❌ | ✅ | ✅ |
| Runes | ✅ (1/day) | ✅ Unlimited | ✅ Unlimited |
| I Ching | ✅ (1/day) | ✅ Unlimited | ✅ Unlimited |
| Lenormand | ✅ (1/day) | ✅ Unlimited | ✅ Unlimited |
| Transits | ❌ | ✅ | ✅ |
| Synastry | ❌ | ✅ | ✅ |
| Lunar Calendar | ✅ (3/day) | ✅ Unlimited | ✅ Unlimited |
| Crystals | ✅ (3/day) | ✅ Unlimited | ✅ Unlimited |
| Rituals | ✅ (1/day) | ✅ Unlimited | ✅ Unlimited |
| Horary | ❌ | ❌ | ✅ |
| Chakra | ✅ (1/day) | ✅ Unlimited | ✅ Unlimited |
| Solar Return | ❌ | ❌ | ✅ |
| Karmic Tasks | ✅ (1/day) | ✅ Unlimited | ✅ Unlimited |
| Mandala | ✅ (1/day) | ✅ Unlimited | ✅ Unlimited |
| Journal | ✅ (5/day) | ✅ Unlimited | ✅ Unlimited |
| Shop | ✅ | ✅ | ✅ |

### 2. Access Control API (`app/api/access.py`)

**New Endpoints:**

```
GET /access/check/{feature}
```
- Check if user has access to a specific feature
- Returns usage information and upgrade prompts
- Response includes current tier, required tier, usage stats

```
GET /access/limits
```
- Get all usage limits for current user's tier
- Returns feature access matrix with current usage
- Useful for displaying dashboard limits

```
GET /access/upgrade-info/{tier}
```
- Get detailed upgrade information for Premium or Platinum
- Returns pricing, features, and benefits
- Compares current tier with target tier

### 3. Updated API Endpoints

**Endpoints with Access Control Added:**

1. **Tarot** (`/tarot/reading`)
   - Decorator: `@require_feature_access("tarot_reading", check_usage=True)`
   - Freemium: 1 per week
   - Premium/Platinum: Unlimited

2. **Dream** (`/dreams/interpret`)
   - Decorator: `@require_feature_access("dream_interpretation", check_usage=True)`
   - Freemium: 1 per day
   - Premium/Platinum: Unlimited

3. **Numerology** (`/numerology/calculate`)
   - Decorator: `@require_feature_access("numerology", check_usage=True)`
   - Freemium: 1 calculation total
   - Premium/Platinum: Unlimited

4. **Natal Chart** (`/natal/calculate`)
   - Dependency: `Depends(require_premium)`
   - Premium/Platinum only

5. **Synastry** (`/synastry/calculate`)
   - Dependency: `Depends(require_premium)`
   - Premium/Platinum only

6. **Transits** (personal endpoints)
   - Dependency: `Depends(require_premium)`
   - Premium/Platinum only

7. **Chat** (all endpoints)
   - Dependency: `Depends(require_premium)`
   - Premium/Platinum only

8. **Horary** (`/horary/ask`)
   - Dependency: `Depends(require_platinum)`
   - Platinum only

9. **Solar Return** (`/solar-return/calculate`)
   - Dependency: `Depends(require_platinum)`
   - Platinum only

**Horoscope Endpoints:**
- Daily: Available to all (Freemium: 1/day, Premium/Platinum: unlimited)
- Weekly: `require_premium` check in endpoint logic
- Monthly: `require_premium` check in endpoint logic

### 4. Usage Tracking

**Redis Keys:**
```
usage:{user_id}:{feature}:{date}
```

**Example:**
```
usage:123e4567-e89b-12d3-a456-426614174000:tarot_reading:2025-11-23
```

**TTL:** 24 hours (auto-expires at midnight)

**Tracking Logic:**
1. Check current usage before endpoint execution
2. If limit exceeded, return 429 with upgrade prompt
3. Execute endpoint logic
4. Increment usage counter after success
5. Only tracks Freemium users (Premium/Platinum bypass)

### 5. Error Responses

**403 Forbidden - Feature Not Available:**
```json
{
  "detail": "This feature requires Premium subscription",
  "headers": {
    "X-Upgrade-Required": "premium"
  }
}
```

**429 Too Many Requests - Usage Limit Exceeded:**
```json
{
  "detail": "Daily limit reached for tarot_reading (1/1). Upgrade to Premium for unlimited access.",
  "headers": {
    "X-Upgrade-Required": "premium"
  }
}
```

**403 Forbidden - Subscription Expired:**
```json
{
  "detail": "Your subscription has expired. Please renew to continue.",
  "headers": {
    "X-Subscription-Expired": "true"
  }
}
```

### 6. Upgrade Prompts

**Premium Upgrade:**
```json
{
  "message": "Upgrade to Premium to unlock this feature",
  "required_tier": "premium",
  "price_monthly": "$9.99/month",
  "price_annual": "$99/year",
  "features": [
    "Unlimited horoscopes (daily, weekly, monthly)",
    "Full natal chart analysis",
    "Unlimited Tarot readings",
    "Clarify with Mirastros AI",
    "Planetary transits",
    "Compatibility analysis",
    "No ads"
  ]
}
```

**Platinum Upgrade:**
```json
{
  "message": "Upgrade to Platinum to unlock this feature",
  "required_tier": "platinum",
  "price_monthly": "$29.99/month",
  "price_annual": "$299/year",
  "features": [
    "All Premium features",
    "Horary astrology (specific questions)",
    "Solar return chart (yearly forecast)",
    "Priority AI processing",
    "Personalized rituals and meditations",
    "Live astrologer consultation (1/month)",
    "Priority support"
  ]
}
```

## Frontend Integration

### 1. Check Feature Access Before Rendering

```typescript
// Check if user can access a feature
const response = await fetch('/access/check/tarot_reading', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { has_access, usage_info, upgrade_prompt } = await response.json();

if (!has_access) {
  // Show upgrade prompt
  showUpgradeModal(upgrade_prompt);
} else if (usage_info && usage_info.remaining === 0) {
  // Show usage limit warning
  showUsageLimitWarning(usage_info);
}
```

### 2. Display Usage Limits in Dashboard

```typescript
// Get all limits for user's tier
const response = await fetch('/access/limits', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { tier, features } = await response.json();

// Display usage bars
features.forEach(feature => {
  if (feature.limit) {
    const percentage = (feature.current_usage / feature.limit) * 100;
    renderUsageBar(feature.name, percentage, feature.remaining);
  }
});
```

### 3. Handle 429 Errors

```typescript
try {
  const response = await fetch('/tarot/reading', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(readingRequest)
  });
  
  if (response.status === 429) {
    const upgradeRequired = response.headers.get('X-Upgrade-Required');
    const error = await response.json();
    
    // Show upgrade prompt
    showUpgradeModal({
      message: error.detail,
      tier: upgradeRequired
    });
  }
} catch (error) {
  // Handle error
}
```

### 4. Upgrade Button Component

```typescript
function UpgradeButton({ tier }: { tier: 'premium' | 'platinum' }) {
  const handleUpgrade = async () => {
    const response = await fetch(`/access/upgrade-info/${tier}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const upgradeInfo = await response.json();
    
    // Show upgrade modal with pricing and features
    showUpgradeModal(upgradeInfo);
  };
  
  return (
    <button onClick={handleUpgrade}>
      Upgrade to {tier === 'premium' ? 'Premium' : 'Platinum'}
    </button>
  );
}
```

## Testing

### 1. Test Freemium Limits

```bash
# Test tarot reading limit (1 per week)
curl -X POST http://localhost:8000/tarot/reading \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"spread_type": "one-card", "question": "Test"}'

# Second request should fail with 429
curl -X POST http://localhost:8000/tarot/reading \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"spread_type": "one-card", "question": "Test 2"}'
```

### 2. Test Premium Access

```bash
# Test natal chart (Premium required)
curl -X POST http://localhost:8000/natal/calculate \
  -H "Authorization: Bearer $FREEMIUM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
# Should return 403

curl -X POST http://localhost:8000/natal/calculate \
  -H "Authorization: Bearer $PREMIUM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
# Should succeed
```

### 3. Test Platinum Access

```bash
# Test horary (Platinum required)
curl -X POST http://localhost:8000/horary/ask \
  -H "Authorization: Bearer $PREMIUM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question": "Will I get the job?"}'
# Should return 403

curl -X POST http://localhost:8000/horary/ask \
  -H "Authorization: Bearer $PLATINUM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question": "Will I get the job?"}'
# Should succeed
```

### 4. Test Access Check Endpoint

```bash
# Check feature access
curl http://localhost:8000/access/check/tarot_reading \
  -H "Authorization: Bearer $TOKEN"

# Get usage limits
curl http://localhost:8000/access/limits \
  -H "Authorization: Bearer $TOKEN"

# Get upgrade info
curl http://localhost:8000/access/upgrade-info/premium \
  -H "Authorization: Bearer $TOKEN"
```

## Monitoring

### Redis Usage Tracking

Monitor Redis keys for usage patterns:

```bash
# Check user's usage
redis-cli KEYS "usage:*"

# Get specific user's tarot usage
redis-cli GET "usage:123e4567-e89b-12d3-a456-426614174000:tarot_reading:2025-11-23"
```

### Logs

Access control logs include:

```
INFO: User {user_id} usage for {feature}: {current}/{limit}
WARNING: User {user_id} exceeded limit for {feature}
INFO: User {user_id} blocked from {feature} - requires {tier}
```

## Future Enhancements

1. **Weekly Limits**: Currently tracking daily, add weekly tracking for features like Tarot
2. **Grace Period**: Allow 1-2 extra uses before hard blocking
3. **Usage Analytics**: Track which features hit limits most often
4. **Dynamic Limits**: Adjust limits based on server load
5. **Rollover**: Allow unused daily limits to roll over (up to a cap)
6. **Trial Periods**: Temporary Premium access for new users
7. **Feature Flags**: Enable/disable features dynamically
8. **A/B Testing**: Test different limit configurations

## Configuration

All limits are defined in `app/core/access_control.py`:

```python
FREEMIUM_LIMITS = {
    "daily_horoscope": 1,
    "tarot_reading": 1,  # Per week
    "dream_interpretation": 1,
    "numerology": 1,  # Once total
    "compatibility": 1,
    # ... more limits
}
```

To adjust limits, modify this dictionary and redeploy.

## Summary

✅ **Implemented:**
- Tier-based feature access control
- Usage limit tracking for Freemium users
- Automatic usage increment
- Upgrade prompt generation
- Access check API endpoints
- Error handling with upgrade headers
- Redis-based usage tracking with auto-expiry

✅ **Updated Endpoints:**
- Tarot, Dream, Numerology (with usage limits)
- Natal Chart, Synastry, Transits (Premium required)
- Chat (Premium required)
- Horary, Solar Return (Platinum required)
- Horoscope (tier checks in logic)

✅ **Ready for Frontend Integration:**
- Access check endpoints
- Usage limit endpoints
- Upgrade info endpoints
- Error responses with upgrade prompts

## Next Steps

1. Update remaining API endpoints (runes, iching, lenormand, etc.)
2. Add frontend components for upgrade prompts
3. Implement usage limit displays in dashboard
4. Add analytics tracking for upgrade conversions
5. Test all tier combinations thoroughly
6. Document API changes in OpenAPI spec
