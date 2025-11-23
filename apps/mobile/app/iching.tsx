import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function IChingScreen() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [consultation, setConsultation] = useState<any>(null);

  const consultIChing = async () => {
    if (!question.trim()) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setConsultation({
        hexagram: 1,
        name: 'The Creative',
        symbol: '☰☰',
        interpretation: 'The Creative represents pure yang energy - strength, initiative, and creative power. This hexagram suggests that now is the time for bold action and leadership. Trust in your abilities and move forward with confidence.',
        advice: 'Take initiative in your endeavors. Your creative energy is at its peak. Be bold but also wise in your actions.'
      });
    } catch (error) {
      console.error('I Ching consultation error:', error);
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
          <Text className="text-5xl mb-4">☯</Text>
          <Text className="text-4xl font-cinzel text-gold mb-2">I Ching</Text>
          <Text className="text-silver/60 text-center">
            The Book of Changes
          </Text>
        </View>

        {/* Question Input */}
        {!consultation && (
          <View className="mb-8">
            <Text className="text-silver mb-2 text-sm font-semibold">Your Question</Text>
            <TextInput
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-silver mb-6"
              placeholder="What guidance do I need right now?"
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
              onPress={consultIChing}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0F0A1F" />
              ) : (
                <Text className="text-cosmic text-center font-bold text-base">
                  Consult I Ching
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Consultation Result */}
        {consultation && (
          <View className="mb-8">
            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <View className="items-center mb-4">
                <Text className="text-6xl mb-4">{consultation.symbol}</Text>
                <Text className="text-3xl font-cinzel text-gold mb-2">
                  Hexagram {consultation.hexagram}
                </Text>
                <Text className="text-xl text-silver/80">{consultation.name}</Text>
              </View>
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-2xl font-cinzel text-gold mb-4">Interpretation</Text>
              <Text className="text-silver/80 leading-6">
                {consultation.interpretation}
              </Text>
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-2xl font-cinzel text-gold mb-4">Advice</Text>
              <Text className="text-silver/80 leading-6">
                {consultation.advice}
              </Text>
            </View>

            <TouchableOpacity
              className="bg-gold/10 border border-gold/30 rounded-xl py-4"
              onPress={() => setConsultation(null)}
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
