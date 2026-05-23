/**
 * Clarify with Mirastros Button Component (React Native)
 * Displays a button to open the AI chat with service context
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './Button';

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
          <Text className="text-yellow-600 text-xs font-semibold ml-2 bg-yellow-900/30 px-2 py-1 rounded">
            Premium
          </Text>
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
      <Button
        onPress={() => {
          console.log('Opening chat with context:', { contextType, contextData });
          onClarify();
        }}
        className="w-full"
      >
        💬 Уточнить с Mirastros
      </Button>
    </View>
  );
};
