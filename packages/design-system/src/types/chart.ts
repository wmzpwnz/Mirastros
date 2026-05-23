/**
 * Chart Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export type ChartType = 'bar' | 'line' | 'pie' | 'area';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ChartProps extends BaseComponentProps {
  /**
   * Chart type
   */
  type: ChartType;

  /**
   * Chart data
   */
  data: ChartDataPoint[];

  /**
   * Chart title
   */
  title?: string;

  /**
   * X-axis label
   */
  xAxisLabel?: string;

  /**
   * Y-axis label
   */
  yAxisLabel?: string;

  /**
   * Whether to show legend
   * @default true
   */
  showLegend?: boolean;

  /**
   * Whether to show tooltips
   * @default true
   */
  showTooltips?: boolean;

  /**
   * Chart height
   * @default 300
   */
  height?: number;

  /**
   * Chart width
   */
  width?: string | number;

  /**
   * Whether to animate chart
   * @default true
   */
  animated?: boolean;
}
