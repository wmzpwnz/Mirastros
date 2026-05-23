/**
 * Drawer Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerProps extends BaseComponentProps {
  /**
   * Whether the drawer is open
   */
  isOpen: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Drawer title
   */
  title?: string;

  /**
   * Position of the drawer
   * @default 'left'
   */
  position?: DrawerPosition;

  /**
   * Whether to show close button
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * Whether clicking backdrop closes the drawer
   * @default true
   */
  closeOnBackdropClick?: boolean;

  /**
   * Whether pressing ESC closes the drawer
   * @default true
   */
  closeOnEsc?: boolean;

  /**
   * Drawer content
   */
  children: React.ReactNode;

  /**
   * Footer content (actions)
   */
  footer?: React.ReactNode;
}
