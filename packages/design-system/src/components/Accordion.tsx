'use client';

/**
 * Accordion Component
 * A collapsible sections component with keyboard navigation and accessibility support
 */

import React, { useState } from 'react';
import type { AccordionProps } from '../types';
import { Icon } from './Icon';

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      items,
      openItems: controlledOpenItems,
      onChange,
      exclusive = false,
      disabled = false,
      className,
      style,
      testId,
      ariaLabel,
    },
    ref,
  ) => {
    const [uncontrolledOpenItems, setUncontrolledOpenItems] = useState<string[]>([]);

    // Use controlled or uncontrolled state
    const isControlled = controlledOpenItems !== undefined;
    const openItems = isControlled ? controlledOpenItems : uncontrolledOpenItems;

    const handleToggle = (itemId: string) => {
      if (disabled) return;

      let newOpenItems: string[];

      if (exclusive) {
        // Only one item can be open
        newOpenItems = openItems.includes(itemId) ? [] : [itemId];
      } else {
        // Multiple items can be open
        newOpenItems = openItems.includes(itemId)
          ? openItems.filter((id) => id !== itemId)
          : [...openItems, itemId];
      }

      if (isControlled) {
        onChange?.(newOpenItems);
      } else {
        setUncontrolledOpenItems(newOpenItems);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, itemId: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggle(itemId);
      }
    };

    const baseStyles = 'space-y-2';
    const containerClassName = `${baseStyles} ${className || ''}`.trim();

    return (
      <div
        ref={ref}
        className={containerClassName}
        style={style}
        data-testid={testId}
        role="region"
        aria-label={ariaLabel}
      >
        {items.map((item) => {
          const isOpen = openItems.includes(item.id);
          const isDisabledItem = item.disabled || disabled;

          return (
            <div
              key={item.id}
              className="border border-gray-700 rounded overflow-hidden"
              role="region"
              aria-labelledby={`accordion-button-${item.id}`}
            >
              {/* Accordion header/button */}
              <button
                id={`accordion-button-${item.id}`}
                onClick={() => handleToggle(item.id)}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
                disabled={isDisabledItem}
                className={`w-full px-4 py-3 flex items-center justify-between font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-cosmic ${
                  isOpen ? 'bg-gray-800 text-gold-500' : 'bg-gray-900 text-gray-200 hover:bg-gray-800'
                } ${isDisabledItem ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                aria-expanded={isOpen}
                aria-controls={`accordion-content-${item.id}`}
              >
                <div className="flex items-center gap-2">
                  {item.icon && <span className="flex items-center">{item.icon}</span>}
                  <span>{item.title}</span>
                </div>
                <span
                  className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                >
                  <Icon name="chevron-down" size="md" />
                </span>
              </button>

              {/* Accordion content */}
              <div
                id={`accordion-content-${item.id}`}
                hidden={!isOpen}
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? 'max-h-96' : 'max-h-0'
                }`}
                role="region"
              >
                <div className="px-4 py-3 bg-gray-950 text-gray-300 border-t border-gray-700">
                  {item.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);

Accordion.displayName = 'Accordion';
