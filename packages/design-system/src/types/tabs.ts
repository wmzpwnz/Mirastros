/**
 * Tabs Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export interface TabItem {
  label: string;
  value: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface TabsProps extends BaseComponentProps {
  /**
   * Tab items
   */
  items: TabItem[];

  /**
   * Currently active tab value
   */
  activeTab: string;

  /**
   * Change handler
   */
  onChange: (value: string) => void;

  /**
   * Tab content (keyed by tab value)
   */
  children: Record<string, React.ReactNode>;

  /**
   * Whether tabs are vertical
   * @default false
   */
  vertical?: boolean;

  /**
   * Whether tabs are disabled
   * @default false
   */
  disabled?: boolean;
}
