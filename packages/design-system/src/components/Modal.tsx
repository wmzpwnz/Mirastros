'use client';

/**
 * Modal Component
 * A dialog component with backdrop, close button, and keyboard support
 */

import React, { useEffect, useRef, forwardRef } from 'react';
import type { ModalProps } from '../types';
import { Icon } from './Icon';

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      size = 'md',
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
    const modalRef = useRef<HTMLDivElement>(null);
    const [modalId] = React.useState<string>(() => `modal-${Math.random().toString(36).substr(2, 9)}`);

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

    // Prevent body scroll when modal is open
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
      if (isOpen && modalRef.current) {
        modalRef.current.focus();
      }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnBackdropClick && e.target === e.currentTarget) {
        onClose();
      }
    };

    const baseStyles = 'fixed inset-0 z-50 flex items-center justify-center p-4';
    const backdropStyles = 'fixed inset-0 bg-black/70 transition-opacity';
    const contentBaseStyles = 'relative w-full rounded-lg shadow-2xl transition-all bg-[#1a1d24] border border-white/10';
    const contentSizeStyles = sizeStyles[size];
    const contentClassName = `${contentBaseStyles} ${contentSizeStyles} ${className || ''}`.trim();

    return (
      <div
        className={baseStyles}
        onClick={handleBackdropClick}
        data-testid={testId ? `${testId}-backdrop` : undefined}
      >
        {/* Backdrop — непрозрачный оверлей */}
        <div className={backdropStyles} style={{ backgroundColor: 'rgba(0,0,0,0.75)' }} aria-hidden />

        {/* Modal Content — непрозрачный фон панели */}
        <div
          ref={ref || modalRef}
          className={contentClassName}
          style={{ ...style, backgroundColor: style?.backgroundColor ?? '#1a1d24' }}
          data-testid={testId}
          aria-label={ariaLabel || title}
          aria-describedby={ariaDescribedBy || (title ? `${modalId}-title` : undefined)}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-[#1a1d24]">
            {title && (
              <h2
                id={`${modalId}-title`}
                className="text-xl font-semibold text-white"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-auto flex-shrink-0 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 rounded"
                aria-label="Close modal"
              >
                <Icon name="x" size="md" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-6 text-gray-100 bg-[#1a1d24]">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700 bg-[#1a1d24]">
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  },
);

Modal.displayName = 'Modal';
