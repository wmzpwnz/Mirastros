/**
 * Biometric Authentication Service
 * 
 * Handles Face ID / Touch ID authentication for secure app access
 */

import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export interface BiometricCapabilities {
  isAvailable: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  biometricType: 'faceId' | 'touchId' | 'fingerprint' | 'iris' | 'none';
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  warning?: string;
}

export class BiometricAuthService {
  /**
   * Check if biometric authentication is available on the device
   */
  static async checkCapabilities(): Promise<BiometricCapabilities> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      // Determine biometric type
      let biometricType: BiometricCapabilities['biometricType'] = 'none';
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = Platform.OS === 'ios' ? 'faceId' : 'fingerprint';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = Platform.OS === 'ios' ? 'touchId' : 'fingerprint';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometricType = 'iris';
      }

      return {
        isAvailable: hasHardware && isEnrolled,
        hasHardware,
        isEnrolled,
        supportedTypes,
        biometricType,
      };
    } catch (error) {
      console.error('Error checking biometric capabilities:', error);
      return {
        isAvailable: false,
        hasHardware: false,
        isEnrolled: false,
        supportedTypes: [],
        biometricType: 'none',
      };
    }
  }

  /**
   * Get user-friendly biometric type name
   */
  static getBiometricTypeName(type: BiometricCapabilities['biometricType']): string {
    switch (type) {
      case 'faceId':
        return 'Face ID';
      case 'touchId':
        return 'Touch ID';
      case 'fingerprint':
        return 'Fingerprint';
      case 'iris':
        return 'Iris';
      default:
        return 'Biometric';
    }
  }

  /**
   * Authenticate user with biometrics
   */
  static async authenticate(
    promptMessage?: string,
    cancelLabel?: string
  ): Promise<BiometricAuthResult> {
    try {
      const capabilities = await this.checkCapabilities();

      if (!capabilities.isAvailable) {
        return {
          success: false,
          error: capabilities.hasHardware
            ? 'No biometric credentials enrolled. Please set up Face ID or Touch ID in your device settings.'
            : 'Biometric authentication is not available on this device.',
        };
      }

      const biometricName = this.getBiometricTypeName(capabilities.biometricType);
      const defaultPrompt = `Authenticate with ${biometricName}`;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || defaultPrompt,
        cancelLabel: cancelLabel || 'Cancel',
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return { success: true };
      } else {
        // Handle different error types
        let errorMessage = 'Authentication failed';
        if (result.error === 'user_cancel') {
          errorMessage = 'Authentication cancelled by user';
        } else if (result.error === 'system_cancel') {
          errorMessage = 'Authentication cancelled by system';
        } else if (result.error === 'lockout') {
          errorMessage = 'Too many failed attempts. Please try again later.';
        } else if (result.error === 'lockout_permanent') {
          errorMessage = 'Biometric authentication is locked. Please use your device passcode.';
        } else if (result.error === 'not_enrolled') {
          errorMessage = 'No biometric credentials enrolled';
        }

        return {
          success: false,
          error: errorMessage,
          warning: result.warning,
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during authentication',
      };
    }
  }

  /**
   * Authenticate for login
   */
  static async authenticateForLogin(): Promise<BiometricAuthResult> {
    return this.authenticate(
      'Sign in to Mirastros',
      'Use Password'
    );
  }

  /**
   * Authenticate for sensitive action
   */
  static async authenticateForAction(action: string): Promise<BiometricAuthResult> {
    return this.authenticate(
      `Authenticate to ${action}`,
      'Cancel'
    );
  }

  /**
   * Check if device supports biometric authentication
   */
  static async isSupported(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      return hasHardware;
    } catch (error) {
      console.error('Error checking biometric support:', error);
      return false;
    }
  }

  /**
   * Check if biometric credentials are enrolled
   */
  static async isEnrolled(): Promise<boolean> {
    try {
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return isEnrolled;
    } catch (error) {
      console.error('Error checking biometric enrollment:', error);
      return false;
    }
  }

  /**
   * Get security level of biometric authentication
   */
  static async getSecurityLevel(): Promise<LocalAuthentication.SecurityLevel> {
    try {
      return await LocalAuthentication.getEnrolledLevelAsync();
    } catch (error) {
      console.error('Error getting security level:', error);
      return LocalAuthentication.SecurityLevel.NONE;
    }
  }
}
