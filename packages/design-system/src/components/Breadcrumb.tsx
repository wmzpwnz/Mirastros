/**
 * Breadcrumb Component
 * A navigation path component with accessibility support
 */

import React from 'react';
import type { BreadcrumbProps } from '../types';

export const Breadcrumb = React.forwardRef<HTMLDivElement, BreadcrumbProps>(
  (
    {
      items,
      currentIndex,
      separator = '/',
      disabled = false,
      className,
      style,
      testId,
      ariaLabel,
    },
    ref,
  ) => {
    const baseStyles = 'flex items-center gap-2 text-sm';
    const containerClassName = `${baseStyles} ${className || ''}`.trim();

    return (
      <nav
        ref={ref}
        className={containerClassName}
        style={style}
        data-testid={testId}
        aria-label={ariaLabel || 'Breadcrumb'}
        role="navigation"
      >
        <ol className="flex items-center gap-2">
          {items.map((item, index) => {
            const isActive = currentIndex !== undefined ? index === currentIndex : index === items.length - 1;
            const isDisabledItem = item.disabled || disabled;

            const itemStyles = isActive
              ? 'text-gold-500 font-medium'
              : 'text-gray-400 hover:text-gray-200';

            const disabledStyles = isDisabledItem ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

            return (
              <li key={index} className="flex items-center gap-2">
                {index > 0 && (
                  <span className="text-gray-600" aria-hidden="true">
                    {separator}
                  </span>
                )}

                {item.href ? (
                  <a
                    href={item.href}
                    onClick={item.onClick}
                    className={`transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-cosmic rounded px-1 ${itemStyles} ${disabledStyles}`.trim()}
                    aria-current={isActive ? 'page' : undefined}
                    style={isDisabledItem ? { pointerEvents: 'none' } : undefined}
                  >
                    {item.icon && <span className="mr-1 inline-flex">{item.icon}</span>}
                    {item.label}
                  </a>
                ) : (
                  <button
                    onClick={item.onClick}
                    disabled={isDisabledItem}
                    className={`transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-cosmic rounded px-1 ${itemStyles} ${disabledStyles}`.trim()}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.icon && <span className="mr-1 inline-flex">{item.icon}</span>}
                    {item.label}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  },
);

Breadcrumb.displayName = 'Breadcrumb';
