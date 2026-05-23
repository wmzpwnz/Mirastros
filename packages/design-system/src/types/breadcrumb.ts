/**
 * Breadcrumb Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps extends BaseComponentProps {
  /**
   * Breadcrumb items
   */
  items: BreadcrumbItem[];

  /**
   * Index of the current/active item
   */
  currentIndex?: number;

  /**
   * Separator between items
   * @default '/'
   */
  separator?: React.ReactNode;

  /**
   * Whether breadcrumb is disabled
   * @default false
   */
  disabled?: boolean;
}
