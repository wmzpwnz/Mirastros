'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastType } from '../components/ui/Toast';

interface ToastContextType {
  showToast: (message: string, type: ToastType, options?: { duration?: number; action?: { label: string; onClick: () => void } }) => void;
  showSuccess: (message: string, options?: { duration?: number }) => void;
  showError: (message: string, options?: { duration?: number; action?: { label: string; onClick: () => void } }) => void;
  showWarning: (message: string, options?: { duration?: number }) => void;
  showInfo: (message: string, options?: { duration?: number }) => void;
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType,
      options?: { duration?: number; action?: { label: string; onClick: () => void } }
    ) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: Toast = {
        id,
        message,
        type,
        duration: options?.duration,
        action: options?.action,
      };
      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const showSuccess = useCallback(
    (message: string, options?: { duration?: number }) => {
      showToast(message, 'success', options);
    },
    [showToast]
  );

  const showError = useCallback(
    (
      message: string,
      options?: { duration?: number; action?: { label: string; onClick: () => void } }
    ) => {
      showToast(message, 'error', options);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, options?: { duration?: number }) => {
      showToast(message, 'warning', options);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, options?: { duration?: number }) => {
      showToast(message, 'info', options);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        toasts,
        removeToast,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: string) => void }> = ({
  toasts,
  onRemove,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[9999] pointer-events-none flex flex-col items-end"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onRemove} />
      ))}
    </div>
  );
};
