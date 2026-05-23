/**
 * Textarea Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export interface TextareaProps extends BaseComponentProps {
  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Current textarea value
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
   * Whether the textarea is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the textarea is required
   * @default false
   */
  required?: boolean;

  /**
   * Number of rows
   * @default 4
   */
  rows?: number;

  /**
   * Whether to auto-resize based on content
   * @default false
   */
  autoResize?: boolean;

  /**
   * Maximum character count
   */
  maxLength?: number;

  /**
   * Whether to show character count
   * @default false
   */
  showCharCount?: boolean;

  /**
   * Textarea name attribute
   */
  name?: string;

  /**
   * Textarea id attribute
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
