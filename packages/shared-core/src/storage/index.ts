/**
 * Storage Abstraction
 * Platform-agnostic storage interface for Web (localStorage) and Mobile (AsyncStorage)
 */

export interface IStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Web Storage Implementation (localStorage)
 */
export class WebStorage implements IStorage {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('WebStorage.getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('WebStorage.setItem error:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('WebStorage.removeItem error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('WebStorage.clear error:', error);
    }
  }
}

/**
 * Mobile Storage Implementation (AsyncStorage)
 * Note: Requires @react-native-async-storage/async-storage to be installed
 */
export class MobileStorage implements IStorage {
  private AsyncStorage: any;

  constructor() {
    // Dynamically import AsyncStorage to avoid errors in web environment
    try {
      this.AsyncStorage = require('@react-native-async-storage/async-storage').default;
    } catch (error) {
      console.warn('AsyncStorage not available. Install @react-native-async-storage/async-storage');
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.AsyncStorage) return null;
    try {
      return await this.AsyncStorage.getItem(key);
    } catch (error) {
      console.error('MobileStorage.getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!this.AsyncStorage) return;
    try {
      await this.AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('MobileStorage.setItem error:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    if (!this.AsyncStorage) return;
    try {
      await this.AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('MobileStorage.removeItem error:', error);
    }
  }

  async clear(): Promise<void> {
    if (!this.AsyncStorage) return;
    try {
      await this.AsyncStorage.clear();
    } catch (error) {
      console.error('MobileStorage.clear error:', error);
    }
  }
}
