'use client';

/**
 * Table Component
 * A data table with sorting, pagination, and accessibility features
 */

import React, { useState, useMemo } from 'react';
import type { TableProps, SortDirection } from '../types';
import { Button } from './Button';
import { Icon } from './Icon';

export const Table = React.forwardRef<HTMLDivElement, TableProps>(
  (
    {
      columns,
      data,
      sortBy: initialSortBy,
      sortDirection: initialSortDirection = 'asc',
      onSort,
      striped = true,
      hoverable = true,
      paginated = false,
      pageSize = 10,
      currentPage: initialPage = 1,
      onPageChange,
      onRowClick,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    const [sortBy, setSortBy] = useState<string | undefined>(initialSortBy);
    const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);
    const [currentPage, setCurrentPage] = useState(initialPage);

    // Handle sort
    const handleSort = (key: string) => {
      const column = columns.find((col) => col.key === key);
      if (!column?.sortable) return;

      let newDirection: SortDirection = 'asc';
      if (sortBy === key && sortDirection === 'asc') {
        newDirection = 'desc';
      }

      setSortBy(key);
      setSortDirection(newDirection);
      onSort?.(key, newDirection);
    };

    // Sort data
    const sortedData = useMemo(() => {
      if (!sortBy) return data;

      const sorted = [...data].sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];

        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        return 0;
      });

      return sorted;
    }, [data, sortBy, sortDirection]);

    // Paginate data
    const paginatedData = useMemo(() => {
      if (!paginated) return sortedData;

      const startIdx = (currentPage - 1) * pageSize;
      return sortedData.slice(startIdx, startIdx + pageSize);
    }, [sortedData, paginated, currentPage, pageSize]);

    const totalPages = paginated ? Math.ceil(sortedData.length / pageSize) : 1;

    const handlePageChange = (page: number) => {
      setCurrentPage(page);
      onPageChange?.(page);
    };

    const baseStyles = 'w-full border-collapse';
    const containerClassName = `${baseStyles} ${className || ''}`.trim();

    return (
      <div
        ref={ref}
        className="overflow-x-auto"
        style={style}
        data-testid={testId}
        aria-label={ariaLabel || 'Data table'}
        aria-describedby={ariaDescribedBy}
      >
        <table className={containerClassName} role="table">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-200"
                  style={{ width: column.width }}
                  role="columnheader"
                  aria-sort={
                    sortBy === column.key
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center gap-2 hover:text-gold-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 rounded px-1"
                      aria-label={`Sort by ${column.label}`}
                    >
                      {column.label}
                      {sortBy === column.key && (
                        <Icon
                          name={sortDirection === 'asc' ? 'chevron-up' : 'chevron-down'}
                          size="sm"
                        />
                      )}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-400"
                  role="cell"
                >
                  No data available
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={`border-b border-gray-700 transition-colors ${
                    striped && rowIdx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'
                  } ${hoverable ? 'hover:bg-gray-700 cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                  role="row"
                >
                  {columns.map((column) => (
                    <td
                      key={`${rowIdx}-${column.key}`}
                      className="px-4 py-3 text-sm text-gray-300"
                      role="cell"
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {paginated && totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                      page === currentPage
                        ? 'bg-gold-500 text-cosmic font-semibold'
                        : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                    }`}
                    aria-label={`Page ${page}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  },
);

Table.displayName = 'Table';
