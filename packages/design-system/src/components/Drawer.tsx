'use client';

/**
 * Drawer Component
 * A side panel overlay with slide animation and keyboard support
 */

import React, { useEffect, useRef, forwardRef } from 'react';
import type { DrawerProps } from '../types';
import { Icon } from './Icon';

const positionStyles = {
  left: 'left-0 top-0 h-full animate-slide-in-left',
  right: 'right-0 top-0 h-full animate-slide-in-right',
  top: 'top-0 left-0 w-full animate-slide-in-top',
  bottom: 'bottom-0 left-0 w-full animate-slide-in-bottom',
};

const sizeStyles = {
  left: 'w-80',
  right: 'w-80',
  top: 'h-64',
  bottom: 'h-64',
};

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      isOpen,
      onClose,
      title,
      position = 'left',
      showCloseButton = true,
      closeOnBackdropClick = true,
      closeOnEsc = true,
      children,
      footer,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    const drawerRef = useRef<HTMLDivElement>(null);
    const [drawerId] = React.useState<string>(() => `drawer-${Math.random().toString(36).substr(2, 9)}`);

    // Handle ESC key
    useEffect(() => {
      if (!isOpen || !closeOnEsc) return undefined;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeOnEsc, onClose]);

    // Prevent body scroll when drawer is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = 'unset';
        };
      }
      return undefined;
    }, [isOpen]);

    // Focus management
    useEffect(() => {
      if (isOpen && drawerRef.current) {
        drawerRef.current.focus();
      }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnBackdropClick && e.target === e.currentTarget) {
        onClose();
      }
    };

    const baseStyles = 'fixed inset-0 z-50 flex';
    const backdropStyles = 'fixed inset-0 bg-black/50 transition-opacity';
    const drawerBaseStyles = 'relative bg-gray-800 shadow-xl transition-all flex flex-col';
    const drawerPositionStyles = positionStyles[position];
    const drawerSizeStyles = sizeStyles[position];
    const drawerClassName = `${drawerBaseStyles} ${drawerPositionStyles} ${drawerSizeStyles} ${className || ''}`.trim();

    return (
      <div
        className={baseStyles}
        onClick={handleBackdropClick}
        data-testid={testId ? `${testId}-backdrop` : undefined}
      >
        {/* Backdrop */}
        <div className={backdropStyles} />

        {/* Drawer Content */}
        <div
          ref={ref || drawerRef}
          className={drawerClassName}
          style={style}
          data-testid={testId}
          aria-label={ariaLabel || title}
          aria-describedby={ariaDescribedBy || (title ? `${drawerId}-title` : undefined)}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            {title && (
              <h2
                id={`${drawerId}-title`}
                className="text-xl font-semibold text-white"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-auto flex-shrink-0 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 rounded"
                aria-label="Close drawer"
              >
                <Icon name="x" size="md" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 text-gray-100">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  },
);

Drawer.displayName = 'Drawer';
