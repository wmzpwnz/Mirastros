/**
 * Card Component
 * A versatile card container with multiple variants and interactive states
 */

import React, { forwardRef } from 'react';
import type { CardProps } from '../types';

const variantStyles = {
  default: 'bg-gray-800 border border-gray-700',
  elevated: 'bg-gray-800 shadow-lg',
  outlined: 'bg-transparent border-2 border-gold-500',
};

const paddingStyles = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      interactive = false,
      onClick,
      padding = 'md',
      children,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    const baseStyles = 'rounded-lg transition-all';
    const variantClass = variantStyles[variant];
    const paddingClass = paddingStyles[padding];
    const interactiveClass = interactive ? 'hover:border-gold-500 hover:shadow-lg cursor-pointer' : '';

    const combinedClassName = `${baseStyles} ${variantClass} ${paddingClass} ${interactiveClass} ${className || ''}`.trim();

    return (
      <div
        ref={ref}
        className={combinedClassName}
        style={style}
        onClick={onClick}
        data-testid={testId}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={
          interactive
            ? (e: React.KeyboardEvent<HTMLDivElement>) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
                }
              }
            : undefined
        }
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
