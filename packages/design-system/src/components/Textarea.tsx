'use client';

/**
 * Textarea Component
 * A multi-line text input component with auto-resize, character count, and validation support
 */

import React, { forwardRef, useRef, useEffect } from 'react';
import type { TextareaProps } from '../types';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      placeholder,
      value = '',
      onChange,
      error,
      disabled = false,
      required = false,
      rows = 4,
      autoResize = false,
      maxLength,
      showCharCount = false,
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
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // Auto-resize textarea based on content
    useEffect(() => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [value, autoResize]);

    const baseStyles =
      'w-full px-4 py-2 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed resize-none';

    const borderStyles = error
      ? 'border-error focus:border-error'
      : 'border-gray-600 focus:border-gold-500';

    const combinedClassName = `mira-textarea ${baseStyles} ${borderStyles} ${className || ''}`.trim();

    const charCount = String(value).length;
    const charCountPercentage = maxLength ? (charCount / maxLength) * 100 : 0;

    return (
      <div className="w-full" style={style}>
        <textarea
          ref={(node) => {
            textareaRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
            }
          }}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          required={required}
          rows={rows}
          maxLength={maxLength}
          name={name}
          id={id}
          onBlur={onBlur}
          onFocus={onFocus}
          className={combinedClassName}
          data-testid={testId}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy || (error ? `${id}-error` : undefined)}
          aria-invalid={!!error}
        />

        {/* Character count and error display */}
        <div className="flex justify-between items-center mt-2">
          <div>
            {error && (
              <span id={`${id}-error`} className="text-error text-sm">
                {error}
              </span>
            )}
          </div>
          {showCharCount && maxLength && (
            <span className="text-gray-400 text-sm">
              {charCount} / {maxLength}
            </span>
          )}
        </div>

        {/* Character count progress bar */}
        {showCharCount && maxLength && (
          <div className="mt-2 h-1 bg-gray-700 rounded overflow-hidden">
            <div
              className={`h-full transition-all ${
                charCountPercentage > 90
                  ? 'bg-error'
                  : charCountPercentage > 75
                    ? 'bg-warning'
                    : 'bg-gold-500'
              }`}
              style={{ width: `${charCountPercentage}%` }}
            />
          </div>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
