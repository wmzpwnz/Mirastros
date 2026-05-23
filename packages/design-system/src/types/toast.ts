/**
 * Toast Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps extends BaseComponentProps {
  /**
   * Toast type/variant
   * @default 'info'
   */
  type?: ToastType;

  /**
   * Toast message
   */
  message: string;

  /**
   * Whether to auto-dismiss
   * @default true
   */
  autoDismiss?: boolean;

  /**
   * Auto-dismiss duration in milliseconds
   * @default 5000
   */
  duration?: number;

  /**
   * Close handler
   */
  onClose?: () => void;

  /**
   * Action button text
   */
  actionText?: string;

  /**
   * Action button click handler
   */
  onAction?: () => void;

  /**
   * Icon to display
   */
  icon?: React.ReactNode;
}

export interface ToastContainerProps extends BaseComponentProps {
  /**
   * Position of the toast container
   * @default 'bottom-right'
   */
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}
