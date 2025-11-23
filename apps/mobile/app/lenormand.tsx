import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function LenormandScreen() {
  const router = useRouter();
  const [spreadType, setSpreadType] = useState<'three' | 'five' | 'nine' | null>(null);
  const [loading, setLoading] = useState(false);
  const [reading, setReading] = useState<any>(null);

  const performReading = async (type: 'three' | 'five' | 'nine') => {
    setSpreadType(type);
    setLoading(true);
    
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const cardCount = type === 'three' ? 3 : type === 'five' ? 5 : 9;
      const cards = Array.from({ length: cardCount }, (_, i) => `Card ${i + 1}`);
      
      setReading({
        cards,
        interpretation: 'The Lenormand cards reveal a clear path forward. The combination of these cards suggests positive developments in your personal and professional life. Pay attention to opportunities that arise through communication and networking.'
      });
    } catch (error) {
      console.error('Lenormand reading error:', error);
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
          <Text className="text-5xl mb-4">🃏</Text>
          <Text className="text-4xl font-cinzel text-gold mb-2">Lenormand</Text>
          <Text className="text-silver/60 text-center">
            Concrete answers to your questions
          </Text>
        </View>

        {/* Spread Selection */}
        {!reading && !loading && (
          <View className="mb-8">
            <Text className="text-2xl font-cinzel text-gold mb-6 text-center">
              Choose Your Spread
            </Text>

            <TouchableOpacity
              className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4"
              onPress={() => performReading('three')}
            >
              <Text className="text-xl font-cinzel text-gold mb-2">3-Card Spread</Text>
              <Text className="text-silver/60">Quick situation overview</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4"
              onPress={() => performReading('five')}
            >
              <Text className="text-xl font-cinzel text-gold mb-2">5-Card Spread</Text>
              <Text className="text-silver/60">Detailed analysis</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
              onPress={() => performReading('nine')}
            >
              <Text className="text-xl font-cinzel text-gold mb-2">9-Card Spread</Text>
              <Text className="text-silver/60">Grand Tableau (comprehensive)</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text className="text-silver/60 mt-4">Drawing cards...</Text>
          </View>
        )}

        {/* Reading Result */}
        {reading && (
          <View className="mb-8">
            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-2xl font-cinzel text-gold mb-6 text-center">
                Your Cards
              </Text>
              <View className="flex-row flex-wrap justify-center">
                {reading.cards.map((card: string, index: number) => (
                  <View key={index} className="bg-gold/10 px-4 py-3 rounded-xl m-2">
                    <Text className="text-gold text-center">{card}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-2xl font-cinzel text-gold mb-4">Interpretation</Text>
              <Text className="text-silver/80 leading-6">
                {reading.interpretation}
              </Text>
            </View>

            <TouchableOpacity
              className="bg-gold/10 border border-gold/30 rounded-xl py-4"
              onPress={() => setReading(null)}
            >
              <Text className="text-gold text-center font-semibold">
                Draw Again
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
