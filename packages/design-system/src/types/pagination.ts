/**
 * Pagination Component Props
 */

import { BaseComponentProps } from './base';

export interface PaginationProps extends BaseComponentProps {
  /**
   * Current page number (1-indexed)
   */
  currentPage: number;

  /**
   * Total number of pages
   */
  totalPages: number;

  /**
   * Change handler
   */
  onChange: (page: number) => void;

  /**
   * Maximum number of page buttons to show
   * @default 5
   */
  maxButtons?: number;

  /**
   * Whether to show first/last page buttons
   * @default true
   */
  showFirstLast?: boolean;

  /**
   * Whether pagination is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Custom labels
   */
  labels?: {
    previous?: string;
    next?: string;
    first?: string;
    last?: string;
  };
}
