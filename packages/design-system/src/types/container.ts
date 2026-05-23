/**
 * Container Component Props
 */

import type { BaseComponentProps } from './base';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface ContainerProps extends BaseComponentProps {
  /**
   * Maximum width of the container
   * @default 'lg'
   */
  size?: ContainerSize;

  /**
   * Padding around the container
   * @default true
   */
  padded?: boolean;

  /**
   * Custom padding value (overrides padded prop)
   */
  padding?: string | number;

  /**
   * Center the container horizontally
   * @default true
   */
  centered?: boolean;

  /**
   * Child elements
   */
  children: React.ReactNode;
}
