/**
 * Card Component (React Native)
 * Mobile-optimized card using design system tokens
 */

import React from 'react';
import { View, ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  default: 'bg-white/5 border border-white/10',
  elevated: 'bg-white/10 border border-white/20 shadow-lg',
  outlined: 'bg-transparent border border-white/20',
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  children,
  className,
  ...props
}) => {
  return (
    <View
      className={`rounded-2xl p-6 ${variantStyles[variant]} ${className || ''}`}
      {...props}
    >
      {children}
    </View>
  );
};
