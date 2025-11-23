import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CachedReading {
  id: string;
  type: 'tarot' | 'horoscope' | 'natal' | 'numerology' | 'dream' | 'runes' | 'iching';
  data: any;
  timestamp: number;
}

export interface OfflineRequest {
  id: string;
  endpoint: string;
  method: string;
  body: any;
  timestamp: number;
}

const CACHE_PREFIX = '@mirastros_cache_';
const OFFLINE_QUEUE_KEY = '@mirastros_offline_queue';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export class StorageService {
  // Cache reading results
  static async cacheReading(reading: CachedReading): Promise<void> {
    try {
      const key = `${CACHE_PREFIX}${reading.type}_${reading.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(reading));
    } catch (error) {
      console.error('Error caching reading:', error);
    }
  }

  // Get cached reading
  static async getCachedReading(type: string, id: string): Promise<CachedReading | null> {
    try {
      const key = `${CACHE_PREFIX}${type}_${id}`;
      const data = await AsyncStorage.getItem(key);
      
      if (!data) return null;
      
      const reading: CachedReading = JSON.parse(data);
      
      // Check if cache is expired
      if (Date.now() - reading.timestamp > CACHE_EXPIRY) {
        await AsyncStorage.removeItem(key);
        return null;
      }
      
      return reading;
    } catch (error) {
      console.error('Error getting cached reading:', error);
      return null;
    }
  }

  // Get all cached readings
  static async getAllCachedReadings(): Promise<CachedReading[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      
      const readings: CachedReading[] = [];
      
      for (const key of cacheKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const reading: CachedReading = JSON.parse(data);
          
          // Skip expired cache
          if (Date.now() - reading.timestamp <= CACHE_EXPIRY) {
            readings.push(reading);
          } else {
            await AsyncStorage.removeItem(key);
          }
        }
      }
      
      return readings.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error getting all cached readings:', error);
      return [];
    }
  }

  // Add request to offline queue
  static async addToOfflineQueue(request: OfflineRequest): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      const queue: OfflineRequest[] = queueData ? JSON.parse(queueData) : [];
      
      queue.push(request);
      
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error adding to offline queue:', error);
    }
  }

  // Get offline queue
  static async getOfflineQueue(): Promise<OfflineRequest[]> {
    try {
      const queueData = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('Error getting offline queue:', error);
      return [];
    }
  }

  // Clear offline queue
  static async clearOfflineQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    } catch (error) {
      console.error('Error clearing offline queue:', error);
    }
  }

  // Remove specific request from queue
  static async removeFromOfflineQueue(requestId: string): Promise<void> {
    try {
      const queue = await this.getOfflineQueue();
      const updatedQueue = queue.filter(req => req.id !== requestId);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updatedQueue));
    } catch (error) {
      console.error('Error removing from offline queue:', error);
    }
  }

  // Clear all cache
  static async clearAllCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}
