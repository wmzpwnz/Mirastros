/**
 * Section Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export interface SectionProps extends BaseComponentProps {
  /**
   * HTML id for in-page navigation.
   */
  id?: string;

  /**
   * Section content
   */
  children: React.ReactNode;

  /**
   * Background color
   * @default 'transparent'
   */
  backgroundColor?: string;

  /**
   * Padding size
   * @default 'md'
   */
  padding?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Whether section is full-width
   * @default true
   */
  fullWidth?: boolean;

  /**
   * Optional section title
   */
  title?: string;

  /**
   * Optional section subtitle
   */
  subtitle?: string;

  /**
   * Vertical spacing (margin-top and margin-bottom)
   * @default 'md'
   */
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}
