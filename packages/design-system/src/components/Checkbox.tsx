/**
 * Checkbox Component
 * A checkbox component with support for single, group, and indeterminate states
 */

import React, { forwardRef } from 'react';
import type { CheckboxProps } from '../types';

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked = false,
      onChange,
      indeterminate = false,
      disabled = false,
      label,
      name,
      id,
      value,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    const baseStyles =
      'w-5 h-5 rounded border-2 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-cosmic disabled:cursor-not-allowed disabled:opacity-50';

    const borderStyles = checked || indeterminate
      ? 'border-gold bg-gold'
      : 'border-white/30 bg-white/5 hover:border-gold/50';

    const widthMatch = className?.match(/w-\d+|!w-\d+/);
    const heightMatch = className?.match(/h-\d+|!h-\d+/);
    const sizeClass = widthMatch || heightMatch ? '' : 'w-5 h-5';
    const combinedClassName = `${baseStyles} ${borderStyles} ${className || ''}`.trim();

    return (
      <div className="flex items-center gap-2" style={style}>
        <div className={`relative flex items-center justify-center shrink-0 ${sizeClass} ${widthMatch ? widthMatch[0] : ''} ${heightMatch ? heightMatch[0] : ''}`}>
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            disabled={disabled}
            name={name}
            id={id}
            value={value}
            className={`${combinedClassName} appearance-none absolute inset-0 !m-0`}
            data-testid={testId}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            aria-checked={indeterminate ? 'mixed' : checked}
          />
          {/* Checkmark icon */}
          {(checked || indeterminate) && (
            <svg
              className="w-full h-full p-1 text-black pointer-events-none z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {indeterminate ? (
                <line x1="6" y1="12" x2="18" y2="12" strokeWidth="3" />
              ) : (
                <polyline
                  points="20 6 9 17 4 12"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          )}
        </div>
        {label && (
          <label
            htmlFor={id}
            className={`text-gray-100 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
