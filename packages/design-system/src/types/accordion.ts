/**
 * Accordion Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface AccordionProps extends BaseComponentProps {
  /**
   * Accordion items
   */
  items: AccordionItem[];

  /**
   * Currently open item IDs
   */
  openItems?: string[];

  /**
   * Change handler
   */
  onChange?: (openItems: string[]) => void;

  /**
   * Whether only one item can be open at a time
   * @default false
   */
  exclusive?: boolean;

  /**
   * Whether accordion is disabled
   * @default false
   */
  disabled?: boolean;
}
