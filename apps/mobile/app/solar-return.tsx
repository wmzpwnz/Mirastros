import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function SolarReturnScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState<any>(null);

  const calculateSolarReturn = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setForecast({
        year: '2024-2025',
        theme: 'Transformation and Growth',
        keyEvents: [
          { month: 'January', event: 'Career breakthrough', impact: 'Positive' },
          { month: 'April', event: 'Relationship milestone', impact: 'Positive' },
          { month: 'July', event: 'Financial challenge', impact: 'Challenging' },
          { month: 'October', event: 'Personal transformation', impact: 'Intense' }
        ],
        overview: 'This year brings significant opportunities for personal and professional growth. The first half focuses on career advancement and relationship development, while the second half challenges you to transform old patterns and embrace new perspectives.',
        advice: 'Stay open to change and trust the process. The challenges you face are preparing you for greater success. Focus on building strong foundations in all areas of life.'
      });
    } catch (error) {
      console.error('Solar return calculation error:', error);
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
          <Text className="text-5xl mb-4">☀️</Text>
          <Text className="text-4xl font-cinzel text-gold mb-2">Solar Return</Text>
          <Text className="text-silver/60 text-center">
            Your yearly cosmic forecast
          </Text>
        </View>

        {/* Platinum Badge */}
        <View className="bg-purple-500/20 border border-purple-500/40 rounded-xl p-4 mb-6">
          <View className="flex-row items-center justify-center">
            <Text className="text-2xl mr-2">👑</Text>
            <Text className="text-purple-300 font-semibold">Platinum Feature</Text>
          </View>
        </View>

        {/* Start Button */}
        {!forecast && !loading && (
          <View className="mb-8">
            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-silver/80 leading-6 text-center">
                Discover what the year ahead holds for you with a personalized solar return chart analysis.
              </Text>
            </View>

            <TouchableOpacity
              className="bg-gold rounded-xl py-4"
              onPress={calculateSolarReturn}
            >
              <Text className="text-cosmic text-center font-bold text-base">
                Calculate Solar Return
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text className="text-silver/60 mt-4">Calculating your year...</Text>
          </View>
        )}

        {/* Forecast */}
        {forecast && (
          <View className="mb-8">
            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 items-center">
              <Text className="text-2xl font-cinzel text-gold mb-2">{forecast.year}</Text>
              <Text className="text-silver/60 text-lg">{forecast.theme}</Text>
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-xl font-cinzel text-gold mb-4">Key Events</Text>
              {forecast.keyEvents.map((event: any, index: number) => (
                <View key={index} className="mb-4 pb-4 border-b border-white/10 last:border-b-0">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-gold font-semibold">{event.month}</Text>
                    <View className={`px-3 py-1 rounded-lg ${
                      event.impact === 'Positive' ? 'bg-green-500/20' :
                      event.impact === 'Challenging' ? 'bg-red-500/20' : 'bg-purple-500/20'
                    }`}>
                      <Text className={`text-sm ${
                        event.impact === 'Positive' ? 'text-green-400' :
                        event.impact === 'Challenging' ? 'text-red-400' : 'text-purple-400'
                      }`}>
                        {event.impact}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-silver/80">{event.event}</Text>
                </View>
              ))}
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-xl font-cinzel text-gold mb-3">Overview</Text>
              <Text className="text-silver/80 leading-6">
                {forecast.overview}
              </Text>
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-xl font-cinzel text-gold mb-3">Advice</Text>
              <Text className="text-silver/80 leading-6">
                {forecast.advice}
              </Text>
            </View>

            <TouchableOpacity
              className="bg-gold/10 border border-gold/30 rounded-xl py-4"
              onPress={() => setForecast(null)}
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
