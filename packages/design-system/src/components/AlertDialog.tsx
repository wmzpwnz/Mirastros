'use client';

/**
 * AlertDialog Component
 * A confirmation dialog for important actions with danger state support
 */

import React, { useEffect, useRef, forwardRef } from 'react';
import type { AlertDialogProps } from '../types';
import { Button } from './Button';
import { Icon } from './Icon';

export const AlertDialog = forwardRef<HTMLDivElement, AlertDialogProps>(
  (
    {
      isOpen,
      onClose,
      title,
      description,
      actionText,
      onAction,
      cancelText = 'Cancel',
      isDangerous = false,
      closeOnBackdropClick = true,
      closeOnEsc = true,
      children,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const [dialogId] = React.useState<string>(() => `alertdialog-${Math.random().toString(36).substr(2, 9)}`);

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

    // Prevent body scroll when dialog is open
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
      if (isOpen && dialogRef.current) {
        dialogRef.current.focus();
      }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnBackdropClick && e.target === e.currentTarget) {
        onClose();
      }
    };

    const baseStyles = 'fixed inset-0 z-50 flex items-center justify-center';
    const backdropStyles = 'fixed inset-0 bg-black/50 transition-opacity';
    const contentBaseStyles = 'relative bg-gray-800 rounded-lg shadow-xl transition-all max-w-md';
    const contentClassName = `${contentBaseStyles} ${className || ''}`.trim();

    const dangerIconColor = isDangerous ? 'text-error' : 'text-warning';

    return (
      <div
        className={baseStyles}
        onClick={handleBackdropClick}
        data-testid={testId ? `${testId}-backdrop` : undefined}
      >
        {/* Backdrop */}
        <div className={backdropStyles} />

        {/* Alert Dialog Content */}
        <div
          ref={ref || dialogRef}
          className={contentClassName}
          style={style}
          data-testid={testId}
          aria-label={ariaLabel || title}
          aria-describedby={ariaDescribedBy || (description ? `${dialogId}-description` : undefined)}
          role="alertdialog"
          aria-modal="true"
          tabIndex={-1}
        >
          {/* Icon and Title */}
          <div className="p-6 pb-4">
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 ${dangerIconColor}`}>
                <Icon name={isDangerous ? 'alert' : 'info'} size="lg" />
              </div>
              <div className="flex-1">
                <h2
                  id={`${dialogId}-title`}
                  className="text-lg font-semibold text-white"
                >
                  {title}
                </h2>
              </div>
            </div>
          </div>

          {/* Description */}
          {(description || children) && (
            <div
              id={`${dialogId}-description`}
              className="px-6 pb-6 text-gray-300"
            >
              {description || children}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
            <Button
              variant="ghost"
              size="md"
              onClick={onClose}
            >
              {cancelText}
            </Button>
            <Button
              variant={isDangerous ? 'danger' : 'primary'}
              size="md"
              onClick={() => {
                onAction();
                onClose();
              }}
            >
              {actionText}
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

AlertDialog.displayName = 'AlertDialog';
