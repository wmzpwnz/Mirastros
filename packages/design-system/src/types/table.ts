/**
 * Table Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  render?: (value: any, row: any) => React.ReactNode;
}

export type SortDirection = 'asc' | 'desc';

export interface TableProps extends BaseComponentProps {
  /**
   * Table columns
   */
  columns: TableColumn[];

  /**
   * Table data rows
   */
  data: Record<string, any>[];

  /**
   * Currently sorted column key
   */
  sortBy?: string;

  /**
   * Sort direction
   */
  sortDirection?: SortDirection;

  /**
   * Sort change handler
   */
  onSort?: (key: string, direction: SortDirection) => void;

  /**
   * Whether table is striped
   * @default true
   */
  striped?: boolean;

  /**
   * Whether table has hover effect
   * @default true
   */
  hoverable?: boolean;

  /**
   * Whether pagination is enabled
   * @default false
   */
  paginated?: boolean;

  /**
   * Items per page
   * @default 10
   */
  pageSize?: number;

  /**
   * Current page
   */
  currentPage?: number;

  /**
   * Page change handler
   */
  onPageChange?: (page: number) => void;

  /**
   * Row click handler
   */
  onRowClick?: (row: Record<string, any>) => void;
}
