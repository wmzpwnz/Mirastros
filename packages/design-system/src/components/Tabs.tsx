'use client';

/**
 * Tabs Component
 * A tabbed interface with keyboard navigation and accessibility support
 */

import React, { useState, useRef } from 'react';
import type { TabsProps } from '../types';

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      items,
      activeTab,
      onChange,
      children,
      vertical = false,
      disabled = false,
      className,
      style,
      testId,
      ariaLabel,
    },
    ref,
  ) => {
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [, setFocusedIndex] = useState(0);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      let newIndex = index;

      if (vertical) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          newIndex = (index + 1) % items.length;
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          newIndex = (index - 1 + items.length) % items.length;
        }
      } else {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          newIndex = (index + 1) % items.length;
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          newIndex = (index - 1 + items.length) % items.length;
        }
      }

      if (e.key === 'Home') {
        e.preventDefault();
        newIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        newIndex = items.length - 1;
      }

      if (newIndex !== index) {
        setFocusedIndex(newIndex);
        tabRefs.current[newIndex]?.focus();
        onChange(items[newIndex].value);
      }
    };

    const baseStyles = vertical
      ? 'flex flex-col border-r border-gray-700'
      : 'flex border-b border-gray-700';

    const tabListClassName = `mira-tabs ${baseStyles} ${className || ''}`.trim();

    const tabButtonBaseStyles =
      'px-4 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-cosmic';

    return (
      <div
        ref={ref}
        className={tabListClassName}
        style={style}
        data-testid={testId}
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation={vertical ? 'vertical' : 'horizontal'}
      >
        {/* Tab buttons */}
        <div className={vertical ? 'flex flex-col' : 'flex'}>
          {items.map((item, index) => {
            const isActive = item.value === activeTab;
            const isDisabledItem = item.disabled || disabled;

            const tabStyles = isActive
              ? 'text-gold-500 border-b-2 border-gold-500'
              : 'text-gray-400 hover:text-gray-200';

            const disabledStyles = isDisabledItem ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

            return (
              <button
                key={item.value}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${item.value}`}
                disabled={isDisabledItem}
                onClick={() => {
                  if (!isDisabledItem) {
                    onChange(item.value);
                    setFocusedIndex(index);
                  }
                }}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`${tabButtonBaseStyles} ${tabStyles} ${disabledStyles}`.trim()}
              >
                {item.icon && <span className="mr-2 inline-flex">{item.icon}</span>}
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="w-full">
          {items.map((item) => (
            <div
              key={item.value}
              id={`tabpanel-${item.value}`}
              role="tabpanel"
              aria-labelledby={`tab-${item.value}`}
              hidden={item.value !== activeTab}
              className="p-4"
            >
              {item.value === activeTab && children[item.value]}
            </div>
          ))}
        </div>
      </div>
    );
  },
);

Tabs.displayName = 'Tabs';
