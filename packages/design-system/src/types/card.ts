/**
 * Card Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export type CardVariant = 'default' | 'elevated' | 'outlined';

export interface CardProps extends BaseComponentProps {
  /**
   * Visual variant of the card
   * @default 'default'
   */
  variant?: CardVariant;

  /**
   * Whether the card is interactive
   * @default false
   */
  interactive?: boolean;

  /**
   * Click handler for interactive cards
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;

  /**
   * Card content
   */
  children: React.ReactNode;

  /**
   * Padding size
   * @default 'md'
   */
  padding?: 'sm' | 'md' | 'lg';
}
