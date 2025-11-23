/**
 * Authentication Context
 * 
 * Manages user authentication state and provides authentication methods
 * including biometric authentication support
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SecureStorageService } from '../services/secureStorage';
import { BiometricAuthService, BiometricCapabilities } from '../services/biometricAuth';

interface User {
  id: string;
  email: string;
  fullName: string;
  subscriptionTier: 'freemium' | 'premium' | 'platinum';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricCapabilities: BiometricCapabilities | null;
  isBiometricEnabled: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithBiometric: () => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricCapabilities, setBiometricCapabilities] = useState<BiometricCapabilities | null>(null);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check biometric capabilities
      const capabilities = await BiometricAuthService.checkCapabilities();
      setBiometricCapabilities(capabilities);

      // Check if biometric is enabled
      const biometricEnabled = await SecureStorageService.isBiometricEnabled();
      setIsBiometricEnabled(biometricEnabled);

      // Check for stored auth token
      await checkAuthStatus();
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStorageService.getAuthToken();
      if (token) {
        // TODO: Validate token with backend and fetch user data
        // For now, create a mock user
        const email = await SecureStorageService.getUserEmail();
        setUser({
          id: '1',
          email: email || 'user@example.com',
          fullName: 'User',
          subscriptionTier: 'freemium',
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // TODO: Implement actual API call to backend
      // For now, simulate login
      const mockToken = 'mock_jwt_token_' + Date.now();
      const mockRefreshToken = 'mock_refresh_token_' + Date.now();

      // Store tokens securely
      await SecureStorageService.setAuthToken(mockToken);
      await SecureStorageService.setRefreshToken(mockRefreshToken);
      await SecureStorageService.setUserEmail(email);

      // Set user
      setUser({
        id: '1',
        email,
        fullName: 'User',
        subscriptionTier: 'freemium',
      });

      // If biometric is available and not yet configured, prompt user
      if (biometricCapabilities?.isAvailable && !isBiometricEnabled) {
        // This will be handled by the UI
        console.log('Biometric available - user can enable it in settings');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginWithBiometric = async () => {
    try {
      // Check if biometric is enabled
      const enabled = await SecureStorageService.isBiometricEnabled();
      if (!enabled) {
        throw new Error('Biometric authentication is not enabled');
      }

      // Authenticate with biometric
      const result = await BiometricAuthService.authenticateForLogin();
      if (!result.success) {
        throw new Error(result.error || 'Biometric authentication failed');
      }

      // Retrieve stored token
      const token = await SecureStorageService.getAuthToken();
      if (!token) {
        throw new Error('No stored credentials found');
      }

      // TODO: Validate token with backend
      // For now, just restore user session
      await checkAuthStatus();
    } catch (error) {
      console.error('Biometric login error:', error);
      throw error;
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    try {
      // TODO: Implement actual API call to backend
      // For now, simulate registration
      const mockToken = 'mock_jwt_token_' + Date.now();
      const mockRefreshToken = 'mock_refresh_token_' + Date.now();

      // Store tokens securely
      await SecureStorageService.setAuthToken(mockToken);
      await SecureStorageService.setRefreshToken(mockRefreshToken);
      await SecureStorageService.setUserEmail(email);

      // Set user
      setUser({
        id: '1',
        email,
        fullName,
        subscriptionTier: 'freemium',
      });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // TODO: Call backend logout endpoint
      
      // Clear stored credentials
      await SecureStorageService.clearAuthData();
      
      // Clear user state
      setUser(null);
      setIsBiometricEnabled(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const enableBiometric = async () => {
    try {
      if (!biometricCapabilities?.isAvailable) {
        throw new Error('Biometric authentication is not available');
      }

      // Authenticate to confirm user identity
      const result = await BiometricAuthService.authenticate(
        'Authenticate to enable biometric login',
        'Cancel'
      );

      if (!result.success) {
        throw new Error(result.error || 'Authentication failed');
      }

      // Enable biometric
      await SecureStorageService.setBiometricEnabled(true);
      setIsBiometricEnabled(true);
    } catch (error) {
      console.error('Error enabling biometric:', error);
      throw error;
    }
  };

  const disableBiometric = async () => {
    try {
      // Authenticate to confirm user identity
      const result = await BiometricAuthService.authenticate(
        'Authenticate to disable biometric login',
        'Cancel'
      );

      if (!result.success) {
        throw new Error(result.error || 'Authentication failed');
      }

      // Disable biometric
      await SecureStorageService.setBiometricEnabled(false);
      setIsBiometricEnabled(false);
    } catch (error) {
      console.error('Error disabling biometric:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        biometricCapabilities,
        isBiometricEnabled,
        login,
        loginWithBiometric,
        register,
        logout,
        enableBiometric,
        disableBiometric,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
