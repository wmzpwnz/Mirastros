/**
 * Checkbox Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export interface CheckboxProps extends BaseComponentProps {
  /**
   * Whether the checkbox is checked
   */
  checked?: boolean;

  /**
   * Change handler
   */
  onChange?: (checked: boolean) => void;

  /**
   * Whether the checkbox is indeterminate
   * @default false
   */
  indeterminate?: boolean;

  /**
   * Whether the checkbox is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Label text
   */
  label?: string;

  /**
   * Checkbox name attribute
   */
  name?: string;

  /**
   * Checkbox id attribute
   */
  id?: string;

  /**
   * Checkbox value attribute
   */
  value?: string;
}
