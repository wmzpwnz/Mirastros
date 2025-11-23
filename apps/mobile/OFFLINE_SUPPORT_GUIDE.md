# Offline Support Implementation Guide

## Overview

The mobile app now has comprehensive offline support that allows users to:
- Cache readings for offline viewing (7-day expiry)
- Queue requests when offline for automatic sync when online
- View sync status and manually trigger sync
- See cached data indicators

## Architecture

### Components

1. **StorageService** (`src/services/storage.ts`)
   - Manages AsyncStorage for caching readings
   - Handles offline request queue
   - Provides cache expiry management

2. **OfflineSyncService** (`src/services/offlineSync.ts`)
   - Syncs offline queue when connection is restored
   - Provides retry logic (3 attempts with exponential backoff)
   - Notifies listeners of sync status
   - Auto-removes expired requests (>7 days)

3. **ApiClient** (`src/services/api.ts`)
   - Unified API client with offline support
   - Automatic caching for GET requests
   - Automatic queuing for POST/PUT/DELETE when offline
   - Authentication token management

4. **OfflineIndicator** (`src/components/OfflineIndicator.tsx`)
   - Shows connection status
   - Displays pending requests count
   - Provides manual sync button
   - Shows detailed sync information

5. **useOfflineApi** (`src/hooks/useOfflineApi.ts`)
   - React hook for making API calls with offline support
   - Handles loading, error, and cache states
   - Provides execute and reset functions

## Usage Examples

### Basic API Call with Offline Support

```typescript
import { useOfflineApi } from '../src/hooks/useOfflineApi';
import { TarotAPI } from '../src/services/api';

function MyComponent() {
  const { data, loading, error, fromCache, execute } = useOfflineApi(TarotAPI.getReading);

  const handleGetReading = async () => {
    await execute(['The Fool', 'The Magician', 'The Empress'], 'My question');
  };

  return (
    <View>
      {loading && <ActivityIndicator />}
      {error && <Text>{error}</Text>}
      {data && (
        <View>
          {fromCache && <Text>📦 Cached Data</Text>}
          <Text>{data.interpretation}</Text>
        </View>
      )}
      <Button onPress={handleGetReading} title="Get Reading" />
    </View>
  );
}
```

### Auto-Fetch on Mount

```typescript
import { useOfflineApiAutoFetch } from '../src/hooks/useOfflineApi';
import { HoroscopeAPI } from '../src/services/api';

function HoroscopeScreen() {
  const { data, loading, error, fromCache } = useOfflineApiAutoFetch(
    HoroscopeAPI.getDaily,
    ['aries'], // Arguments
    [] // Dependencies (empty = fetch once on mount)
  );

  return (
    <View>
      {loading && <ActivityIndicator />}
      {data && <Text>{data.prediction}</Text>}
    </View>
  );
}
```

### Direct API Client Usage

```typescript
import { ApiClient, TarotAPI } from '../src/services/api';

// Initialize on app start
await ApiClient.initialize();

// Make authenticated request
const response = await TarotAPI.getReading(['The Fool'], 'My question');

if (response.success) {
  console.log('Data:', response.data);
  console.log('From cache:', response.fromCache);
} else {
  console.error('Error:', response.error);
}
```

### Authentication

```typescript
import { AuthAPI } from '../src/services/api';

// Login
const loginResponse = await AuthAPI.login('user@example.com', 'password');
if (loginResponse.success) {
  // Token is automatically stored and used for subsequent requests
  console.log('Logged in!');
}

// Logout
await AuthAPI.logout();
```

### Manual Sync

```typescript
import { OfflineSyncService } from '../src/services/offlineSync';

// Trigger manual sync
const success = await OfflineSyncService.manualSync();

// Get sync status
const status = await OfflineSyncService.getSyncStatus();
console.log('Queue length:', status.queueLength);
console.log('Is syncing:', status.isSyncing);
```

### Subscribe to Sync Status

```typescript
import { OfflineSyncService } from '../src/services/offlineSync';

useEffect(() => {
  const unsubscribe = OfflineSyncService.subscribeSyncStatus((status) => {
    console.log('Sync status updated:', status);
  });

  return unsubscribe;
}, []);
```

## Available API Methods

### TarotAPI
- `getReading(cards: string[], question?: string)` - Get tarot reading (cached)
- `getHistory()` - Get reading history

### HoroscopeAPI
- `getDaily(sign: string)` - Get daily horoscope (cached 24h)
- `getWeekly(sign: string)` - Get weekly horoscope (cached)
- `getPersonalized(birthData: any)` - Get personalized horoscope

### NatalChartAPI
- `calculate(birthData)` - Calculate natal chart (cached)
- `getUserChart(userId: string)` - Get user's natal chart (cached)

### NumerologyAPI
- `calculate(data)` - Calculate numerology (cached)

### DreamAPI
- `interpret(dreamText: string)` - Interpret dream (cached)
- `getHistory()` - Get dream history

### RunesAPI
- `getReading(spreadType: string, question?: string)` - Get rune reading (cached)

### IChingAPI
- `consult(question: string, method?: 'coin' | 'yarrow')` - Consult I Ching (cached)

### AuthAPI
- `login(email: string, password: string)` - Login
- `register(data)` - Register
- `logout()` - Logout
- `getCurrentUser()` - Get current user

## Cache Configuration

### Default Cache Expiry
- All cached readings: 7 days
- Horoscopes: Cached with type-specific IDs for daily/weekly/monthly

### Cache Keys
- Format: `@mirastros_cache_{type}_{id}`
- Example: `@mirastros_cache_tarot_TheFool_TheMagician_1234567890`

### Offline Queue
- Stored at: `@mirastros_offline_queue`
- Max age: 7 days (auto-removed after)
- Retry attempts: 3 with exponential backoff

## Network Status

### useNetworkStatus Hook

```typescript
import { useNetworkStatus } from '../src/hooks/useNetworkStatus';

function MyComponent() {
  const { isConnected, isInternetReachable, isOffline } = useNetworkStatus();

  return (
    <View>
      <Text>Connected: {isConnected ? 'Yes' : 'No'}</Text>
      <Text>Internet: {isInternetReachable ? 'Yes' : 'No'}</Text>
      <Text>Offline: {isOffline ? 'Yes' : 'No'}</Text>
    </View>
  );
}
```

## Best Practices

1. **Always use the API client** - Don't make direct fetch calls
2. **Use the useOfflineApi hook** - It handles all states automatically
3. **Show cache indicators** - Let users know when they're viewing cached data
4. **Handle errors gracefully** - Show helpful messages for offline scenarios
5. **Test offline scenarios** - Use airplane mode to test offline functionality

## Testing Offline Support

1. Enable airplane mode on device/simulator
2. Try to make API calls - they should be queued
3. Check OfflineIndicator - should show pending requests
4. Disable airplane mode
5. Requests should auto-sync
6. Check OfflineIndicator - should show sync progress

## Environment Variables

Add to `.env` or `app.json`:

```
EXPO_PUBLIC_API_URL=https://api.mirastros.com
```

For local development:
```
EXPO_PUBLIC_API_URL=http://localhost:8000
```

## Migration Guide

### Old Code (Direct Fetch)
```typescript
const response = await fetch('http://localhost:8000/tarot/reading', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cards }),
});
const data = await response.json();
```

### New Code (With Offline Support)
```typescript
import { TarotAPI } from '../src/services/api';
import { useOfflineApi } from '../src/hooks/useOfflineApi';

const { data, loading, error, execute } = useOfflineApi(TarotAPI.getReading);
await execute(cards);
```

## Troubleshooting

### Requests not syncing
- Check network connection
- Check OfflineIndicator for errors
- Try manual sync
- Check console logs for errors

### Cache not working
- Verify cache config is passed to API methods
- Check AsyncStorage permissions
- Clear cache: `StorageService.clearAllCache()`

### Auth token issues
- Ensure ApiClient.initialize() is called on app start
- Check token is stored: `ApiClient.getAuthToken()`
- Re-login if token is invalid

## Future Enhancements

- [ ] Conflict resolution for offline edits
- [ ] Selective sync (choose which requests to sync)
- [ ] Cache size management
- [ ] Background sync with background tasks
- [ ] Offline-first architecture with local database
