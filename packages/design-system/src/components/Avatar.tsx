'use client';

/**
 * Avatar Component
 * An avatar component for displaying user profile pictures with initials fallback
 */

import React, { forwardRef, useState } from 'react';
import type { AvatarProps } from '../types';

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const statusStyles = {
  online: 'bg-success',
  offline: 'bg-gray-500',
  pending: 'bg-warning',
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt,
      initials,
      size = 'md',
      status,
      showStatus = false,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    const [imageError, setImageError] = useState(false);

    const baseStyles = 'relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-gold-500 to-turquoise-500 flex-shrink-0 font-semibold text-cosmic';
    const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${className || ''}`.trim();

    const showImage = src && !imageError;
    const showInitials = !showImage && initials;

    return (
      <div
        ref={ref}
        className={combinedClassName}
        style={style}
        data-testid={testId}
        aria-label={ariaLabel || alt || initials}
        aria-describedby={ariaDescribedBy}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="w-full h-full rounded-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : showInitials ? (
          <span>{initials}</span>
        ) : (
          <span className="text-lg">?</span>
        )}

        {showStatus && status && (
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-cosmic ${statusStyles[status]}`}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  },
);

Avatar.displayName = 'Avatar';
