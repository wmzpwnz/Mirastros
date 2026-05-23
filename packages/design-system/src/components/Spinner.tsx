/**
 * Spinner Component
 * A loading indicator component with animation
 */

import React, { forwardRef } from 'react';
import type { SpinnerProps } from '../types';

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

const textSizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      size = 'md',
      color = 'currentColor',
      text,
      isVisible = true,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    if (!isVisible) return null;

    const baseStyles = 'flex flex-col items-center justify-center gap-3';
    const combinedClassName = `${baseStyles} ${className || ''}`.trim();

    return (
      <div
        ref={ref}
        className={combinedClassName}
        style={style}
        data-testid={testId}
        aria-label={ariaLabel || 'Loading'}
        aria-describedby={ariaDescribedBy}
        aria-busy="true"
        role="status"
      >
        <div
          className={`${sizeMap[size]} border-2 border-gray-700 border-t-gold-500 rounded-full animate-spin`}
          style={{ borderTopColor: color }}
        />
        {text && <p className={`${textSizeMap[size]} text-gray-400`}>{text}</p>}
      </div>
    );
  },
);

Spinner.displayName = 'Spinner';
