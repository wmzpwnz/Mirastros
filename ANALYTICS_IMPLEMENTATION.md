# Analytics Implementation Guide

## Overview

The Mirastros Universal platform includes a comprehensive analytics system that tracks user behavior, service usage, subscription conversions, and AI performance metrics. The system supports both internal analytics (stored in PostgreSQL) and external analytics platforms (Mixpanel and Amplitude).

## Architecture

### Backend Components

1. **Analytics Event Model** (`app/models/analytics_event.py`)
   - Stores all analytics events in PostgreSQL
   - Includes event type, user ID, timestamp, metadata, platform, and performance metrics
   - Indexed for fast querying

2. **Analytics Service** (`app/services/analytics.py`)
   - Core service for tracking events and generating metrics
   - Methods for registration stats, conversion rates, service usage, retention, and AI performance
   - Automatically sends events to external analytics platforms

3. **External Analytics Service** (`app/services/external_analytics.py`)
   - Integration with Mixpanel and Amplitude
   - Asynchronous event tracking
   - User identification and property updates

4. **Analytics API** (`app/api/analytics.py`)
   - REST endpoints for tracking events and retrieving metrics
   - Admin-only endpoints for sensitive data
   - Public endpoint for client-side event tracking

### Frontend Components

1. **Analytics Client** (`packages/shared-core/src/analytics/index.ts`)
   - TypeScript client for tracking events from frontend
   - Session management
   - Automatic timing for service usage

2. **React Hook** (`packages/shared-core/src/hooks/useAnalytics.ts`)
   - Easy-to-use React hook for analytics
   - Page view tracking
   - Service usage tracking with timing

3. **Admin Dashboard** (`apps/admin/src/app/analytics/page.tsx`)
   - Real-time analytics visualization
   - Charts and metrics
   - Connected to backend API

## Tracked Events

### User Lifecycle
- `USER_REGISTERED` - New user registration
- `USER_LOGIN` - User login
- `USER_LOGOUT` - User logout

### Subscription Events
- `SUBSCRIPTION_CREATED` - New subscription created
- `SUBSCRIPTION_UPGRADED` - Subscription upgraded to higher tier
- `SUBSCRIPTION_DOWNGRADED` - Subscription downgraded
- `SUBSCRIPTION_CANCELLED` - Subscription cancelled
- `SUBSCRIPTION_RENEWED` - Subscription renewed

### Service Usage
- `SERVICE_TAROT` - Tarot reading
- `SERVICE_HOROSCOPE` - Horoscope generation
- `SERVICE_NATAL_CHART` - Natal chart calculation
- `SERVICE_NUMEROLOGY` - Numerology calculation
- `SERVICE_DREAM` - Dream interpretation
- `SERVICE_RUNES` - Runes reading
- `SERVICE_ICHING` - I Ching consultation
- `SERVICE_LENORMAND` - Lenormand reading
- `SERVICE_TRANSITS` - Planetary transits
- `SERVICE_SYNASTRY` - Compatibility analysis
- `SERVICE_LUNAR` - Lunar calendar
- `SERVICE_CRYSTALS` - Crystal recommendations
- `SERVICE_RITUALS` - Ritual generation
- `SERVICE_HORARY` - Horary astrology
- `SERVICE_CHAKRA` - Chakra analysis
- `SERVICE_SOLAR_RETURN` - Solar return chart
- `SERVICE_KARMIC` - Karmic tasks
- `SERVICE_MANDALA` - Mandala generation

### AI Assistant
- `AI_CHAT_STARTED` - Chat session started
- `AI_CHAT_MESSAGE` - Chat message sent

### Shop Events
- `SHOP_PRODUCT_VIEW` - Product viewed
- `SHOP_CART_ADD` - Product added to cart
- `SHOP_ORDER_CREATED` - Order created
- `SHOP_ORDER_COMPLETED` - Order completed

### Journal
- `JOURNAL_ENTRY_CREATED` - Journal entry created

## Backend Usage

### Tracking Events

```python
from app.services.analytics import AnalyticsService
from app.models.analytics_event import EventType

# Track a simple event
await AnalyticsService.track_event(
    db=db,
    event_type=EventType.USER_REGISTERED,
    user_id=user.id,
    platform="web",
    metadata={"email": user.email}
)

# Track service usage with timing
await AnalyticsService.track_event(
    db=db,
    event_type=EventType.SERVICE_TAROT,
    user_id=user.id,
    platform="mobile",
    response_time_ms=1250,
    metadata={"spread_type": "3-card"}
)
```

### Using the Decorator

```python
from app.core.analytics_decorator import track_service_usage
from app.models.analytics_event import EventType

@track_service_usage(EventType.SERVICE_TAROT)
async def get_tarot_reading(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Your service logic here
    return result
```

### Retrieving Metrics

```python
# Get registration stats
stats = await AnalyticsService.get_user_registrations(
    db=db,
    start_date=datetime.now() - timedelta(days=30),
    platform="web"
)

# Get conversion rates
conversions = await AnalyticsService.get_subscription_conversions(
    db=db,
    start_date=datetime.now() - timedelta(days=30)
)

# Get service usage
usage = await AnalyticsService.get_service_usage(
    db=db,
    user_id=user.id  # Optional: filter by user
)

# Get retention stats
retention = await AnalyticsService.get_user_retention(
    db=db,
    cohort_date=datetime.now() - timedelta(days=30)
)

# Get AI performance
performance = await AnalyticsService.get_ai_performance_metrics(
    db=db,
    start_date=datetime.now() - timedelta(hours=24)
)
```

## Frontend Usage

### Initialize Analytics

```typescript
// In your app initialization (e.g., _app.tsx or main.tsx)
import { initAnalytics } from '@mirastros/shared-core/analytics';

initAnalytics({
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  platform: 'web', // or 'mobile', 'telegram', 'vk'
  getAuthToken: () => localStorage.getItem('auth_token'),
});
```

### Track Events

```typescript
import { trackEvent, AnalyticsEvent } from '@mirastros/shared-core/analytics';

// Track a simple event
await trackEvent(AnalyticsEvent.USER_LOGIN);

// Track with metadata
await trackEvent(AnalyticsEvent.SERVICE_TAROT, {
  spread_type: '3-card',
  question_category: 'love',
});

// Track with timing
const startTime = Date.now();
const result = await fetchTarotReading();
await trackEvent(
  AnalyticsEvent.SERVICE_TAROT,
  { spread_type: '3-card' },
  Date.now() - startTime
);
```

### Using React Hook

```typescript
import { useAnalytics, usePageView } from '@mirastros/shared-core/hooks/useAnalytics';
import { AnalyticsEvent } from '@mirastros/shared-core/analytics';

function TarotPage() {
  const { track, trackService } = useAnalytics();
  
  // Track page view on mount
  usePageView('tarot');
  
  const handleGetReading = async () => {
    // Track with automatic timing
    const result = await trackService(
      AnalyticsEvent.SERVICE_TAROT,
      () => fetchTarotReading(),
      { spread_type: '3-card' }
    );
    
    setReading(result);
  };
  
  return (
    <div>
      <button onClick={handleGetReading}>Get Reading</button>
    </div>
  );
}
```

## External Analytics Setup

### Mixpanel

1. Sign up at https://mixpanel.com
2. Create a new project
3. Copy your project token
4. Add to `.env`:
   ```
   MIXPANEL_TOKEN=your_mixpanel_token
   ```

### Amplitude

1. Sign up at https://amplitude.com
2. Create a new project
3. Copy your API key
4. Add to `.env`:
   ```
   AMPLITUDE_API_KEY=your_amplitude_api_key
   ```

## Database Migration

Run the analytics migration to create the `analytics_events` table:

```bash
cd apps/backend
alembic upgrade head
```

## API Endpoints

### Public Endpoints

- `POST /analytics/track` - Track an event (requires authentication)

### Admin Endpoints

- `GET /analytics/registrations` - Get registration statistics
- `GET /analytics/conversions` - Get subscription conversion rates
- `GET /analytics/service-usage` - Get service usage statistics
- `GET /analytics/retention` - Get user retention statistics
- `GET /analytics/ai-performance` - Get AI performance metrics

## Admin Dashboard

Access the analytics dashboard at `/analytics` in the admin panel. The dashboard displays:

- User registration trends
- Subscription conversion rates by tier
- Service usage statistics with response times
- User retention cohort analysis
- AI performance metrics (response times, token usage)

## Performance Considerations

1. **Asynchronous Tracking**: All analytics tracking is asynchronous and won't block user requests
2. **External Analytics**: External analytics calls are fire-and-forget and won't fail the main request
3. **Database Indexes**: The `analytics_events` table has indexes on frequently queried columns
4. **Caching**: Consider caching analytics queries for admin dashboard
5. **Batch Processing**: For high-volume events, consider implementing batch processing

## Privacy and GDPR

- User IDs are stored but can be anonymized
- Events can be tracked without user IDs for anonymous users
- Implement data retention policies (e.g., delete events older than 2 years)
- Provide user data export and deletion capabilities

## Monitoring

- Monitor external analytics API failures
- Set up alerts for unusual patterns (e.g., sudden drop in events)
- Track analytics system performance impact
- Monitor database growth and implement archiving strategy

## Future Enhancements

1. Real-time analytics dashboard with WebSocket updates
2. Custom event funnels and conversion tracking
3. A/B testing framework
4. Predictive analytics for churn prevention
5. Automated insights and anomaly detection
6. Data warehouse integration for long-term analysis
