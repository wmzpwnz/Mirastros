import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function RunesScreen() {
  const router = useRouter();
  const [spreadType, setSpreadType] = useState<'one' | 'three' | 'cross' | null>(null);
  const [loading, setLoading] = useState(false);
  const [reading, setReading] = useState<any>(null);

  const performReading = async (type: 'one' | 'three' | 'cross') => {
    setSpreadType(type);
    setLoading(true);
    
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const runes = type === 'one' ? ['ᚠ Fehu'] : type === 'three' ? ['ᚠ Fehu', 'ᚢ Uruz', 'ᚦ Thurisaz'] : ['ᚠ Fehu', 'ᚢ Uruz', 'ᚦ Thurisaz', 'ᚨ Ansuz'];
      
      setReading({
        runes,
        interpretation: 'The runes speak of new beginnings and material prosperity. Fehu represents wealth and abundance flowing into your life. This is a time to embrace opportunities and trust in the natural flow of resources.'
      });
    } catch (error) {
      console.error('Rune reading error:', error);
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
          <Text className="text-5xl mb-4">ᚱ</Text>
          <Text className="text-4xl font-cinzel text-gold mb-2">Runes</Text>
          <Text className="text-silver/60 text-center">
            Ancient Norse wisdom
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
              onPress={() => performReading('one')}
            >
              <Text className="text-xl font-cinzel text-gold mb-2">One Rune</Text>
              <Text className="text-silver/60">Quick guidance for today</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4"
              onPress={() => performReading('three')}
            >
              <Text className="text-xl font-cinzel text-gold mb-2">Three Runes</Text>
              <Text className="text-silver/60">Past, Present, Future</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
              onPress={() => performReading('cross')}
            >
              <Text className="text-xl font-cinzel text-gold mb-2">Cross Spread</Text>
              <Text className="text-silver/60">Detailed situation analysis</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text className="text-silver/60 mt-4">Drawing runes...</Text>
          </View>
        )}

        {/* Reading Result */}
        {reading && (
          <View className="mb-8">
            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-2xl font-cinzel text-gold mb-6 text-center">
                Your Runes
              </Text>
              <View className="flex-row flex-wrap justify-center">
                {reading.runes.map((rune: string, index: number) => (
                  <View key={index} className="bg-gold/10 px-6 py-4 rounded-xl m-2">
                    <Text className="text-4xl text-gold text-center">{rune}</Text>
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
