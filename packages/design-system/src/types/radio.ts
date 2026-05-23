/**
 * Radio Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export interface RadioOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface RadioProps extends BaseComponentProps {
  /**
   * Whether the radio is checked
   */
  checked?: boolean;

  /**
   * Change handler
   */
  onChange?: (checked: boolean) => void;

  /**
   * Whether the radio is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Label text
   */
  label?: string;

  /**
   * Radio name attribute
   */
  name?: string;

  /**
   * Radio id attribute
   */
  id?: string;

  /**
   * Radio value attribute
   */
  value?: string | number;
}

export interface RadioGroupProps extends BaseComponentProps {
  /**
   * Available options
   */
  options: RadioOption[];

  /**
   * Current selected value
   */
  value?: string | number;

  /**
   * Change handler
   */
  onChange?: (value: string | number) => void;

  /**
   * Whether the group is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Radio group name attribute
   */
  name?: string;
}
