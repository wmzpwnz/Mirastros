/**
 * Select Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps extends BaseComponentProps {
  /**
   * Available options
   */
  options: SelectOption[];

  /**
   * Current selected value
   */
  value?: string | number;

  /**
   * Change handler
   */
  onChange?: (value: string | number) => void;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Whether multiple selection is allowed
   * @default false
   */
  multiple?: boolean;

  /**
   * Whether the select is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether search is enabled
   * @default false
   */
  searchable?: boolean;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Select name attribute
   */
  name?: string;

  /**
   * Select id attribute
   */
  id?: string;
}
