import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ClarifyButton } from '../src/components/ClarifyButton';

export default function NumerologyScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const calculateNumerology = async () => {
    if (!fullName || !birthDate) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setResult({
        lifePath: 7,
        destiny: 3,
        soulUrge: 5,
        personality: 8,
        interpretation: 'Your Life Path number 7 indicates a deep spiritual journey and quest for knowledge. You are naturally introspective and analytical, seeking truth and wisdom in all aspects of life.'
      });
    } catch (error) {
      console.error('Numerology calculation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-cosmic">
      <View className="px-6 pt-16 pb-8">
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <Text className="text-gold text-lg">← Back</Text>
        </TouchableOpacity>

        <View className="items-center mb-8">
          <Text className="text-5xl mb-4">🔢</Text>
          <Text className="text-4xl font-cinzel text-gold mb-2">Numerology</Text>
          <Text className="text-silver/60 text-center">
            Decode the numbers of your destiny
          </Text>
        </View>

        {/* Input Form */}
        {!result && (
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

            <Text className="text-silver mb-2 text-sm font-semibold">Birth Date</Text>
            <TextInput
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-silver mb-6"
              placeholder="MM/DD/YYYY"
              placeholderTextColor="#888"
              value={birthDate}
              onChangeText={setBirthDate}
              keyboardType="numbers-and-punctuation"
            />

            <TouchableOpacity
              className={`bg-gold rounded-xl py-4 ${loading ? 'opacity-50' : ''}`}
              onPress={calculateNumerology}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0F0A1F" />
              ) : (
                <Text className="text-cosmic text-center font-bold text-base">
                  Calculate Numbers
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Results */}
        {result && (
          <View className="mb-8">
            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-2xl font-cinzel text-gold mb-6 text-center">
                Your Numbers
              </Text>

              <View className="space-y-4">
                <View className="flex-row justify-between items-center py-3 border-b border-white/10">
                  <Text className="text-silver/80">Life Path</Text>
                  <Text className="text-3xl font-bold text-gold">{result.lifePath}</Text>
                </View>

                <View className="flex-row justify-between items-center py-3 border-b border-white/10">
                  <Text className="text-silver/80">Destiny</Text>
                  <Text className="text-3xl font-bold text-gold">{result.destiny}</Text>
                </View>

                <View className="flex-row justify-between items-center py-3 border-b border-white/10">
                  <Text className="text-silver/80">Soul Urge</Text>
                  <Text className="text-3xl font-bold text-gold">{result.soulUrge}</Text>
                </View>

                <View className="flex-row justify-between items-center py-3">
                  <Text className="text-silver/80">Personality</Text>
                  <Text className="text-3xl font-bold text-gold">{result.personality}</Text>
                </View>
              </View>
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-xl font-cinzel text-gold mb-4">Interpretation</Text>
              <Text className="text-silver/80 leading-6">
                {result.interpretation}
              </Text>
            </View>

            <TouchableOpacity
              className="bg-gold/10 border border-gold/30 rounded-xl py-4 mb-4"
              onPress={() => setResult(null)}
            >
              <Text className="text-gold text-center font-semibold">
                Calculate Again
              </Text>
            </TouchableOpacity>

            {/* Clarify with Mirastros */}
            <ClarifyButton
              onClarify={() => {
                // TODO: Navigate to chat screen with context
                console.log('Opening chat with numerology context:', result);
              }}
              contextType="numerology"
              contextData={result}
              available={true}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}
