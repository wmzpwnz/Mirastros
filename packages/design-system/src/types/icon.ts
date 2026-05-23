/**
 * Icon Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface IconProps extends BaseComponentProps {
  /**
   * Icon name or identifier
   */
  name: string;

  /**
   * Size of the icon
   * @default 'md'
   */
  size?: IconSize;

  /**
   * Color of the icon
   */
  color?: string;

  /**
   * Whether the icon is interactive
   * @default false
   */
  interactive?: boolean;

  /**
   * Click handler for interactive icons
   */
  onClick?: (event: React.MouseEvent<SVGElement>) => void;
}
