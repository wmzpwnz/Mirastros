/**
 * Hero Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export interface HeroProps extends BaseComponentProps {
  /**
   * Background image URL
   */
  backgroundImage?: string;

  /**
   * Background color fallback
   */
  backgroundColor?: string;

  /**
   * Hero title
   */
  title: string;

  /**
   * Hero subtitle or description
   */
  subtitle?: string;

  /**
   * CTA button text
   */
  ctaText?: string;

  /**
   * CTA button click handler
   */
  onCtaClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Hero content (children override default layout)
   */
  children?: React.ReactNode;

  /**
   * Hero height
   * @default 'md'
   */
  height?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Text alignment
   * @default 'center'
   */
  textAlign?: 'left' | 'center' | 'right';

  /**
   * Overlay opacity (0-100)
   * @default 40
   */
  overlayOpacity?: number;
}
