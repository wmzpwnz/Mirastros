import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { Button, Input } from '../../src/components';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, biometricCapabilities, enableBiometric } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await register(fullName, email, password);
      
      // Prompt to enable biometric if available
      if (biometricCapabilities?.isAvailable) {
        Alert.alert(
          'Enable Biometric Login?',
          `Would you like to enable ${biometricCapabilities.biometricType === 'faceId' ? 'Face ID' : 'Touch ID'} for quick and secure login?`,
          [
            {
              text: 'Not Now',
              style: 'cancel',
              onPress: () => router.replace('/'),
            },
            {
              text: 'Enable',
              onPress: async () => {
                try {
                  await enableBiometric();
                  Alert.alert('Success', 'Biometric login enabled!');
                  router.replace('/');
                } catch (error: any) {
                  console.error('Error enabling biometric:', error);
                  router.replace('/');
                }
              },
            },
          ]
        );
      } else {
        router.replace('/');
      }
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.message || 'Failed to create account. Please try again.',
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
              Begin Your Journey
            </Text>
          </View>

          {/* Registration Form */}
          <View className="mb-8">
            <Input
              placeholder="Full Name"
              value={fullName}
              onChange={setFullName}
              className="mb-4"
              accessibilityLabel="Full name"
            />

            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={setEmail}
              className="mb-4"
              accessibilityLabel="Email address"
            />

            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              className="mb-4"
              accessibilityLabel="Password"
            />

            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={setConfirmPassword}
              className="mb-6"
              accessibilityLabel="Confirm password"
            />

            <Button
              onPress={handleRegister}
              disabled={loading}
              loading={loading}
              className="w-full mb-4"
              accessibilityLabel="Create account button"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Text className="text-silver/60 text-xs text-center mb-4">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>

          {/* Social Registration */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-px bg-white/10" />
              <Text className="text-silver/60 mx-4 text-sm">or sign up with</Text>
              <View className="flex-1 h-px bg-white/10" />
            </View>

            <View className="flex-row gap-4">
              <TouchableOpacity
                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-4 items-center"
                onPress={() => console.log('Google signup')}
              >
                <Text className="text-2xl">G</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-4 items-center"
                onPress={() => console.log('Apple signup')}
              >
                <Text className="text-2xl">🍎</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Link */}
          <View className="flex-row justify-center">
            <Text className="text-silver/60">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text className="text-gold font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
