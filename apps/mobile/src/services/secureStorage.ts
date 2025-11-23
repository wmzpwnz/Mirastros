/**
 * Secure Storage Service
 * 
 * Provides secure storage for sensitive data like authentication tokens
 * using Expo SecureStore for encrypted storage on device.
 */

import * as SecureStore from 'expo-secure-store';

const KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_EMAIL: 'user_email',
  BIOMETRIC_ENABLED: 'biometric_enabled',
} as const;

export class SecureStorageService {
  /**
   * Store authentication token securely
   */
  static async setAuthToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error storing auth token:', error);
      throw new Error('Failed to store authentication token');
    }
  }

  /**
   * Retrieve authentication token
   */
  static async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      return null;
    }
  }

  /**
   * Store refresh token securely
   */
  static async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      console.error('Error storing refresh token:', error);
      throw new Error('Failed to store refresh token');
    }
  }

  /**
   * Retrieve refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error retrieving refresh token:', error);
      return null;
    }
  }

  /**
   * Store user email for biometric login
   */
  static async setUserEmail(email: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.USER_EMAIL, email);
    } catch (error) {
      console.error('Error storing user email:', error);
      throw new Error('Failed to store user email');
    }
  }

  /**
   * Retrieve user email
   */
  static async getUserEmail(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(KEYS.USER_EMAIL);
    } catch (error) {
      console.error('Error retrieving user email:', error);
      return null;
    }
  }

  /**
   * Enable biometric authentication
   */
  static async setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.BIOMETRIC_ENABLED, enabled.toString());
    } catch (error) {
      console.error('Error setting biometric enabled:', error);
      throw new Error('Failed to set biometric preference');
    }
  }

  /**
   * Check if biometric authentication is enabled
   */
  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const value = await SecureStore.getItemAsync(KEYS.BIOMETRIC_ENABLED);
      return value === 'true';
    } catch (error) {
      console.error('Error checking biometric enabled:', error);
      return false;
    }
  }

  /**
   * Clear all stored authentication data
   */
  static async clearAuthData(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(KEYS.AUTH_TOKEN),
        SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(KEYS.USER_EMAIL),
        SecureStore.deleteItemAsync(KEYS.BIOMETRIC_ENABLED),
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw new Error('Failed to clear authentication data');
    }
  }

  /**
   * Check if user has stored credentials
   */
  static async hasStoredCredentials(): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync(KEYS.AUTH_TOKEN);
      return token !== null;
    } catch (error) {
      console.error('Error checking stored credentials:', error);
      return false;
    }
  }
}
