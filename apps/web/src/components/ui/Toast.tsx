'use client';

import React, { useEffect } from 'react';
import { gsap } from 'gsap';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const toastRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toastRef.current) return;

    // Animate in
    gsap.fromTo(
      toastRef.current,
      { opacity: 0, y: -20, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }
    );

    // Auto dismiss
    const duration = toast.duration ?? 5000;
    const timer = setTimeout(() => {
      if (toastRef.current) {
        gsap.to(toastRef.current, {
          opacity: 0,
          y: -20,
          scale: 0.95,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => onClose(toast.id),
        });
      }
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, toast.duration, onClose]);

  const handleClose = () => {
    if (toastRef.current) {
      gsap.to(toastRef.current, {
        opacity: 0,
        y: -20,
        scale: 0.95,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => onClose(toast.id),
      });
    }
  };

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/50 text-green-300';
      case 'error':
        return 'bg-red-500/20 border-red-500/50 text-red-300';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      case 'info':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
      default:
        return 'bg-white/10 border-white/20 text-white';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div
      ref={toastRef}
      className={`
        ${getToastStyles()}
        backdrop-blur-md border rounded-lg p-4 shadow-lg
        min-w-[300px] max-w-[500px] mb-3
        flex items-start gap-3
        pointer-events-auto
      `}
    >
      <span className="text-xl flex-shrink-0">{getIcon()}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium break-words">{toast.message}</p>
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              handleClose();
            }}
            className="mt-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-xs font-semibold transition-colors"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={handleClose}
        className="text-white/60 hover:text-white transition-colors flex-shrink-0"
        aria-label="Закрыть"
      >
        ✕
      </button>
    </div>
  );
};
