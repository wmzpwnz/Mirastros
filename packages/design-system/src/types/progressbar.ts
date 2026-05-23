/**
 * ProgressBar Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export type ProgressBarVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface ProgressBarProps extends BaseComponentProps {
  /**
   * Progress percentage (0-100)
   */
  value: number;

  /**
   * Visual variant
   * @default 'default'
   */
  variant?: ProgressBarVariant;

  /**
   * Whether to show percentage label
   * @default false
   */
  showLabel?: boolean;

  /**
   * Whether to animate progress
   * @default true
   */
  animated?: boolean;

  /**
   * Progress bar height
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Minimum value
   * @default 0
   */
  min?: number;

  /**
   * Maximum value
   * @default 100
   */
  max?: number;

  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;
}
