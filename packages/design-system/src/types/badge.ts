/**
 * Badge Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends BaseComponentProps {
  /**
   * Visual variant of the badge
   * @default 'default'
   */
  variant?: BadgeVariant;

  /**
   * Size of the badge
   * @default 'md'
   */
  size?: BadgeSize;

  /**
   * Icon to display in the badge
   */
  icon?: React.ReactNode;

  /**
   * Badge content
   */
  children: React.ReactNode;
}
