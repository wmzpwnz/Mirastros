/**
 * Grid Component
 * A 12-column responsive grid layout system
 */

import React, { forwardRef } from 'react';
import type { GridProps } from '../types/grid';

const columnStyles = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
};

const responsiveColumnStyles = {
  mobile: {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    6: 'sm:grid-cols-6',
    12: 'sm:grid-cols-12',
  },
  tablet: {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    6: 'md:grid-cols-6',
    12: 'md:grid-cols-12',
  },
  desktop: {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    6: 'lg:grid-cols-6',
    12: 'lg:grid-cols-12',
  },
  wide: {
    1: 'xl:grid-cols-1',
    2: 'xl:grid-cols-2',
    3: 'xl:grid-cols-3',
    4: 'xl:grid-cols-4',
    6: 'xl:grid-cols-6',
    12: 'xl:grid-cols-12',
  },
  ultrawide: {
    1: '2xl:grid-cols-1',
    2: '2xl:grid-cols-2',
    3: '2xl:grid-cols-3',
    4: '2xl:grid-cols-4',
    6: '2xl:grid-cols-6',
    12: '2xl:grid-cols-12',
  },
};

const gapStyles = {
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  6: 'gap-6',
  8: 'gap-8',
  12: 'gap-12',
  xs: 'gap-2',
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-12',
};

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  (
    {
      columns = 12,
      responsiveColumns,
      gap = 'md',
      children,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    const baseStyles = 'grid w-full';
    const normalizedColumns = typeof columns === 'object' ? 12 : columns;
    const normalizedResponsiveColumns = responsiveColumns || (typeof columns === 'object' ? columns : undefined);
    const columnClass = columnStyles[normalizedColumns];
    const gapClass = gapStyles[gap];

    let responsiveClasses = '';
    if (normalizedResponsiveColumns) {
      if (normalizedResponsiveColumns.mobile) {
        responsiveClasses += ` ${responsiveColumnStyles.mobile[normalizedResponsiveColumns.mobile]}`;
      }
      if (normalizedResponsiveColumns.tablet) {
        responsiveClasses += ` ${responsiveColumnStyles.tablet[normalizedResponsiveColumns.tablet]}`;
      }
      if (normalizedResponsiveColumns.desktop) {
        responsiveClasses += ` ${responsiveColumnStyles.desktop[normalizedResponsiveColumns.desktop]}`;
      }
      if (normalizedResponsiveColumns.wide) {
        responsiveClasses += ` ${responsiveColumnStyles.wide[normalizedResponsiveColumns.wide]}`;
      }
      if (normalizedResponsiveColumns.ultrawide) {
        responsiveClasses += ` ${responsiveColumnStyles.ultrawide[normalizedResponsiveColumns.ultrawide]}`;
      }
    }

    const combinedClassName = `${baseStyles} ${columnClass} ${gapClass} ${responsiveClasses} ${className || ''}`.trim();

    return (
      <div
        ref={ref}
        className={combinedClassName}
        style={style}
        data-testid={testId}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      >
        {children}
      </div>
    );
  },
);

Grid.displayName = 'Grid';
