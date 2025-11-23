import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { BiometricAuthService } from '../../src/services/biometricAuth';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithBiometric, biometricCapabilities, isBiometricEnabled } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [showBiometricOption, setShowBiometricOption] = useState(false);

  useEffect(() => {
    // Show biometric option if available and enabled
    setShowBiometricOption(
      biometricCapabilities?.isAvailable === true && isBiometricEnabled
    );
  }, [biometricCapabilities, isBiometricEnabled]);

  const handleBiometricAuth = async () => {
    setBiometricLoading(true);
    try {
      await loginWithBiometric();
      router.replace('/');
    } catch (error: any) {
      Alert.alert(
        'Authentication Failed',
        error.message || 'Biometric authentication failed. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace('/');
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message || 'Invalid email or password. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-cosmic"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 pt-20 pb-8">
          {/* Header */}
          <View className="items-center mb-12">
            <Text className="text-5xl font-cinzel text-gold mb-3">Mirastros</Text>
            <Text className="text-silver/60 text-center text-base">
              Welcome Back
            </Text>
          </View>

          {/* Login Form */}
          <View className="mb-8">
            <Text className="text-silver mb-2 text-sm font-semibold">Email</Text>
            <TextInput
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-silver mb-4"
              placeholder="your@email.com"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text className="text-silver mb-2 text-sm font-semibold">Password</Text>
            <TextInput
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-silver mb-6"
              placeholder="••••••••"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              className={`bg-gold rounded-xl py-4 mb-4 ${loading ? 'opacity-50' : ''}`}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text className="text-cosmic text-center font-bold text-base">
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => console.log('Forgot password')}>
              <Text className="text-gold text-center text-sm">
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Biometric Auth */}
          {showBiometricOption && (
            <View className="mb-8">
              <View className="flex-row items-center mb-4">
                <View className="flex-1 h-px bg-white/10" />
                <Text className="text-silver/60 mx-4 text-sm">or</Text>
                <View className="flex-1 h-px bg-white/10" />
              </View>

              <TouchableOpacity
                className={`bg-white/5 border border-gold/30 rounded-xl py-4 flex-row items-center justify-center ${biometricLoading ? 'opacity-50' : ''}`}
                onPress={handleBiometricAuth}
                disabled={biometricLoading}
              >
                <Text className="text-2xl mr-2">
                  {biometricCapabilities?.biometricType === 'faceId' ? '👤' : '👆'}
                </Text>
                <Text className="text-gold font-semibold">
                  {biometricLoading
                    ? 'Authenticating...'
                    : `Use ${BiometricAuthService.getBiometricTypeName(biometricCapabilities?.biometricType || 'none')}`}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Social Login */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-px bg-white/10" />
              <Text className="text-silver/60 mx-4 text-sm">or continue with</Text>
              <View className="flex-1 h-px bg-white/10" />
            </View>

            <View className="flex-row space-x-4">
              <TouchableOpacity
                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-4 items-center"
                onPress={() => console.log('Google login')}
              >
                <Text className="text-2xl">G</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-4 items-center"
                onPress={() => console.log('Apple login')}
              >
                <Text className="text-2xl"></Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Link */}
          <View className="flex-row justify-center">
            <Text className="text-silver/60">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text className="text-gold font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
