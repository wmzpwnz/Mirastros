/**
 * Stack Component
 * A flexible layout component for vertical and horizontal stacking
 */

import React, { forwardRef } from 'react';
import type { StackProps } from '../types/stack';

const directionStyles = {
  row: 'flex-row',
  column: 'flex-col',
};

const alignmentStyles = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const justificationStyles = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
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

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction = 'column',
      align = 'stretch',
      justify = 'start',
      gap = 'md',
      wrap = false,
      children,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    const baseStyles = 'flex w-full';
    const directionClass = directionStyles[direction];
    const alignmentClass = alignmentStyles[align];
    const justificationClass = justificationStyles[justify];
    const gapClass = gapStyles[gap];
    const wrapClass = wrap ? 'flex-wrap' : 'flex-nowrap';

    const combinedClassName = `${baseStyles} ${directionClass} ${alignmentClass} ${justificationClass} ${gapClass} ${wrapClass} ${className || ''}`.trim();

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

Stack.displayName = 'Stack';
