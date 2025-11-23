# Offline Support - Quick Start Guide

## 🚀 Quick Implementation (3 Steps)

### 1. Import the Hook and API
```typescript
import { useOfflineApi } from '../src/hooks/useOfflineApi';
import { TarotAPI } from '../src/services/api';
```

### 2. Use the Hook
```typescript
const { data, loading, error, fromCache, execute } = useOfflineApi(TarotAPI.getReading);
```

### 3. Call the API
```typescript
await execute(cards, question);
```

## 📦 Display Cached Data Indicator

```typescript
{fromCache && (
  <View className="bg-turquoise/10 border border-turquoise/30 rounded-lg px-3 py-2 mb-4">
    <Text className="text-turquoise text-xs text-center">
      📦 Cached Data - Loaded from offline storage
    </Text>
  </View>
)}
```

## 🔌 Available APIs

```typescript
// Tarot
TarotAPI.getReading(cards: string[], question?: string)

// Horoscope
HoroscopeAPI.getDaily(sign: string)
HoroscopeAPI.getWeekly(sign: string)
HoroscopeAPI.getPersonalized(birthData: any)

// Natal Chart
NatalChartAPI.calculate(birthData)
NatalChartAPI.getUserChart(userId: string)

// Numerology
NumerologyAPI.calculate({ full_name, birth_date })

// Dream
DreamAPI.interpret(dreamText: string)

// Runes
RunesAPI.getReading(spreadType: string, question?: string)

// I Ching
IChingAPI.consult(question: string, method?: 'coin' | 'yarrow')

// Auth
AuthAPI.login(email: string, password: string)
AuthAPI.register(data)
AuthAPI.logout()
```

## ✅ What's Automatic

- ✅ Caching GET requests (7-day expiry)
- ✅ Queuing POST/PUT/DELETE when offline
- ✅ Auto-sync when connection restored
- ✅ Retry logic (3 attempts)
- ✅ Auth token management
- ✅ Network status detection

## 🎯 Complete Example

```typescript
import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useOfflineApi } from '../src/hooks/useOfflineApi';
import { TarotAPI } from '../src/services/api';

export default function MyScreen() {
  const [cards, setCards] = useState(['The Fool', 'The Magician']);
  const { data, loading, error, fromCache, execute } = useOfflineApi(TarotAPI.getReading);

  const handleGetReading = async () => {
    await execute(cards, 'My question');
  };

  return (
    <View>
      {loading && <ActivityIndicator />}
      
      {error && (
        <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <Text className="text-red-400">{error}</Text>
        </View>
      )}
      
      {data && (
        <View>
          {fromCache && (
            <Text className="text-turquoise text-xs">📦 Cached</Text>
          )}
          <Text>{data.interpretation}</Text>
        </View>
      )}
      
      <TouchableOpacity onPress={handleGetReading}>
        <Text>Get Reading</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## 🧪 Testing Offline

1. Enable airplane mode
2. Try to make API calls
3. Check OfflineIndicator shows pending requests
4. Disable airplane mode
5. Watch auto-sync happen

## 📝 Environment Setup

Create `.env` file:
```bash
EXPO_PUBLIC_API_URL=http://localhost:8000
```

## 🔧 Manual Sync

```typescript
import { OfflineSyncService } from '../src/services/offlineSync';

// Trigger sync
await OfflineSyncService.manualSync();

// Get status
const status = await OfflineSyncService.getSyncStatus();
```

## 📚 Full Documentation

See `OFFLINE_SUPPORT_GUIDE.md` for complete documentation.
