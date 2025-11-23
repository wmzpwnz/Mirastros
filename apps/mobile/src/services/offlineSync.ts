import NetInfo from '@react-native-community/netinfo';
import { StorageService, OfflineRequest } from './storage';
import { ApiClient } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds

export interface SyncStatus {
  isSyncing: boolean;
  queueLength: number;
  lastSyncTime: number | null;
  failedRequests: number;
}

export class OfflineSyncService {
  private static isSyncing = false;
  private static lastSyncTime: number | null = null;
  private static failedRequests = 0;
  private static syncListeners: Array<(status: SyncStatus) => void> = [];

  // Subscribe to sync status updates
  static subscribeSyncStatus(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.push(listener);
    
    // Send initial status
    this.notifySyncStatus();
    
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of sync status
  private static async notifySyncStatus(): Promise<void> {
    const queue = await StorageService.getOfflineQueue();
    const status: SyncStatus = {
      isSyncing: this.isSyncing,
      queueLength: queue.length,
      lastSyncTime: this.lastSyncTime,
      failedRequests: this.failedRequests,
    };
    
    this.syncListeners.forEach(listener => listener(status));
  }

  // Sync offline queue when connection is restored
  static async syncOfflineQueue(): Promise<void> {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    const state = await NetInfo.fetch();
    if (!state.isConnected || !state.isInternetReachable) {
      console.log('No internet connection, skipping sync');
      return;
    }

    this.isSyncing = true;
    this.failedRequests = 0;
    await this.notifySyncStatus();

    try {
      const queue = await StorageService.getOfflineQueue();
      
      if (queue.length === 0) {
        console.log('Offline queue is empty');
        this.lastSyncTime = Date.now();
        return;
      }

      console.log(`Syncing ${queue.length} offline requests...`);

      // Sort queue by timestamp (oldest first)
      const sortedQueue = queue.sort((a, b) => a.timestamp - b.timestamp);

      for (const request of sortedQueue) {
        try {
          await this.processOfflineRequest(request);
          await StorageService.removeFromOfflineQueue(request.id);
          console.log(`✓ Synced request ${request.id}`);
          await this.notifySyncStatus();
        } catch (error) {
          console.error(`✗ Failed to sync request ${request.id}:`, error);
          this.failedRequests++;
          
          // Remove request if it's too old (older than 7 days)
          const age = Date.now() - request.timestamp;
          const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
          
          if (age > maxAge) {
            console.log(`Removing expired request ${request.id}`);
            await StorageService.removeFromOfflineQueue(request.id);
          }
        }
      }

      this.lastSyncTime = Date.now();
      console.log(`Offline sync completed. Failed: ${this.failedRequests}`);
    } catch (error) {
      console.error('Error during offline sync:', error);
    } finally {
      this.isSyncing = false;
      await this.notifySyncStatus();
    }
  }

  // Process a single offline request with retry logic
  private static async processOfflineRequest(
    request: OfflineRequest,
    attempt: number = 1
  ): Promise<void> {
    try {
      const authToken = ApiClient.getAuthToken();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(request.endpoint, {
        method: request.method,
        headers,
        body: request.body ? JSON.stringify(request.body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      // Retry logic
      if (attempt < MAX_RETRY_ATTEMPTS) {
        console.log(`Retrying request ${request.id} (attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
        return this.processOfflineRequest(request, attempt + 1);
      }
      
      throw error;
    }
  }

  // Start listening for network changes and auto-sync
  static startAutoSync(): () => void {
    // Initialize API client
    ApiClient.initialize();

    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        console.log('📡 Connection restored, starting sync...');
        this.syncOfflineQueue();
      } else {
        console.log('📡 Connection lost');
      }
    });

    // Initial sync attempt
    this.syncOfflineQueue();

    return unsubscribe;
  }

  // Manual sync trigger
  static async manualSync(): Promise<boolean> {
    try {
      await this.syncOfflineQueue();
      const queue = await StorageService.getOfflineQueue();
      return queue.length === 0;
    } catch (error) {
      console.error('Manual sync failed:', error);
      return false;
    }
  }

  // Get current sync status
  static async getSyncStatus(): Promise<SyncStatus> {
    const queue = await StorageService.getOfflineQueue();
    return {
      isSyncing: this.isSyncing,
      queueLength: queue.length,
      lastSyncTime: this.lastSyncTime,
      failedRequests: this.failedRequests,
    };
  }
}
