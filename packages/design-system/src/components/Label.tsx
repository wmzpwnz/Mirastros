/**
 * Label Component
 * A label component for form fields with required indicator and error state
 */

import React, { forwardRef } from 'react';
import type { LabelProps } from '../types';

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      htmlFor,
      required = false,
      error = false,
      children,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    const baseStyles = 'block text-sm font-medium transition-colors';
    const colorStyles = error ? 'text-error' : 'text-gray-200';
    const combinedClassName = `${baseStyles} ${colorStyles} ${className || ''}`.trim();

    return (
      <label
        ref={ref}
        htmlFor={htmlFor}
        className={combinedClassName}
        style={style}
        data-testid={testId}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      >
        <span className="flex items-center gap-1">
          {children}
          {required && <span className="text-error" aria-label="required">*</span>}
        </span>
      </label>
    );
  },
);

Label.displayName = 'Label';
