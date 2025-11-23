import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function TransitsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transits, setTransits] = useState<any>(null);

  useEffect(() => {
    loadTransits();
  }, []);

  const loadTransits = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setTransits({
        current: [
          { planet: 'Jupiter', sign: 'Taurus', aspect: 'Trine', impact: 'Positive' },
          { planet: 'Saturn', sign: 'Pisces', aspect: 'Square', impact: 'Challenging' },
          { planet: 'Mars', sign: 'Scorpio', aspect: 'Conjunction', impact: 'Intense' }
        ],
        interpretation: 'Current planetary transits bring a mix of opportunities and challenges. Jupiter in Taurus supports material growth and stability, while Saturn in Pisces asks for spiritual discipline. Mars in Scorpio intensifies your passions and drive.'
      });
    } catch (error) {
      console.error('Transits loading error:', error);
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
          <Text className="text-5xl mb-4">🪐</Text>
          <Text className="text-4xl font-cinzel text-gold mb-2">Planetary Transits</Text>
          <Text className="text-silver/60 text-center">
            Current cosmic influences on your life
          </Text>
        </View>

        {/* Loading */}
        {loading && (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text className="text-silver/60 mt-4">Loading transits...</Text>
          </View>
        )}

        {/* Transits */}
        {!loading && transits && (
          <View className="mb-8">
            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-2xl font-cinzel text-gold mb-6 text-center">
                Current Transits
              </Text>
              
              {transits.current.map((transit: any, index: number) => (
                <View key={index} className="mb-4 pb-4 border-b border-white/10 last:border-b-0">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-xl text-gold font-semibold">{transit.planet}</Text>
                    <View className={`px-3 py-1 rounded-lg ${
                      transit.impact === 'Positive' ? 'bg-green-500/20' :
                      transit.impact === 'Challenging' ? 'bg-red-500/20' : 'bg-purple-500/20'
                    }`}>
                      <Text className={`text-sm ${
                        transit.impact === 'Positive' ? 'text-green-400' :
                        transit.impact === 'Challenging' ? 'text-red-400' : 'text-purple-400'
                      }`}>
                        {transit.impact}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-silver/60">
                    {transit.aspect} in {transit.sign}
                  </Text>
                </View>
              ))}
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-2xl font-cinzel text-gold mb-4">Interpretation</Text>
              <Text className="text-silver/80 leading-6">
                {transits.interpretation}
              </Text>
            </View>

            <TouchableOpacity
              className="bg-gold rounded-xl py-4"
              onPress={loadTransits}
            >
              <Text className="text-cosmic text-center font-bold">
                Refresh Transits
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
