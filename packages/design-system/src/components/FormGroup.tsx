/**
 * FormGroup Component
 * A wrapper component that combines label, input, and error message with accessibility support
 */

import React, { forwardRef } from 'react';
import { Label } from './Label';
import type { BaseComponentProps } from '../types';

export interface FormGroupProps extends BaseComponentProps {
  /**
   * Label text
   */
  label?: string;

  /**
   * Whether the field is required
   * @default false
   */
  required?: boolean;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Helper text to display below the input
   */
  helperText?: string;

  /**
   * The input element or component
   */
  children: React.ReactNode;

  /**
   * Field name for aria-describedby
   */
  name?: string;

  /**
   * Field id for aria-describedby
   */
  id?: string;
}

export const FormGroup = forwardRef<HTMLDivElement, FormGroupProps>(
  (
    {
      label,
      required = false,
      error,
      helperText,
      children,
      name,
      id,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    const fieldId = id || name;
    const errorId = error ? `${fieldId}-error` : undefined;
    const helperTextId = helperText ? `${fieldId}-helper` : undefined;
    const describedBy = [ariaDescribedBy, errorId, helperTextId]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div
        ref={ref}
        className={`flex flex-col gap-2 ${className || ''}`}
        style={style}
        data-testid={testId}
      >
        {label && (
          <Label
            htmlFor={fieldId}
            required={required}
            ariaLabel={ariaLabel}
          >
            {label}
          </Label>
        )}

        {/* Input wrapper with aria-describedby */}
        <div
          aria-describedby={describedBy}
          role="group"
        >
          {React.isValidElement(children)
            ? React.cloneElement(children as React.ReactElement<any>, {
                id: fieldId,
                'aria-describedby': describedBy,
                'aria-invalid': !!error,
              })
            : children}
        </div>

        {/* Error message */}
        {error && (
          <span
            id={errorId}
            className="text-error text-sm flex items-center gap-1"
            role="alert"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </span>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <span id={helperTextId} className="text-gray-400 text-sm">
            {helperText}
          </span>
        )}
      </div>
    );
  },
);

FormGroup.displayName = 'FormGroup';
