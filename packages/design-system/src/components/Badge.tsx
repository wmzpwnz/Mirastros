/**
 * Badge Component
 * A badge component for status indicators with multiple variants and sizes
 */

import React, { forwardRef } from 'react';
import type { BadgeProps } from '../types';

const variantStyles = {
  default: 'bg-gray-700 text-gray-100',
  primary: 'bg-gold-500 text-cosmic',
  secondary: 'bg-gray-600 text-gray-100',
  success: 'bg-success text-white',
  warning: 'bg-warning text-cosmic',
  error: 'bg-error text-white',
  danger: 'bg-error text-white',
  info: 'bg-info text-white',
};

const sizeStyles = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
};

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      icon,
      children,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    const baseStyles = 'inline-flex items-center gap-1 rounded-full font-medium';
    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`.trim();

    return (
      <div
        ref={ref}
        className={combinedClassName}
        style={style}
        data-testid={testId}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      >
        {icon && <span className="flex items-center">{icon}</span>}
        {children}
      </div>
    );
  },
);

Badge.displayName = 'Badge';
