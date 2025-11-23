import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function LunarScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lunarData, setLunarData] = useState<any>(null);

  useEffect(() => {
    loadLunarData();
  }, []);

  const loadLunarData = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setLunarData({
        currentPhase: 'Waxing Gibbous',
        phaseEmoji: '🌔',
        illumination: 78,
        recommendations: {
          favorable: ['Starting new projects', 'Making important decisions', 'Social activities'],
          avoid: ['Major purchases', 'Surgical procedures']
        },
        nextPhases: [
          { phase: 'Full Moon', date: 'Dec 15, 2024', emoji: '🌕' },
          { phase: 'Waning Gibbous', date: 'Dec 18, 2024', emoji: '🌖' },
          { phase: 'Last Quarter', date: 'Dec 22, 2024', emoji: '🌗' }
        ]
      });
    } catch (error) {
      console.error('Lunar data loading error:', error);
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
          <Text className="text-5xl mb-4">🌙</Text>
          <Text className="text-4xl font-cinzel text-gold mb-2">Lunar Calendar</Text>
          <Text className="text-silver/60 text-center">
            Plan your life with lunar rhythms
          </Text>
        </View>

        {/* Loading */}
        {loading && (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text className="text-silver/60 mt-4">Loading lunar data...</Text>
          </View>
        )}

        {/* Lunar Data */}
        {!loading && lunarData && (
          <View className="mb-8">
            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 items-center">
              <Text className="text-6xl mb-4">{lunarData.phaseEmoji}</Text>
              <Text className="text-2xl font-cinzel text-gold mb-2">{lunarData.currentPhase}</Text>
              <Text className="text-silver/60">{lunarData.illumination}% Illuminated</Text>
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-2xl font-cinzel text-gold mb-4">Favorable Activities</Text>
              {lunarData.recommendations.favorable.map((activity: string, index: number) => (
                <View key={index} className="flex-row items-start mb-2">
                  <Text className="text-green-400 mr-2">✓</Text>
                  <Text className="text-silver/80 flex-1">{activity}</Text>
                </View>
              ))}
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-2xl font-cinzel text-gold mb-4">Best to Avoid</Text>
              {lunarData.recommendations.avoid.map((activity: string, index: number) => (
                <View key={index} className="flex-row items-start mb-2">
                  <Text className="text-red-400 mr-2">✗</Text>
                  <Text className="text-silver/80 flex-1">{activity}</Text>
                </View>
              ))}
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-2xl font-cinzel text-gold mb-4">Upcoming Phases</Text>
              {lunarData.nextPhases.map((phase: any, index: number) => (
                <View key={index} className="flex-row justify-between items-center py-3 border-b border-white/10 last:border-b-0">
                  <View className="flex-row items-center">
                    <Text className="text-3xl mr-3">{phase.emoji}</Text>
                    <View>
                      <Text className="text-gold font-semibold">{phase.phase}</Text>
                      <Text className="text-silver/60 text-sm">{phase.date}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              className="bg-gold rounded-xl py-4"
              onPress={loadLunarData}
            >
              <Text className="text-cosmic text-center font-bold">
                Refresh Calendar
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
