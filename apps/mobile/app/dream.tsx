import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ClarifyButton } from '../src/components/ClarifyButton';

export default function DreamScreen() {
  const router = useRouter();
  const [dreamText, setDreamText] = useState('');
  const [loading, setLoading] = useState(false);
  const [interpretation, setInterpretation] = useState<any>(null);

  const interpretDream = async () => {
    if (!dreamText.trim()) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setInterpretation({
        symbols: ['Water', 'Flying', 'House'],
        meaning: 'Your dream reveals a deep desire for emotional freedom and spiritual elevation. The water symbolizes your emotional state, while flying represents your aspirations to rise above current challenges. The house represents your sense of security and foundation.',
        advice: 'Focus on emotional healing and allow yourself to explore new perspectives. Trust your intuition as you navigate through life\'s transitions.'
      });
    } catch (error) {
      console.error('Dream interpretation error:', error);
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
          <Text className="text-5xl mb-4">💭</Text>
          <Text className="text-4xl font-cinzel text-gold mb-2">Dream Interpretation</Text>
          <Text className="text-silver/60 text-center">
            Unlock the secrets of your subconscious
          </Text>
        </View>

        {/* Input Form */}
        {!interpretation && (
          <View className="mb-8">
            <Text className="text-silver mb-2 text-sm font-semibold">Describe Your Dream</Text>
            <TextInput
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-silver mb-6"
              placeholder="I was flying over the ocean..."
              placeholderTextColor="#888"
              value={dreamText}
              onChangeText={setDreamText}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              style={{ minHeight: 150 }}
            />

            <TouchableOpacity
              className={`bg-gold rounded-xl py-4 ${loading ? 'opacity-50' : ''}`}
              onPress={interpretDream}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0F0A1F" />
              ) : (
                <Text className="text-cosmic text-center font-bold text-base">
                  Interpret Dream
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Interpretation */}
        {interpretation && (
          <View className="mb-8">
            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-2xl font-cinzel text-gold mb-4">Key Symbols</Text>
              <View className="flex-row flex-wrap">
                {interpretation.symbols.map((symbol: string, index: number) => (
                  <View key={index} className="bg-gold/10 px-4 py-2 rounded-lg mr-2 mb-2">
                    <Text className="text-gold">{symbol}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-2xl font-cinzel text-gold mb-4">Meaning</Text>
              <Text className="text-silver/80 leading-6 mb-4">
                {interpretation.meaning}
              </Text>
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-2xl font-cinzel text-gold mb-4">Guidance</Text>
              <Text className="text-silver/80 leading-6">
                {interpretation.advice}
              </Text>
            </View>

            <TouchableOpacity
              className="bg-gold/10 border border-gold/30 rounded-xl py-4 mb-4"
              onPress={() => setInterpretation(null)}
            >
              <Text className="text-gold text-center font-semibold">
                Interpret Another Dream
              </Text>
            </TouchableOpacity>

            {/* Clarify with Mirastros */}
            <ClarifyButton
              onClarify={() => {
                // TODO: Navigate to chat screen with context
                console.log('Opening chat with dream context:', interpretation);
              }}
              contextType="dream"
              contextData={interpretation}
              available={true}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}
