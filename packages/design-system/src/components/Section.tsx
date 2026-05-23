/**
 * Section Component
 * A full-width container for organizing page sections with consistent spacing
 */

import React, { forwardRef } from 'react';
import type { SectionProps } from '../types/section';

const paddingStyles = {
  sm: 'py-8 px-4',
  md: 'py-12 px-6',
  lg: 'py-16 px-8',
  xl: 'py-24 px-12',
};

const spacingStyles = {
  sm: 'my-4',
  md: 'my-8',
  lg: 'my-12',
  xl: 'my-16',
};

export const Section = forwardRef<HTMLDivElement, SectionProps>(
  (
    {
      id,
      children,
      backgroundColor = 'transparent',
      padding = 'md',
      fullWidth = true,
      title,
      subtitle,
      spacing = 'md',
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    const baseStyles = 'w-full';
    const paddingClass = paddingStyles[padding];
    const spacingClass = spacingStyles[spacing];
    const widthClass = fullWidth ? 'w-full' : 'max-w-6xl mx-auto';

    const combinedClassName = `${baseStyles} ${paddingClass} ${spacingClass} ${className || ''}`.trim();

    const combinedStyle = {
      backgroundColor,
      ...style,
    };

    return (
      <section
        id={id}
        ref={ref}
        className={combinedClassName}
        style={combinedStyle}
        data-testid={testId}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      >
        <div className={widthClass}>
          {/* Section Header */}
          {(title || subtitle) && (
            <div className="mb-12 text-center">
              {title && (
                <h2 className="text-4xl font-bold text-gray-100 mb-4 font-heading">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Section Content */}
          {children}
        </div>
      </section>
    );
  },
);

Section.displayName = 'Section';
