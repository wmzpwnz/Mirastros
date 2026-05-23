/**
 * Grid Component Props
 */

import type { BaseComponentProps } from './base';

export type GridColumns = 1 | 2 | 3 | 4 | 6 | 12;
export type ResponsiveGridColumns = {
  mobile?: GridColumns;
  tablet?: GridColumns;
  desktop?: GridColumns;
  wide?: GridColumns;
  ultrawide?: GridColumns;
};
export type GapSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2' | '3' | '4' | '6' | '8' | '12';

export interface GridProps extends BaseComponentProps {
  /**
   * Number of columns in the grid
   * @default 12
   */
  columns?: GridColumns | ResponsiveGridColumns;

  /**
   * Responsive columns configuration
   * Object with breakpoint keys (mobile, tablet, desktop, wide, ultrawide)
   */
  responsiveColumns?: ResponsiveGridColumns;

  /**
   * Gap between grid items
   * @default 'md'
   */
  gap?: GapSize;

  /**
   * Child elements
   */
  children: React.ReactNode;
}
