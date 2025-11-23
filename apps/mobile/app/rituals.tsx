import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function RitualsScreen() {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ritual, setRitual] = useState<any>(null);

  const goals = [
    { id: 'money', label: 'Abundance & Prosperity', emoji: '💰' },
    { id: 'love', label: 'Love & Relationships', emoji: '💕' },
    { id: 'health', label: 'Health & Vitality', emoji: '🌿' },
    { id: 'protection', label: 'Protection & Safety', emoji: '🛡️' }
  ];

  const generateRitual = async (goalId: string) => {
    setSelectedGoal(goalId);
    setLoading(true);
    
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setRitual({
        title: 'Full Moon Abundance Ritual',
        duration: '20 minutes',
        items: ['Green candle', 'Citrine crystal', 'Bay leaves', 'Pen and paper'],
        steps: [
          'Find a quiet space and light the green candle',
          'Hold the citrine crystal in your hands and set your intention',
          'Write your financial goals on bay leaves',
          'Burn the bay leaves safely in the candle flame',
          'Meditate for 10 minutes visualizing abundance',
          'Thank the universe and extinguish the candle'
        ],
        affirmation: 'I am open to receiving abundance in all forms. Prosperity flows to me easily and naturally.'
      });
    } catch (error) {
      console.error('Ritual generation error:', error);
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
          <Text className="text-5xl mb-4">🕯️</Text>
          <Text className="text-4xl font-cinzel text-gold mb-2">Rituals</Text>
          <Text className="text-silver/60 text-center">
            Personalized spiritual practices
          </Text>
        </View>

        {/* Goal Selection */}
        {!ritual && !loading && (
          <View className="mb-8">
            <Text className="text-2xl font-cinzel text-gold mb-6 text-center">
              Choose Your Intention
            </Text>

            {goals.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4"
                onPress={() => generateRitual(goal.id)}
              >
                <View className="flex-row items-center">
                  <Text className="text-4xl mr-4">{goal.emoji}</Text>
                  <Text className="text-xl font-cinzel text-gold">{goal.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text className="text-silver/60 mt-4">Creating your ritual...</Text>
          </View>
        )}

        {/* Ritual */}
        {ritual && (
          <View className="mb-8">
            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-2xl font-cinzel text-gold mb-2 text-center">
                {ritual.title}
              </Text>
              <Text className="text-silver/60 text-center">{ritual.duration}</Text>
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-xl font-cinzel text-gold mb-4">Items Needed</Text>
              {ritual.items.map((item: string, index: number) => (
                <View key={index} className="flex-row items-start mb-2">
                  <Text className="text-gold mr-2">•</Text>
                  <Text className="text-silver/80 flex-1">{item}</Text>
                </View>
              ))}
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-xl font-cinzel text-gold mb-4">Steps</Text>
              {ritual.steps.map((step: string, index: number) => (
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
              <Text className="text-silver/90 leading-6 italic">
                "{ritual.affirmation}"
              </Text>
            </View>

            <TouchableOpacity
              className="bg-gold/10 border border-gold/30 rounded-xl py-4"
              onPress={() => setRitual(null)}
            >
              <Text className="text-gold text-center font-semibold">
                Create Another Ritual
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
