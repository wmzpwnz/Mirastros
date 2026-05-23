/**
 * Button Component (React Native)
 * Mobile-optimized button using design system tokens
 */

import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  onPress?: () => void;
  children: React.ReactNode;
  className?: string;
  testID?: string;
  accessibilityLabel?: string;
}

const variantStyles = {
  primary: 'bg-gold-500',
  secondary: 'bg-gray-700 border border-gray-600',
  danger: 'bg-red-500',
  ghost: 'border border-gold-500',
};

const variantTextStyles = {
  primary: 'text-cosmic',
  secondary: 'text-gray-100',
  danger: 'text-white',
  ghost: 'text-gold-500',
};

const sizeStyles = {
  sm: 'px-3 py-2',
  md: 'px-6 py-3',
  lg: 'px-8 py-4',
};

const sizeTextStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  onPress,
  children,
  className,
  testID,
  accessibilityLabel,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : 0.7}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={`rounded-lg font-semibold flex-row items-center justify-center ${variantStyles[variant]} ${sizeStyles[size]} ${isDisabled ? 'opacity-50' : ''} ${className || ''}`}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'ghost' ? '#D4AF37' : variant === 'danger' ? '#fff' : '#050505'}
          style={{ marginRight: 8 }}
        />
      )}
      {icon && !loading && <View style={{ marginRight: 8 }}>{icon}</View>}
      <Text className={`font-semibold ${variantTextStyles[variant]} ${sizeTextStyles[size]}`}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};
