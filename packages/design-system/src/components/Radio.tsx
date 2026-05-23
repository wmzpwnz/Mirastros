/**
 * Radio Component
 * A radio button component with support for single selection and groups
 */

import React, { forwardRef } from 'react';
import type { RadioProps, RadioGroupProps } from '../types';

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      checked = false,
      onChange,
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
      'w-5 h-5 rounded-full border-2 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-cosmic disabled:cursor-not-allowed disabled:opacity-50';

    const borderStyles = checked
      ? 'border-gold-500 bg-gold-500'
      : 'border-gray-600 bg-transparent hover:border-gold-400';

    const combinedClassName = `${baseStyles} ${borderStyles} ${className || ''}`.trim();

    return (
      <div className="flex items-center gap-2" style={style}>
        <input
          ref={ref}
          type="radio"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          name={name}
          id={id}
          value={value}
          className={`${combinedClassName} appearance-none`}
          data-testid={testId}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
        />
        {/* Radio dot */}
        {checked && (
          <div className="absolute w-2 h-2 bg-cosmic rounded-full pointer-events-none" />
        )}
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

Radio.displayName = 'Radio';

/**
 * RadioGroup Component
 * A group of radio buttons for single selection
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      options,
      value,
      onChange,
      disabled = false,
      name,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`flex flex-col gap-3 ${className || ''}`}
        style={style}
        data-testid={testId}
        role="radiogroup"
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      >
        {options.map((option, index) => (
          <Radio
            key={`${option.value}-${index}`}
            checked={value === option.value}
            onChange={() => onChange?.(option.value)}
            disabled={disabled || option.disabled}
            label={option.label}
            name={name}
            id={`${name}-${index}`}
            value={option.value}
          />
        ))}
      </div>
    );
  },
);

RadioGroup.displayName = 'RadioGroup';
