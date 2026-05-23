/**
 * Pagination Component
 * A pagination control with prev/next buttons and page numbers
 */

import React from 'react';
import type { PaginationProps } from '../types';
import { Button } from './Button';

export const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      currentPage,
      totalPages,
      onChange,
      maxButtons = 5,
      showFirstLast = true,
      disabled = false,
      labels = {},
      className,
      style,
      testId,
      ariaLabel,
    },
    ref,
  ) => {
    const {
      previous = 'Previous',
      next = 'Next',
      first = 'First',
      last = 'Last',
    } = labels;

    // Calculate which page numbers to show
    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const halfMax = Math.floor(maxButtons / 2);

      let startPage = Math.max(1, currentPage - halfMax);
      const endPage = Math.min(totalPages, startPage + maxButtons - 1);

      if (endPage - startPage + 1 < maxButtons) {
        startPage = Math.max(1, endPage - maxButtons + 1);
      }

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }

      return pages;
    };

    const pageNumbers = getPageNumbers();
    const canGoPrevious = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    const baseStyles = 'flex items-center justify-center gap-2';
    const containerClassName = `${baseStyles} ${className || ''}`.trim();

    return (
      <nav
        ref={ref}
        className={containerClassName}
        style={style}
        data-testid={testId}
        aria-label={ariaLabel || 'Pagination'}
        role="navigation"
      >
        {/* First page button */}
        {showFirstLast && (
          <Button
            variant="ghost"
            size="sm"
            disabled={!canGoPrevious || disabled}
            onClick={() => onChange(1)}
            aria-label={first}
          >
            {first}
          </Button>
        )}

        {/* Previous button */}
        <Button
          variant="ghost"
          size="sm"
          disabled={!canGoPrevious || disabled}
          onClick={() => onChange(currentPage - 1)}
          aria-label={previous}
        >
          {previous}
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onChange(pageNum)}
                disabled={disabled}
                className={`px-3 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-cosmic ${
                  isActive
                    ? 'bg-gold-500 text-cosmic font-semibold'
                    : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                aria-label={`Page ${pageNum}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <Button
          variant="ghost"
          size="sm"
          disabled={!canGoNext || disabled}
          onClick={() => onChange(currentPage + 1)}
          aria-label={next}
        >
          {next}
        </Button>

        {/* Last page button */}
        {showFirstLast && (
          <Button
            variant="ghost"
            size="sm"
            disabled={!canGoNext || disabled}
            onClick={() => onChange(totalPages)}
            aria-label={last}
          >
            {last}
          </Button>
        )}
      </nav>
    );
  },
);

Pagination.displayName = 'Pagination';
