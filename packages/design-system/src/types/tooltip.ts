/**
 * Tooltip Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps extends BaseComponentProps {
  /**
   * Tooltip content
   */
  content: string | React.ReactNode;

  /**
   * Position of the tooltip
   * @default 'top'
   */
  position?: TooltipPosition;

  /**
   * Trigger event
   * @default 'hover'
   */
  trigger?: 'hover' | 'click' | 'focus';

  /**
   * Whether the tooltip is visible
   */
  isVisible?: boolean;

  /**
   * Delay before showing tooltip (ms)
   * @default 0
   */
  delay?: number;

  /**
   * Element that triggers the tooltip
   */
  children: React.ReactNode;

  /**
   * Maximum width of the tooltip
   */
  maxWidth?: string | number;
}
