/**
 * Skeleton Component
 * A placeholder component for loading states
 */

import React, { forwardRef } from 'react';
import type { SkeletonProps } from '../types';

const borderRadiusMap = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      shape = 'rect',
      width,
      height,
      lines = 1,
      animated = true,
      borderRadius = 'md',
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    const baseStyles = `bg-gray-700 ${animated ? 'animate-pulse' : ''} ${borderRadiusMap[borderRadius]}`;

    if (shape === 'circle') {
      const size = width || height || '40px';
      const combinedClassName = `${baseStyles} ${className || ''}`.trim();

      return (
        <div
          ref={ref}
          className={`${combinedClassName} rounded-full`}
          style={{
            width: size,
            height: size,
            ...style,
          }}
          data-testid={testId}
          aria-label={ariaLabel || 'Loading'}
          aria-describedby={ariaDescribedBy}
          role="status"
          aria-busy="true"
        />
      );
    }

    if (shape === 'text') {
      return (
        <div
          ref={ref}
          className="space-y-2"
          data-testid={testId}
          aria-label={ariaLabel || 'Loading'}
          aria-describedby={ariaDescribedBy}
          role="status"
          aria-busy="true"
        >
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={`${baseStyles} ${className || ''}`.trim()}
              style={{
                width: index === lines - 1 ? '80%' : '100%',
                height: height || '12px',
                ...style,
              }}
            />
          ))}
        </div>
      );
    }

    // Default rect shape
    const combinedClassName = `${baseStyles} ${className || ''}`.trim();

    return (
      <div
        ref={ref}
        className={combinedClassName}
        style={{
          width: width || '100%',
          height: height || '20px',
          ...style,
        }}
        data-testid={testId}
        aria-label={ariaLabel || 'Loading'}
        aria-describedby={ariaDescribedBy}
        role="status"
        aria-busy="true"
      />
    );
  },
);

Skeleton.displayName = 'Skeleton';
