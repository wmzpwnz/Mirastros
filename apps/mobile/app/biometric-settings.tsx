/**
 * Biometric Settings Screen
 * 
 * Allows users to enable/disable biometric authentication
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { BiometricAuthService } from '../src/services/biometricAuth';

export default function BiometricSettingsScreen() {
  const router = useRouter();
  const { biometricCapabilities, isBiometricEnabled, enableBiometric, disableBiometric } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleToggleBiometric = async (value: boolean) => {
    setLoading(true);
    try {
      if (value) {
        await enableBiometric();
        Alert.alert(
          'Success',
          'Biometric authentication has been enabled. You can now use it to sign in quickly.',
          [{ text: 'OK' }]
        );
      } else {
        await disableBiometric();
        Alert.alert(
          'Disabled',
          'Biometric authentication has been disabled. You will need to use your password to sign in.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to update biometric settings',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const getBiometricIcon = () => {
    if (!biometricCapabilities) return '🔐';
    switch (biometricCapabilities.biometricType) {
      case 'faceId':
        return '👤';
      case 'touchId':
      case 'fingerprint':
        return '👆';
      case 'iris':
        return '👁️';
      default:
        return '🔐';
    }
  };

  const getBiometricDescription = () => {
    if (!biometricCapabilities?.isAvailable) {
      if (!biometricCapabilities?.hasHardware) {
        return 'Your device does not support biometric authentication.';
      }
      if (!biometricCapabilities?.isEnrolled) {
        return 'No biometric credentials are enrolled on your device. Please set up Face ID or Touch ID in your device settings.';
      }
      return 'Biometric authentication is not available.';
    }

    const typeName = BiometricAuthService.getBiometricTypeName(
      biometricCapabilities.biometricType
    );
    return `Use ${typeName} to quickly and securely sign in to Mirastros without entering your password.`;
  };

  return (
    <View className="flex-1 bg-cosmic">
      <ScrollView>
        {/* Header */}
        <View className="px-6 pt-16 pb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-6"
          >
            <Text className="text-gold text-lg">← Back</Text>
          </TouchableOpacity>

          <Text className="text-4xl font-cinzel text-gold mb-2">
            Biometric Authentication
          </Text>
          <Text className="text-silver/60 text-base">
            Secure and convenient login
          </Text>
        </View>

        {/* Biometric Status Card */}
        <View className="mx-6 mb-6 bg-white/5 border border-white/10 rounded-2xl p-6">
          <View className="flex-row items-center mb-4">
            <Text className="text-5xl mr-4">{getBiometricIcon()}</Text>
            <View className="flex-1">
              <Text className="text-silver text-xl font-semibold mb-1">
                {biometricCapabilities?.isAvailable
                  ? BiometricAuthService.getBiometricTypeName(biometricCapabilities.biometricType)
                  : 'Not Available'}
              </Text>
              <Text className="text-silver/60 text-sm">
                {biometricCapabilities?.isAvailable
                  ? isBiometricEnabled
                    ? 'Enabled'
                    : 'Disabled'
                  : 'Not supported'}
              </Text>
            </View>
          </View>

          <Text className="text-silver/80 text-sm leading-6 mb-6">
            {getBiometricDescription()}
          </Text>

          {/* Toggle Switch */}
          {biometricCapabilities?.isAvailable && (
            <View className="flex-row items-center justify-between pt-4 border-t border-white/10">
              <Text className="text-silver font-semibold">
                Enable Biometric Login
              </Text>
              <Switch
                value={isBiometricEnabled}
                onValueChange={handleToggleBiometric}
                disabled={loading}
                trackColor={{ false: '#444', true: '#BE8F44' }}
                thumbColor={isBiometricEnabled ? '#FFD700' : '#888'}
              />
            </View>
          )}

          {/* Setup Instructions */}
          {!biometricCapabilities?.isAvailable && biometricCapabilities?.hasHardware && (
            <TouchableOpacity
              className="bg-gold/10 border border-gold/30 rounded-xl py-3 mt-4"
              onPress={() => {
                Alert.alert(
                  'Setup Instructions',
                  'To enable biometric authentication:\n\n1. Open your device Settings\n2. Go to Face ID & Passcode (or Touch ID & Passcode)\n3. Set up Face ID or Touch ID\n4. Return to Mirastros and enable biometric login',
                  [{ text: 'OK' }]
                );
              }}
            >
              <Text className="text-gold text-center font-semibold">
                Setup Instructions
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Security Information */}
        <View className="mx-6 mb-6 bg-white/5 border border-white/10 rounded-2xl p-6">
          <Text className="text-silver text-lg font-semibold mb-4">
            Security Information
          </Text>

          <View className="mb-4">
            <Text className="text-silver/80 text-sm leading-6">
              • Your biometric data never leaves your device
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-silver/80 text-sm leading-6">
              • Authentication is handled by your device's secure enclave
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-silver/80 text-sm leading-6">
              • Your login credentials are encrypted and stored securely
            </Text>
          </View>

          <View>
            <Text className="text-silver/80 text-sm leading-6">
              • You can disable biometric login at any time
            </Text>
          </View>
        </View>

        {/* Additional Options */}
        {biometricCapabilities?.isAvailable && isBiometricEnabled && (
          <View className="mx-6 mb-6">
            <TouchableOpacity
              className="bg-white/5 border border-white/10 rounded-xl py-4 px-6"
              onPress={async () => {
                try {
                  const result = await BiometricAuthService.authenticate(
                    'Test your biometric authentication',
                    'Cancel'
                  );
                  if (result.success) {
                    Alert.alert('Success', 'Biometric authentication works correctly!');
                  } else {
                    Alert.alert('Failed', result.error || 'Authentication failed');
                  }
                } catch (error: any) {
                  Alert.alert('Error', error.message || 'Test failed');
                }
              }}
            >
              <Text className="text-silver text-center font-semibold">
                Test Biometric Authentication
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
