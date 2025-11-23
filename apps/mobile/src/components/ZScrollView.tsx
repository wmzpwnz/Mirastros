import React, { ReactNode } from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ZScrollItemProps {
  children: ReactNode;
  index: number;
  scrollY: Animated.SharedValue<number>;
  itemHeight?: number;
}

export function ZScrollItem({ children, index, scrollY, itemHeight = SCREEN_HEIGHT }: ZScrollItemProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * itemHeight,
      index * itemHeight,
      (index + 1) * itemHeight,
    ];

    // Zoom effect
    const scale = interpolate(
      scrollY.value,
      inputRange,
      [0.8, 1, 0.8],
      Extrapolate.CLAMP
    );

    // Fade effect
    const opacity = interpolate(
      scrollY.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolate.CLAMP
    );

    // Zig-zag positioning (alternating left/right)
    const translateX = interpolate(
      scrollY.value,
      inputRange,
      index % 2 === 0 ? [-50, 0, 50] : [50, 0, -50],
      Extrapolate.CLAMP
    );

    // Blur simulation with opacity
    const blurOpacity = interpolate(
      scrollY.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }, { translateX }],
      opacity: opacity * blurOpacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          height: itemHeight,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        },
        animatedStyle,
      ]}
    >
      {children}
    </Animated.View>
  );
}

interface ZScrollViewProps {
  children: ReactNode[];
  itemHeight?: number;
}

export default function ZScrollView({ children, itemHeight = SCREEN_HEIGHT }: ZScrollViewProps) {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <Animated.ScrollView
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      snapToInterval={itemHeight}
      decelerationRate="fast"
      style={{ flex: 1 }}
    >
      {React.Children.map(children, (child, index) => (
        <ZScrollItem
          key={index}
          index={index}
          scrollY={scrollY}
          itemHeight={itemHeight}
        >
          {child}
        </ZScrollItem>
      ))}
    </Animated.ScrollView>
  );
}
