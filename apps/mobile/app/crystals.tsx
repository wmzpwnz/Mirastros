import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function CrystalsScreen() {
  const router = useRouter();
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);

  const getRecommendations = async () => {
    if (!goal.trim()) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setRecommendations({
        crystals: [
          { name: 'Amethyst', properties: 'Spiritual growth, intuition, peace', color: 'Purple' },
          { name: 'Rose Quartz', properties: 'Love, compassion, emotional healing', color: 'Pink' },
          { name: 'Citrine', properties: 'Abundance, manifestation, joy', color: 'Yellow' }
        ],
        guidance: 'These crystals align with your current energy and goals. Amethyst will support your spiritual journey, Rose Quartz will open your heart, and Citrine will attract abundance into your life.'
      });
    } catch (error) {
      console.error('Crystal recommendations error:', error);
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
          <Text className="text-5xl mb-4">💎</Text>
          <Text className="text-4xl font-cinzel text-gold mb-2">Crystals</Text>
          <Text className="text-silver/60 text-center">
            Discover your perfect crystal companions
          </Text>
        </View>

        {/* Input Form */}
        {!recommendations && (
          <View className="mb-8">
            <Text className="text-silver mb-2 text-sm font-semibold">What's Your Goal?</Text>
            <TextInput
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-silver mb-6"
              placeholder="e.g., protection, love, wealth, healing"
              placeholderTextColor="#888"
              value={goal}
              onChangeText={setGoal}
            />

            <TouchableOpacity
              className={`bg-gold rounded-xl py-4 ${loading ? 'opacity-50' : ''}`}
              onPress={getRecommendations}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0F0A1F" />
              ) : (
                <Text className="text-cosmic text-center font-bold text-base">
                  Get Recommendations
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Recommendations */}
        {recommendations && (
          <View className="mb-8">
            <Text className="text-2xl font-cinzel text-gold mb-6 text-center">
              Recommended Crystals
            </Text>

            {recommendations.crystals.map((crystal: any, index: number) => (
              <View key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
                <View className="flex-row justify-between items-start mb-3">
                  <Text className="text-xl font-cinzel text-gold">{crystal.name}</Text>
                  <View className="bg-gold/10 px-3 py-1 rounded-lg">
                    <Text className="text-gold text-sm">{crystal.color}</Text>
                  </View>
                </View>
                <Text className="text-silver/80 leading-6">
                  {crystal.properties}
                </Text>
              </View>
            ))}

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-2xl font-cinzel text-gold mb-4">Guidance</Text>
              <Text className="text-silver/80 leading-6">
                {recommendations.guidance}
              </Text>
            </View>

            <TouchableOpacity
              className="bg-gold/10 border border-gold/30 rounded-xl py-4"
              onPress={() => setRecommendations(null)}
            >
              <Text className="text-gold text-center font-semibold">
                Get New Recommendations
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
