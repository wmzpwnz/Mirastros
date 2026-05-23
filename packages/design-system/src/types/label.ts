/**
 * Label Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export interface LabelProps extends BaseComponentProps {
  /**
   * HTML for attribute to associate with form field
   */
  htmlFor?: string;

  /**
   * Whether the field is required
   * @default false
   */
  required?: boolean;

  /**
   * Whether the field has an error
   * @default false
   */
  error?: boolean;

  /**
   * Label content
   */
  children: React.ReactNode;
}
