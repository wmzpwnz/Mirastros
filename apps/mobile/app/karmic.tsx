import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function KarmicScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const analyzeKarma = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAnalysis({
        northNode: {
          sign: 'Gemini',
          house: '3rd House',
          lesson: 'Communication and Learning'
        },
        southNode: {
          sign: 'Sagittarius',
          house: '9th House',
          pastLife: 'Teacher and Philosopher'
        },
        karmicLessons: [
          'Develop curiosity and openness to new ideas',
          'Learn to communicate effectively with others',
          'Balance knowledge with practical application',
          'Embrace flexibility and adaptability'
        ],
        soulPurpose: 'Your soul\'s journey is about moving from abstract philosophy to practical communication. You are here to learn how to share wisdom in accessible ways and connect with your immediate community.',
        guidance: 'Focus on developing your communication skills and building connections in your local environment. Your past life wisdom is valuable, but this lifetime calls you to ground it in everyday interactions.'
      });
    } catch (error) {
      console.error('Karmic analysis error:', error);
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
          <Text className="text-5xl mb-4">🔮</Text>
          <Text className="text-4xl font-cinzel text-gold mb-2">Karmic Tasks</Text>
          <Text className="text-silver/60 text-center">
            Discover your soul's purpose
          </Text>
        </View>

        {/* Start Button */}
        {!analysis && !loading && (
          <View className="mb-8">
            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-silver/80 leading-6 text-center">
                Explore your karmic lessons and understand the deeper purpose of your soul's journey in this lifetime.
              </Text>
            </View>

            <TouchableOpacity
              className="bg-gold rounded-xl py-4"
              onPress={analyzeKarma}
            >
              <Text className="text-cosmic text-center font-bold text-base">
                Analyze Karmic Path
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text className="text-silver/60 mt-4">Reading your soul's journey...</Text>
          </View>
        )}

        {/* Analysis */}
        {analysis && (
          <View className="mb-8">
            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-2xl font-cinzel text-gold mb-4 text-center">Lunar Nodes</Text>
              
              <View className="mb-4 pb-4 border-b border-white/10">
                <Text className="text-lg text-gold font-semibold mb-2">North Node (Destiny)</Text>
                <Text className="text-silver/80 mb-1">{analysis.northNode.sign} in {analysis.northNode.house}</Text>
                <Text className="text-silver/60 text-sm">{analysis.northNode.lesson}</Text>
              </View>

              <View>
                <Text className="text-lg text-gold font-semibold mb-2">South Node (Past)</Text>
                <Text className="text-silver/80 mb-1">{analysis.southNode.sign} in {analysis.southNode.house}</Text>
                <Text className="text-silver/60 text-sm">{analysis.southNode.pastLife}</Text>
              </View>
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-xl font-cinzel text-gold mb-4">Karmic Lessons</Text>
              {analysis.karmicLessons.map((lesson: string, index: number) => (
                <View key={index} className="flex-row items-start mb-3">
                  <Text className="text-gold mr-2">•</Text>
                  <Text className="text-silver/80 flex-1">{lesson}</Text>
                </View>
              ))}
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-xl font-cinzel text-gold mb-3">Soul Purpose</Text>
              <Text className="text-silver/80 leading-6">
                {analysis.soulPurpose}
              </Text>
            </View>

            <View className="bg-gold/10 border border-gold/30 rounded-2xl p-6 mb-6">
              <Text className="text-xl font-cinzel text-gold mb-3">Guidance</Text>
              <Text className="text-silver/90 leading-6">
                {analysis.guidance}
              </Text>
            </View>

            <TouchableOpacity
              className="bg-gold/10 border border-gold/30 rounded-xl py-4"
              onPress={() => setAnalysis(null)}
            >
              <Text className="text-gold text-center font-semibold">
                View Again
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
