'use client';

/**
 * Tooltip Component
 * A component that displays additional information on hover or focus
 */

import React, { useState, useRef, forwardRef } from 'react';
import type { TooltipProps } from '../types';

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      position = 'top',
      trigger = 'hover',
      isVisible: controlledIsVisible,
      delay = 0,
      children,
      maxWidth = 200,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipId] = useState(() => `tooltip-${Math.random().toString(36).substr(2, 9)}`);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    const visible = controlledIsVisible !== undefined ? controlledIsVisible : isVisible;

    const handleMouseEnter = () => {
      if (trigger !== 'hover') return;
      if (delay > 0) {
        timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
      } else {
        setIsVisible(true);
      }
    };

    const handleMouseLeave = () => {
      if (trigger !== 'hover') return;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsVisible(false);
    };

    const handleClick = () => {
      if (trigger !== 'click') return;
      setIsVisible(!isVisible);
    };

    const handleFocus = () => {
      if (trigger !== 'focus') return;
      setIsVisible(true);
    };

    const handleBlur = () => {
      if (trigger !== 'focus') return;
      setIsVisible(false);
    };

    const positionClasses = {
      top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
      bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
      left: 'right-full mr-2 top-1/2 -translate-y-1/2',
      right: 'left-full ml-2 top-1/2 -translate-y-1/2',
    };

    const arrowClasses = {
      top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800',
      bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-800',
      left: 'right-[-4px] top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-gray-800',
      right: 'left-[-4px] top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-gray-800',
    };

    return (
      <div
        ref={triggerRef}
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {children}

        {visible && (
          <div
            ref={ref}
            className={`absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-800 rounded shadow-lg pointer-events-none ${positionClasses[position]} ${className || ''}`}
            style={{
              maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
              ...style,
            }}
            data-testid={testId}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            id={tooltipId}
            role="tooltip"
          >
            <div className="break-words">{content}</div>
            <div className={`absolute ${arrowClasses[position]}`} />
          </div>
        )}
      </div>
    );
  },
);

Tooltip.displayName = 'Tooltip';
