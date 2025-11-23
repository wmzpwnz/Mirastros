import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function MandalaScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mandala, setMandala] = useState<any>(null);

  const generateMandala = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      setMandala({
        pattern: 'Sacred Geometry',
        colors: ['Purple', 'Gold', 'Blue'],
        symbolism: 'Your mandala reflects your current spiritual state and inner harmony. The purple represents spiritual wisdom, gold symbolizes divine light, and blue indicates peace and tranquility.',
        meditation: [
          'Find a quiet space and sit comfortably',
          'Gaze softly at the center of the mandala',
          'Allow your eyes to naturally explore the patterns',
          'Notice any thoughts or feelings that arise',
          'Breathe deeply and let the mandala guide your meditation',
          'Continue for 10-20 minutes'
        ],
        affirmation: 'I am centered, balanced, and connected to the divine harmony within me.'
      });
    } catch (error) {
      console.error('Mandala generation error:', error);
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
          <Text className="text-5xl mb-4">🪷</Text>
          <Text className="text-4xl font-cinzel text-gold mb-2">Mandala</Text>
          <Text className="text-silver/60 text-center">
            Your personalized meditation mandala
          </Text>
        </View>

        {/* Start Button */}
        {!mandala && !loading && (
          <View className="mb-8">
            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-silver/80 leading-6 text-center">
                Generate a unique mandala based on your birth chart and current energy. Use it for meditation and spiritual practice.
              </Text>
            </View>

            <TouchableOpacity
              className="bg-gold rounded-xl py-4"
              onPress={generateMandala}
            >
              <Text className="text-cosmic text-center font-bold text-base">
                Generate My Mandala
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text className="text-silver/60 mt-4">Creating your mandala...</Text>
          </View>
        )}

        {/* Mandala */}
        {mandala && (
          <View className="mb-8">
            {/* Mandala Placeholder */}
            <View className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6 items-center">
              <View className="w-64 h-64 rounded-full border-4 border-gold items-center justify-center bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                <Text className="text-6xl">🪷</Text>
                <Text className="text-gold text-sm mt-2">{mandala.pattern}</Text>
              </View>
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-xl font-cinzel text-gold mb-3">Colors</Text>
              <View className="flex-row flex-wrap">
                {mandala.colors.map((color: string, index: number) => (
                  <View key={index} className="bg-gold/10 px-4 py-2 rounded-lg mr-2 mb-2">
                    <Text className="text-gold">{color}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-xl font-cinzel text-gold mb-3">Symbolism</Text>
              <Text className="text-silver/80 leading-6">
                {mandala.symbolism}
              </Text>
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-xl font-cinzel text-gold mb-4">Meditation Guide</Text>
              {mandala.meditation.map((step: string, index: number) => (
                <View key={index} className="flex-row items-start mb-3">
                  <View className="bg-gold/20 w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5">
                    <Text className="text-gold text-xs font-bold">{index + 1}</Text>
                  </View>
                  <Text className="text-silver/80 flex-1 leading-6">{step}</Text>
                </View>
              ))}
            </View>

            <View className="bg-gold/10 border border-gold/30 rounded-2xl p-6 mb-6">
              <Text className="text-xl font-cinzel text-gold mb-3">Affirmation</Text>
              <Text className="text-silver/90 leading-6 italic text-center">
                "{mandala.affirmation}"
              </Text>
            </View>

            <TouchableOpacity
              className="bg-gold rounded-xl py-4 mb-4"
              onPress={() => {/* TODO: Implement download */}}
            >
              <Text className="text-cosmic text-center font-bold">
                Download Mandala
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gold/10 border border-gold/30 rounded-xl py-4"
              onPress={() => setMandala(null)}
            >
              <Text className="text-gold text-center font-semibold">
                Generate New Mandala
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
