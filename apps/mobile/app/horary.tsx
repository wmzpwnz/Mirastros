import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function HoraryScreen() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<any>(null);

  const askQuestion = async () => {
    if (!question.trim()) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAnswer({
        response: 'Yes',
        confidence: 'High',
        timing: 'Within 3 months',
        explanation: 'The horary chart shows favorable planetary positions indicating a positive outcome. The Moon is applying to a beneficial aspect with Jupiter, suggesting growth and expansion. The timing is indicated by the Moon\'s movement through the houses.',
        advice: 'Take action with confidence, but remain patient. The universe is aligning in your favor, and the timing will be perfect when it arrives.'
      });
    } catch (error) {
      console.error('Horary question error:', error);
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
          <Text className="text-5xl mb-4">❓</Text>
          <Text className="text-4xl font-cinzel text-gold mb-2">Horary Astrology</Text>
          <Text className="text-silver/60 text-center">
            Ask a specific question and receive cosmic guidance
          </Text>
        </View>

        {/* Platinum Badge */}
        <View className="bg-purple-500/20 border border-purple-500/40 rounded-xl p-4 mb-6">
          <View className="flex-row items-center justify-center">
            <Text className="text-2xl mr-2">👑</Text>
            <Text className="text-purple-300 font-semibold">Platinum Feature</Text>
          </View>
        </View>

        {/* Input Form */}
        {!answer && (
          <View className="mb-8">
            <Text className="text-silver mb-2 text-sm font-semibold">Your Question</Text>
            <Text className="text-silver/60 text-xs mb-3">
              Ask a specific yes/no question about a situation or decision
            </Text>
            <TextInput
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-silver mb-6"
              placeholder="Will I get the job I applied for?"
              placeholderTextColor="#888"
              value={question}
              onChangeText={setQuestion}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ minHeight: 100 }}
            />

            <TouchableOpacity
              className={`bg-gold rounded-xl py-4 ${loading ? 'opacity-50' : ''}`}
              onPress={askQuestion}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0F0A1F" />
              ) : (
                <Text className="text-cosmic text-center font-bold text-base">
                  Ask the Stars
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Answer */}
        {answer && (
          <View className="mb-8">
            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 items-center">
              <Text className="text-6xl mb-4">{answer.response === 'Yes' ? '✓' : '✗'}</Text>
              <Text className="text-3xl font-cinzel text-gold mb-2">{answer.response}</Text>
              <View className="bg-gold/10 px-4 py-2 rounded-lg">
                <Text className="text-gold">{answer.confidence} Confidence</Text>
              </View>
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-xl font-cinzel text-gold mb-3">Timing</Text>
              <Text className="text-silver/80 text-lg">{answer.timing}</Text>
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-xl font-cinzel text-gold mb-3">Explanation</Text>
              <Text className="text-silver/80 leading-6">
                {answer.explanation}
              </Text>
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-xl font-cinzel text-gold mb-3">Advice</Text>
              <Text className="text-silver/80 leading-6">
                {answer.advice}
              </Text>
            </View>

            <TouchableOpacity
              className="bg-gold/10 border border-gold/30 rounded-xl py-4"
              onPress={() => setAnswer(null)}
            >
              <Text className="text-gold text-center font-semibold">
                Ask Another Question
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
