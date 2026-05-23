/**
 * Spinner Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps extends BaseComponentProps {
  /**
   * Size of the spinner
   * @default 'md'
   */
  size?: SpinnerSize;

  /**
   * Color of the spinner
   * @default 'currentColor'
   */
  color?: string;

  /**
   * Text to display below the spinner
   */
  text?: string;

  /**
   * Whether the spinner is visible
   * @default true
   */
  isVisible?: boolean;

  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;
}
