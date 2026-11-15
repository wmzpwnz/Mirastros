/**
 * Input Component
 * A flexible input component with multiple types, validation, and icon support
 */

import React, { forwardRef } from 'react';
import type { InputProps } from '../types';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      placeholder,
      value,
      onChange,
      error,
      disabled = false,
      required = false,
      icon,
      suffixIcon,
      name,
      id,
      onBlur,
      onFocus,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    const baseStyles = 'mira-input w-full px-4 py-2 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed';

    const borderStyles = error
      ? 'border-error focus:border-error'
      : 'border-gray-600 focus:border-gold-500';

    const combinedClassName = `${baseStyles} ${borderStyles} ${className || ''}`.trim();

    const containerClassName = 'relative flex items-center';

    return (
      <div className={containerClassName}>
        {icon && (
          <span className="absolute left-3 flex items-center text-gray-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          required={required}
          name={name}
          id={id}
          onBlur={onBlur}
          onFocus={onFocus}
          className={`${combinedClassName} ${icon ? 'pl-10' : ''} ${suffixIcon ? 'pr-10' : ''}`}
          style={style}
          data-testid={testId}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy || (error ? `${id}-error` : undefined)}
          aria-invalid={!!error}
        />
        {suffixIcon && (
          <span className="absolute right-3 flex items-center text-gray-400 pointer-events-none">
            {suffixIcon}
          </span>
        )}
        {error && (
          <span id={`${id}-error`} className="absolute -bottom-6 left-0 text-error text-sm">
            {error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
