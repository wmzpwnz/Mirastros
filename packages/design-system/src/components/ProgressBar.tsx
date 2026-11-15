/**
 * ProgressBar Component
 * A linear progress indicator with optional label and animation
 */

import React from 'react';
import type { ProgressBarProps } from '../types';

const variantStyles = {
  default: 'bg-gold-500',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
};

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      variant = 'default',
      showLabel = false,
      animated = true,
      size = 'md',
      min = 0,
      max = 100,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    // Clamp value between min and max
    const clampedValue = Math.max(min, Math.min(max, value));
    const percentage = ((clampedValue - min) / (max - min)) * 100;

    const baseStyles = 'w-full bg-gray-800 rounded-full overflow-hidden';
    const containerClassName = `mira-progress ${baseStyles} ${sizeStyles[size]} ${className || ''}`.trim();

    const progressStyles = `${variantStyles[variant]} ${
      animated ? 'transition-all duration-300' : ''
    }`;

    return (
      <div
        ref={ref}
        className={containerClassName}
        style={style}
        data-testid={testId}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={ariaLabel || 'Progress'}
        aria-describedby={ariaDescribedBy}
      >
        <div
          className={`${progressStyles} h-full rounded-full`}
          style={{ width: `${percentage}%` }}
        />

        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-900">{Math.round(percentage)}%</span>
          </div>
        )}
      </div>
    );
  },
);

ProgressBar.displayName = 'ProgressBar';
