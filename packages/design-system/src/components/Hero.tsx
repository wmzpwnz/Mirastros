/**
 * Hero Component
 * A large banner component with background image, text overlay, and CTA button
 */

import React, { forwardRef } from 'react';
import type { HeroProps } from '../types/hero';

const heightStyles = {
  sm: 'min-h-64',
  md: 'min-h-96',
  lg: 'min-h-screen',
  xl: 'min-h-screen',
};

const textAlignStyles = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export const Hero = forwardRef<HTMLDivElement, HeroProps>(
  (
    {
      backgroundImage,
      backgroundColor = '#050505',
      title,
      subtitle,
      ctaText,
      onCtaClick,
      children,
      height = 'md',
      textAlign = 'center',
      overlayOpacity = 40,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    const baseStyles = 'relative w-full flex items-center justify-center overflow-hidden';
    const heightClass = heightStyles[height];
    const textAlignClass = textAlignStyles[textAlign];

    const combinedClassName = `${baseStyles} ${heightClass} ${className || ''}`.trim();

    const backgroundStyle = {
      backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
      backgroundColor,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      ...style,
    };

    return (
      <div
        ref={ref}
        className={combinedClassName}
        style={backgroundStyle}
        data-testid={testId}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-cosmic"
          style={{ opacity: overlayOpacity / 100 }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className={`relative z-10 max-w-4xl mx-auto px-6 ${textAlignClass}`}>
          {children ? (
            children
          ) : (
            <>
              {/* Title */}
              <h1 className="text-5xl md:text-6xl font-bold text-gray-100 mb-4 font-heading">
                {title}
              </h1>

              {/* Subtitle */}
              {subtitle && (
                <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  {subtitle}
                </p>
              )}

              {/* CTA Button */}
              {ctaText && (
                <button
                  onClick={onCtaClick}
                  className="px-8 py-3 bg-gold-500 text-cosmic rounded font-semibold hover:bg-gold-600 active:bg-gold-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-cosmic text-lg"
                  aria-label={ctaText}
                >
                  {ctaText}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  },
);

Hero.displayName = 'Hero';
