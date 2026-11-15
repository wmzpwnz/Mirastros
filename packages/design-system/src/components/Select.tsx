'use client';

/**
 * Select Component
 * A dropdown component with search, multi-select, and keyboard navigation support
 */

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import type { SelectProps } from '../types';

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Select an option',
      multiple = false,
      disabled = false,
      searchable = false,
      error,
      id,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedValues, setSelectedValues] = useState<(string | number)[]>(
      multiple && Array.isArray(value) ? value : value ? [value] : [],
    );
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const safeOptions = options ?? [];
    const filteredOptions = searchable
      ? safeOptions.filter((opt) =>
          opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : safeOptions;

    const handleSelect = (optionValue: string | number) => {
      if (multiple) {
        const newValues = selectedValues.includes(optionValue)
          ? selectedValues.filter((v) => v !== optionValue)
          : [...selectedValues, optionValue];
        setSelectedValues(newValues);
        onChange?.(newValues as unknown as string | number);
      } else {
        setSelectedValues([optionValue]);
        onChange?.(optionValue);
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev,
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex].value);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
        default:
          break;
      }
    };

    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabels = safeOptions
      .filter((opt) => (selectedValues ?? []).includes(opt.value))
      .map((opt) => opt.label)
      .join(', ');

    const baseStyles =
      'w-full px-4 py-2 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed';

    const borderStyles = error
      ? 'border-error focus:border-error'
      : 'border-gray-600 focus:border-gold-500';

    const combinedClassName = `mira-select ${baseStyles} ${borderStyles} ${className || ''}`.trim();

    return (
      <div
        ref={ref}
        className="relative w-full"
        style={style}
        data-testid={testId}
      >
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`${combinedClassName} text-left flex justify-between items-center`}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy || (error ? `${id}-error` : undefined)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          id={id}
        >
          <span className={selectedLabels ? 'text-gray-100' : 'text-gray-400'}>
            {selectedLabels || placeholder}
          </span>
          <span className="text-gray-400">
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div
            ref={containerRef}
            className="absolute top-full left-0 right-0 mt-1 bg-gray-800/95 backdrop-blur-md border border-gray-600 rounded shadow-lg z-50"
            role="listbox"
              data-mira-select-menu
            aria-label={ariaLabel}
          >
            {searchable && (
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(0);
                }}
                className="w-full px-4 py-2 border-b border-gray-600 bg-gray-800 text-gray-100 focus:outline-none"
              />
            )}
            <ul className="max-h-60 overflow-y-auto">
              {filteredOptions.map((option, index) => (
                <li
                  key={`${option.value}-${index}`}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  className={`px-4 py-2 cursor-pointer transition-colors ${
                    index === highlightedIndex ? 'bg-gold-500 text-cosmic' : ''
                  } ${
                    option.disabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-700'
                  } ${
                    selectedValues.includes(option.value)
                      ? 'bg-gray-700 text-gold-500'
                      : 'text-gray-100'
                  }`}
                  role="option"
                  aria-selected={selectedValues.includes(option.value)}
                >
                  {multiple && (
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option.value)}
                      onChange={() => handleSelect(option.value)}
                      className="mr-2"
                      disabled={option.disabled}
                    />
                  )}
                  {option.label}
                </li>
              ))}
            </ul>
          </div>
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

Select.displayName = 'Select';
