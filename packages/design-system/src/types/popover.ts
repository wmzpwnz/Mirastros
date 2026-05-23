/**
 * Popover Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right';

export interface PopoverProps extends BaseComponentProps {
  /**
   * Whether the popover is open
   */
  isOpen: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Position of the popover
   * @default 'bottom'
   */
  position?: PopoverPosition;

  /**
   * Popover title
   */
  title?: string;

  /**
   * Whether to show close button
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * Whether clicking backdrop closes the popover
   * @default true
   */
  closeOnBackdropClick?: boolean;

  /**
   * Popover content
   */
  children: React.ReactNode;

  /**
   * Element that triggers the popover
   */
  trigger: React.ReactNode;
}
