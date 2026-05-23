/**
 * Tabs Component (React Native)
 * Mobile-optimized tabs using design system tokens
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

export interface TabsProps {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onTabChange,
  className,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <View className={className}>
      {/* Tab List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="border-b border-white/10"
      >
        <View className="flex-row">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => handleTabChange(tab.id)}
              className={`px-4 py-3 border-b-2 ${
                activeTab === tab.id
                  ? 'border-gold-500'
                  : 'border-transparent'
              }`}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === tab.id }}
            >
              <Text
                className={`font-semibold ${
                  activeTab === tab.id ? 'text-gold-500' : 'text-silver/60'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Tab Content */}
      <View className="mt-4">{activeTabData?.content}</View>
    </View>
  );
};
