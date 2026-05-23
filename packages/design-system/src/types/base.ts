/**
 * Base Component Props
 * Common props shared across all components
 */

import type React from 'react';

export interface BaseComponentProps {
  /**
   * Additional CSS classes to apply to the component
   */
  className?: string;

  /**
   * Inline styles to apply to the component
   */
  style?: React.CSSProperties;

  /**
   * Test ID for testing purposes
   */
  testId?: string;

  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;

  /**
   * ARIA described by for accessibility
   */
  ariaDescribedBy?: string;
}
