/**
 * Modal Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps extends BaseComponentProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Modal title
   */
  title?: string;

  /**
   * Size of the modal
   * @default 'md'
   */
  size?: ModalSize;

  /**
   * Whether to show close button
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * Whether clicking backdrop closes the modal
   * @default true
   */
  closeOnBackdropClick?: boolean;

  /**
   * Whether pressing ESC closes the modal
   * @default true
   */
  closeOnEsc?: boolean;

  /**
   * Modal content
   */
  children: React.ReactNode;

  /**
   * Footer content (actions)
   */
  footer?: React.ReactNode;
}
