'use client';

/**
 * Toast Component
 * A notification component that displays temporary messages with auto-dismiss
 */

import React, { useEffect, useState, forwardRef } from 'react';
import type { ToastProps } from '../types';
import { Icon } from './Icon';

const typeStyles = {
  success: 'bg-green-900 border-green-700 text-green-100',
  error: 'bg-red-900 border-red-700 text-red-100',
  warning: 'bg-yellow-900 border-yellow-700 text-yellow-100',
  info: 'bg-blue-900 border-blue-700 text-blue-100',
};

const typeIcons = {
  success: 'check',
  error: 'x',
  warning: 'alert',
  info: 'info',
};

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      type = 'info',
      message,
      autoDismiss = true,
      duration = 5000,
      onClose,
      actionText,
      onAction,
      icon,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
      if (!autoDismiss || !isVisible) return;

      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }, [autoDismiss, duration, isVisible, onClose]);

    if (!isVisible) return null;

    const baseStyles = 'flex items-center gap-3 p-4 rounded border transition-opacity';
    const combinedClassName = `${baseStyles} ${typeStyles[type]} ${className || ''}`.trim();

    return (
      <div
        ref={ref}
        className={combinedClassName}
        style={style}
        data-testid={testId}
        aria-label={ariaLabel || message}
        aria-describedby={ariaDescribedBy}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
      >
        {icon || <Icon name={typeIcons[type]} size="md" />}
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {actionText && (
          <button
            onClick={() => {
              onAction?.();
              setIsVisible(false);
              onClose?.();
            }}
            className="text-sm font-semibold hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            {actionText}
          </button>
        )}
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="flex-shrink-0 hover:opacity-80 transition-opacity"
          aria-label="Close notification"
        >
          <Icon name="x" size="sm" />
        </button>
      </div>
    );
  },
);

Toast.displayName = 'Toast';

/**
 * Toast Container Component
 * Manages multiple toasts with stacking
 */

export const ToastContainer = forwardRef<
  HTMLDivElement,
  {
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    className?: string;
    style?: React.CSSProperties;
  }
>(({ position = 'bottom-right', className, style }, ref) => {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  };

  const baseStyles = 'fixed flex flex-col gap-2 pointer-events-none z-50';
  const combinedClassName = `${baseStyles} ${positionClasses[position]} ${className || ''}`.trim();

  return (
    <div
      ref={ref}
      className={combinedClassName}
      style={style}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    />
  );
});

ToastContainer.displayName = 'ToastContainer';
