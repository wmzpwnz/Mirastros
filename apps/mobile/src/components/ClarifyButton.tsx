/**
 * Clarify with Mirastros Button Component (React Native)
 * Displays a button to open the AI chat with service context
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export interface ClarifyButtonProps {
  onClarify: () => void;
  contextType: string;
  contextData: any;
  available?: boolean;
}

export const ClarifyButton: React.FC<ClarifyButtonProps> = ({
  onClarify,
  contextType,
  contextData,
  available = true,
}) => {
  if (!available) {
    return (
      <View className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 mt-6">
        <Text className="text-xl font-cinzel text-gray-400 mb-2">
          Есть вопросы о вашем результате?
        </Text>
        <Text className="text-gray-500 text-sm mb-4">
          Обновитесь до Premium или Platinum для доступа к AI-ассистенту
        </Text>
        <View className="bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 flex-row items-center justify-center">
          <Text className="text-gray-400 mr-2">🔒</Text>
          <Text className="text-gray-400 font-semibold">Уточнить с Mirastros</Text>
          <View className="bg-gold ml-2 px-2 py-1 rounded">
            <Text className="text-cosmic text-xs font-bold">Premium</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-gold/10 border border-gold/30 rounded-2xl p-6 mt-6">
      <Text className="text-xl font-cinzel text-gold mb-2">
        Есть вопросы о вашем результате?
      </Text>
      <Text className="text-silver/60 text-sm mb-4">
        Задайте уточняющие вопросы AI-ассистенту Mirastros
      </Text>
      <TouchableOpacity
        onPress={() => {
          console.log('Opening chat with context:', { contextType, contextData });
          onClarify();
        }}
        className="bg-gold rounded-xl py-4 flex-row items-center justify-center"
      >
        <Text className="text-2xl mr-2">💬</Text>
        <Text className="text-cosmic font-bold text-base">
          Уточнить с Mirastros
        </Text>
      </TouchableOpacity>
    </View>
  );
};
