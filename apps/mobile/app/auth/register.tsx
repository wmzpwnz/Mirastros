import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';

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
            <Text className="text-silver mb-2 text-sm font-semibold">Full Name</Text>
            <TextInput
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-silver mb-4"
              placeholder="John Doe"
              placeholderTextColor="#888"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />

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
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-silver mb-4"
              placeholder="••••••••"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Text className="text-silver mb-2 text-sm font-semibold">Confirm Password</Text>
            <TextInput
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-silver mb-6"
              placeholder="••••••••"
              placeholderTextColor="#888"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              className={`bg-gold rounded-xl py-4 mb-4 ${loading ? 'opacity-50' : ''}`}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text className="text-cosmic text-center font-bold text-base">
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

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

            <View className="flex-row space-x-4">
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
                <Text className="text-2xl"></Text>
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
