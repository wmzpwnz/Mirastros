/**
 * DatePicker Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export interface DatePickerProps extends BaseComponentProps {
  /**
   * Selected date
   */
  value?: Date;

  /**
   * Change handler
   */
  onChange?: (date: Date) => void;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Whether date range selection is enabled
   * @default false
   */
  range?: boolean;

  /**
   * Start date (for range selection)
   */
  startDate?: Date;

  /**
   * End date (for range selection)
   */
  endDate?: Date;

  /**
   * Minimum selectable date
   */
  minDate?: Date;

  /**
   * Maximum selectable date
   */
  maxDate?: Date;

  /**
   * Whether the picker is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Date format string
   * @default 'MM/DD/YYYY'
   */
  format?: string;

  /**
   * DatePicker name attribute
   */
  name?: string;

  /**
   * DatePicker id attribute
   */
  id?: string;
}
