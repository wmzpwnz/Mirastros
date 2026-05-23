/**
 * Button Component
 * A versatile button component with multiple variants, sizes, and states
 */

import React, { forwardRef } from 'react';
import type { ButtonProps } from '../types';

const variantStyles = {
  primary: 'bg-gold-500 text-cosmic hover:bg-gold-600 active:bg-gold-700 disabled:bg-gray-600 disabled:text-gray-400',
  secondary: 'bg-gray-700 text-gray-100 border border-gray-600 hover:bg-gray-600 active:bg-gray-500 disabled:bg-gray-600 disabled:text-gray-400',
  danger: 'bg-error text-white hover:bg-red-600 active:bg-red-700 disabled:bg-gray-600 disabled:text-gray-400',
  ghost: 'text-gold-500 border border-gold-500 hover:bg-gray-800 active:bg-gray-700 disabled:text-gray-400 disabled:border-gray-400',
};

const sizeStyles = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-6 py-2 text-base',
  lg: 'px-8 py-3 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      icon,
      onClick,
      children,
      type = 'button',
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    const baseStyles = 'rounded font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-cosmic disabled:cursor-not-allowed disabled:opacity-50 inline-flex items-center gap-2';

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`.trim();

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={onClick}
        className={combinedClassName}
        style={style}
        data-testid={testId}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-busy={loading}
      >
        {loading && (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {icon && !loading && <span className="flex items-center">{icon}</span>}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
