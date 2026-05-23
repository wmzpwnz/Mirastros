import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export interface ServiceCardProps {
  title: string;
  description: string;
  icon: string;
  gradient?: string[];
  onPress?: () => void;
}

export default function ServiceCard({ title, description, icon, onPress }: ServiceCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 mx-4">
        <View className="items-center mb-6">
          <Text className="text-6xl mb-4">{icon}</Text>
          <Text className="text-3xl font-cinzel text-gold text-center mb-3">
            {title}
          </Text>
          <Text className="text-silver/70 text-center text-base leading-6">
            {description}
          </Text>
        </View>
        
        <View className="bg-gold/10 px-6 py-3 rounded-xl self-center">
          <Text className="text-gold text-base font-semibold">
            Explore →
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
