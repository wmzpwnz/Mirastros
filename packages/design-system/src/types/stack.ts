/**
 * Stack Component Props
 */

import type { BaseComponentProps } from './base';

export type StackDirection = 'row' | 'column';
export type StackAlignment = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustification = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
export type GapSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2' | '3' | '4' | '6' | '8' | '12';

export interface StackProps extends BaseComponentProps {
  /**
   * Direction of the stack
   * @default 'column'
   */
  direction?: StackDirection;

  /**
   * Alignment of items along the cross axis
   * @default 'stretch'
   */
  align?: StackAlignment;

  /**
   * Justification of items along the main axis
   * @default 'start'
   */
  justify?: StackJustification;

  /**
   * Gap between items
   * @default 'md'
   */
  gap?: GapSize;

  /**
   * Whether items should wrap
   * @default false
   */
  wrap?: boolean;

  /**
   * Child elements
   */
  children: React.ReactNode;
}
