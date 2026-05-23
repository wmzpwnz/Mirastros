/**
 * Input Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time';

export interface InputProps extends BaseComponentProps {
  /**
   * Input type
   * @default 'text'
   */
  type?: InputType;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Current input value
   */
  value?: string;

  /**
   * Change handler
   */
  onChange?: (value: string) => void;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Whether the input is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the input is required
   * @default false
   */
  required?: boolean;

  /**
   * Icon to display (prefix)
   */
  icon?: React.ReactNode;

  /**
   * Icon to display (suffix)
   */
  suffixIcon?: React.ReactNode;

  /**
   * Input name attribute
   */
  name?: string;

  /**
   * Input id attribute
   */
  id?: string;

  /**
   * Blur handler
   */
  onBlur?: () => void;

  /**
   * Focus handler
   */
  onFocus?: () => void;
}
