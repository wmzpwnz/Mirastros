/**
 * Container Component
 * A max-width wrapper with responsive padding and centering
 */

import React, { forwardRef } from 'react';
import type { ContainerProps } from '../types/container';

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
};

const paddingStyles = {
  sm: 'px-4',
  md: 'px-6',
  lg: 'px-8',
  xl: 'px-12',
  '2xl': 'px-16',
  full: 'px-4',
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      size = 'lg',
      padded = true,
      padding,
      centered = true,
      children,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    const baseStyles = 'w-full';
    const maxWidthClass = sizeStyles[size];
    const paddingClass = padded && !padding ? paddingStyles[size] : '';
    const centerClass = centered ? 'mx-auto' : '';

    const combinedClassName = `${baseStyles} ${maxWidthClass} ${centerClass} ${paddingClass} ${className || ''}`.trim();

    const combinedStyle = {
      ...style,
      ...(padding && { padding: typeof padding === 'number' ? `${padding}px` : padding }),
    };

    return (
      <div
        ref={ref}
        className={combinedClassName}
        style={combinedStyle}
        data-testid={testId}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      >
        {children}
      </div>
    );
  },
);

Container.displayName = 'Container';
