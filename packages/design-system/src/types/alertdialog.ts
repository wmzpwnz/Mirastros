/**
 * AlertDialog Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export interface AlertDialogProps extends BaseComponentProps {
  /**
   * Whether the dialog is open
   */
  isOpen: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Dialog title
   */
  title: string;

  /**
   * Dialog description/message
   */
  description?: string;

  /**
   * Primary action button text
   */
  actionText: string;

  /**
   * Primary action handler
   */
  onAction: () => void;

  /**
   * Cancel button text
   * @default 'Cancel'
   */
  cancelText?: string;

  /**
   * Whether the action is destructive (danger state)
   * @default false
   */
  isDangerous?: boolean;

  /**
   * Whether clicking backdrop closes the dialog
   * @default true
   */
  closeOnBackdropClick?: boolean;

  /**
   * Whether pressing ESC closes the dialog
   * @default true
   */
  closeOnEsc?: boolean;

  /**
   * Dialog content
   */
  children?: React.ReactNode;
}
