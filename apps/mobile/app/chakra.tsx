import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function ChakraScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const analyzeChakras = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAnalysis({
        chakras: [
          { name: 'Root', color: 'Red', status: 'Balanced', emoji: '🔴', percentage: 85 },
          { name: 'Sacral', color: 'Orange', status: 'Slightly Blocked', emoji: '🟠', percentage: 65 },
          { name: 'Solar Plexus', color: 'Yellow', status: 'Balanced', emoji: '🟡', percentage: 80 },
          { name: 'Heart', color: 'Green', status: 'Open', emoji: '🟢', percentage: 90 },
          { name: 'Throat', color: 'Blue', status: 'Blocked', emoji: '🔵', percentage: 50 },
          { name: 'Third Eye', color: 'Indigo', status: 'Balanced', emoji: '🟣', percentage: 75 },
          { name: 'Crown', color: 'Violet', status: 'Open', emoji: '💜', percentage: 88 }
        ],
        guidance: 'Your energy centers show a generally healthy flow with some areas needing attention. Focus on throat chakra healing through authentic self-expression and communication.',
        practices: [
          'Practice speaking your truth daily',
          'Try blue color meditation',
          'Use throat chakra affirmations',
          'Sing or chant to activate the throat'
        ]
      });
    } catch (error) {
      console.error('Chakra analysis error:', error);
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
          <Text className="text-5xl mb-4">🧘</Text>
          <Text className="text-4xl font-cinzel text-gold mb-2">Chakra Analysis</Text>
          <Text className="text-silver/60 text-center">
            Understand your energy centers
          </Text>
        </View>

        {/* Start Button */}
        {!analysis && !loading && (
          <View className="mb-8">
            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-silver/80 leading-6 text-center">
                Discover the state of your seven chakras and receive personalized guidance for energy balancing.
              </Text>
            </View>

            <TouchableOpacity
              className="bg-gold rounded-xl py-4"
              onPress={analyzeChakras}
            >
              <Text className="text-cosmic text-center font-bold text-base">
                Analyze My Chakras
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text className="text-silver/60 mt-4">Analyzing your energy...</Text>
          </View>
        )}

        {/* Analysis */}
        {analysis && (
          <View className="mb-8">
            <Text className="text-2xl font-cinzel text-gold mb-6 text-center">
              Your Chakra Map
            </Text>

            {analysis.chakras.map((chakra: any, index: number) => (
              <View key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center">
                    <Text className="text-3xl mr-3">{chakra.emoji}</Text>
                    <View>
                      <Text className="text-xl font-cinzel text-gold">{chakra.name}</Text>
                      <Text className="text-silver/60 text-sm">{chakra.color}</Text>
                    </View>
                  </View>
                  <View className={`px-3 py-1 rounded-lg ${
                    chakra.status === 'Balanced' || chakra.status === 'Open' ? 'bg-green-500/20' :
                    chakra.status === 'Slightly Blocked' ? 'bg-yellow-500/20' : 'bg-red-500/20'
                  }`}>
                    <Text className={`text-sm ${
                      chakra.status === 'Balanced' || chakra.status === 'Open' ? 'text-green-400' :
                      chakra.status === 'Slightly Blocked' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {chakra.status}
                    </Text>
                  </View>
                </View>
                
                <View className="bg-white/10 h-2 rounded-full overflow-hidden">
                  <View 
                    className="bg-gold h-full rounded-full"
                    style={{ width: `${chakra.percentage}%` }}
                  />
                </View>
              </View>
            ))}

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-xl font-cinzel text-gold mb-3">Guidance</Text>
              <Text className="text-silver/80 leading-6">
                {analysis.guidance}
              </Text>
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <Text className="text-xl font-cinzel text-gold mb-4">Balancing Practices</Text>
              {analysis.practices.map((practice: string, index: number) => (
                <View key={index} className="flex-row items-start mb-2">
                  <Text className="text-gold mr-2">•</Text>
                  <Text className="text-silver/80 flex-1">{practice}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              className="bg-gold/10 border border-gold/30 rounded-xl py-4"
              onPress={() => setAnalysis(null)}
            >
              <Text className="text-gold text-center font-semibold">
                Analyze Again
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
