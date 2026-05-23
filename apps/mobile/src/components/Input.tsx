/**
 * Input Component (React Native)
 * Mobile-optimized input using design system tokens
 */

import React from 'react';
import { TextInput, View, Text } from 'react-native';

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
  onBlur?: () => void;
  onFocus?: () => void;
  className?: string;
  testID?: string;
  accessibilityLabel?: string;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  icon,
  onBlur,
  onFocus,
  className,
  testID,
  accessibilityLabel,
}) => {
  const keyboardType =
    type === 'email'
      ? 'email-address'
      : type === 'number'
        ? 'numeric'
        : 'default';

  const secureTextEntry = type === 'password';

  return (
    <View className={className}>
      <View className="flex-row items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3">
        {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
        <TextInput
          style={{ flex: 1, color: '#E8E8E8' }}
          placeholder={placeholder}
          placeholderTextColor="#888"
          value={value}
          onChangeText={onChange}
          editable={!disabled}
          required={required}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          onBlur={onBlur}
          onFocus={onFocus}
          testID={testID}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="text"
          accessibilityState={{ disabled }}
        />
      </View>
      {error && (
        <Text className="text-red-500 text-sm mt-2" accessibilityRole="alert">
          {error}
        </Text>
      )}
    </View>
  );
};
