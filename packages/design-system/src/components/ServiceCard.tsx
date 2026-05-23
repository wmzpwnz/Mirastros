/**
 * ServiceCard Component
 * A card component designed for showcasing services with icon, title, and description
 */

import React, { forwardRef } from 'react';
import type { ServiceCardProps } from '../types/servicecard';

export const ServiceCard = forwardRef<HTMLDivElement, ServiceCardProps>(
  (
    {
      icon,
      title,
      description,
      badge,
      ctaText,
      onClick,
      onCtaClick,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    const baseStyles = 'bg-gray-800 border border-gray-700 rounded-lg p-6 transition-all hover:border-gold-500 hover:shadow-lg cursor-pointer';

    const combinedClassName = `${baseStyles} ${className || ''}`.trim();

    const handleCtaClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onCtaClick?.(e);
    };

    return (
      <div
        ref={ref}
        className={combinedClassName}
        style={style}
        onClick={onClick}
        data-testid={testId}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        role="button"
        tabIndex={0}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
          }
        }}
      >
        {/* Icon */}
        <div className="mb-4 text-gold-500 text-4xl flex items-center justify-center w-12 h-12 bg-gray-700 rounded-lg">
          {icon}
        </div>

        {/* Badge */}
        {badge && (
          <div className="mb-3 inline-block px-3 py-1 bg-gold-500 text-cosmic text-xs font-semibold rounded-full">
            {badge}
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-100 mb-2">{title}</h3>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-4">{description}</p>

        {/* CTA Button */}
        {ctaText && (
          <button
            onClick={handleCtaClick}
            className="px-4 py-2 bg-gold-500 text-cosmic rounded font-semibold hover:bg-gold-600 active:bg-gold-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-cosmic"
            aria-label={`${title} - ${ctaText}`}
          >
            {ctaText}
          </button>
        )}
      </div>
    );
  },
);

ServiceCard.displayName = 'ServiceCard';
