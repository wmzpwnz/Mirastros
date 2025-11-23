import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function SynastryScreen() {
  const router = useRouter();
  const [partnerName, setPartnerName] = useState('');
  const [partnerBirthDate, setPartnerBirthDate] = useState('');
  const [partnerBirthTime, setPartnerBirthTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const calculateSynastry = async () => {
    if (!partnerName || !partnerBirthDate) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAnalysis({
        compatibilityScore: 78,
        strengths: ['Deep emotional connection', 'Shared values', 'Intellectual compatibility'],
        challenges: ['Communication styles differ', 'Need for independence'],
        advice: 'Your connection is strong and has great potential. Focus on open communication and respecting each other\'s need for personal space. The emotional bond you share is a solid foundation for growth.'
      });
    } catch (error) {
      console.error('Synastry calculation error:', error);
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
          <Text className="text-5xl mb-4">💕</Text>
          <Text className="text-4xl font-cinzel text-gold mb-2">Synastry</Text>
          <Text className="text-silver/60 text-center">
            Relationship compatibility analysis
          </Text>
        </View>

        {/* Input Form */}
        {!analysis && (
          <View className="mb-8">
            <Text className="text-silver mb-2 text-sm font-semibold">Partner's Name</Text>
            <TextInput
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-silver mb-4"
              placeholder="Jane Doe"
              placeholderTextColor="#888"
              value={partnerName}
              onChangeText={setPartnerName}
              autoCapitalize="words"
            />

            <Text className="text-silver mb-2 text-sm font-semibold">Birth Date</Text>
            <TextInput
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-silver mb-4"
              placeholder="MM/DD/YYYY"
              placeholderTextColor="#888"
              value={partnerBirthDate}
              onChangeText={setPartnerBirthDate}
              keyboardType="numbers-and-punctuation"
            />

            <Text className="text-silver mb-2 text-sm font-semibold">Birth Time (Optional)</Text>
            <TextInput
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-silver mb-6"
              placeholder="HH:MM"
              placeholderTextColor="#888"
              value={partnerBirthTime}
              onChangeText={setPartnerBirthTime}
              keyboardType="numbers-and-punctuation"
            />

            <TouchableOpacity
              className={`bg-gold rounded-xl py-4 ${loading ? 'opacity-50' : ''}`}
              onPress={calculateSynastry}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0F0A1F" />
              ) : (
                <Text className="text-cosmic text-center font-bold text-base">
                  Analyze Compatibility
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Analysis Result */}
        {analysis && (
          <View className="mb-8">
            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 items-center">
              <Text className="text-2xl font-cinzel text-gold mb-4">Compatibility Score</Text>
              <View className="w-32 h-32 rounded-full border-4 border-gold items-center justify-center">
                <Text className="text-5xl font-bold text-gold">{analysis.compatibilityScore}%</Text>
              </View>
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-2xl font-cinzel text-gold mb-4">Strengths</Text>
              {analysis.strengths.map((strength: string, index: number) => (
                <View key={index} className="flex-row items-start mb-2">
                  <Text className="text-green-400 mr-2">✓</Text>
                  <Text className="text-silver/80 flex-1">{strength}</Text>
                </View>
              ))}
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-2xl font-cinzel text-gold mb-4">Challenges</Text>
              {analysis.challenges.map((challenge: string, index: number) => (
                <View key={index} className="flex-row items-start mb-2">
                  <Text className="text-yellow-400 mr-2">⚠</Text>
                  <Text className="text-silver/80 flex-1">{challenge}</Text>
                </View>
              ))}
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-2xl font-cinzel text-gold mb-4">Advice</Text>
              <Text className="text-silver/80 leading-6">
                {analysis.advice}
              </Text>
            </View>

            <TouchableOpacity
              className="bg-gold/10 border border-gold/30 rounded-xl py-4"
              onPress={() => setAnalysis(null)}
            >
              <Text className="text-gold text-center font-semibold">
                Analyze Another Relationship
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
