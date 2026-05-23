/**
 * Accordion Component (React Native)
 * Mobile-optimized accordion using design system tokens
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerText: {
    flex: 1,
    color: '#E8E8E8',
    fontWeight: '600',
  },
  chevron: {
    color: '#D4AF37',
    fontSize: 20,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contentText: {
    color: 'rgba(232, 232, 232, 0.7)',
  },
});

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  className,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      if (!allowMultiple) {
        newExpanded.clear();
      }
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <View>
      {items.map((item) => (
        <AccordionItemComponent
          key={item.id}
          item={item}
          isExpanded={expandedItems.has(item.id)}
          onToggle={() => toggleItem(item.id)}
        />
      ))}
    </View>
  );
};

interface AccordionItemComponentProps {
  item: AccordionItem;
  isExpanded: boolean;
  onToggle: () => void;
}

const AccordionItemComponent: React.FC<AccordionItemComponentProps> = ({
  item,
  isExpanded,
  onToggle,
}) => {
  const heightValue = useSharedValue(0);

  React.useEffect(() => {
    heightValue.value = withTiming(isExpanded ? 200 : 0, { duration: 300 });
  }, [isExpanded, heightValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: heightValue.value,
    overflow: 'hidden',
  }));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onToggle}
        style={styles.header}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
      >
        <Text style={styles.headerText}>{item.title}</Text>
        <Text style={[styles.chevron, { transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }]}>
          ›
        </Text>
      </TouchableOpacity>

      <Animated.View style={[animatedStyle, styles.contentContainer]}>
        {typeof item.content === 'string' ? (
          <Text style={styles.contentText}>{item.content}</Text>
        ) : (
          item.content
        )}
      </Animated.View>
    </View>
  );
};
