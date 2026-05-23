/**
 * ServiceCard Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export interface ServiceCardProps extends BaseComponentProps {
  /**
   * Icon element or component
   */
  icon: React.ReactNode;

  /**
   * Card title
   */
  title: string;

  /**
   * Card description
   */
  description: string;

  /**
   * Click handler
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;

  /**
   * Optional badge or tag
   */
  badge?: string;

  /**
   * Optional CTA button text
   */
  ctaText?: string;

  /**
   * Optional CTA button click handler
   */
  onCtaClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
