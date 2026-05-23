/**
 * Skeleton Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export type SkeletonShape = 'rect' | 'circle' | 'text';

export interface SkeletonProps extends BaseComponentProps {
  /**
   * Shape of the skeleton
   * @default 'rect'
   */
  shape?: SkeletonShape;

  /**
   * Width of the skeleton
   */
  width?: string | number;

  /**
   * Height of the skeleton
   */
  height?: string | number;

  /**
   * Number of lines (for text shape)
   * @default 1
   */
  lines?: number;

  /**
   * Whether to animate with pulse effect
   * @default true
   */
  animated?: boolean;

  /**
   * Border radius
   * @default 'md'
   */
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';

  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;
}
