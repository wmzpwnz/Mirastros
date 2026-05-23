'use client';

/**
 * Optimized Image component with lazy loading and blur placeholder
 */
import React, { useState, useRef, useEffect } from 'react';
import { useIntersectionObserver } from '@mirastros-universal/shared-core';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use intersection observer for lazy loading (unless priority)
  const isInView = useIntersectionObserver(containerRef, {
    threshold: 0.1,
    rootMargin: '50px',
  });
  
  const shouldLoad = priority || isInView;
  
  useEffect(() => {
    if (!shouldLoad || !imgRef.current) return;
    
    const img = imgRef.current;
    
    if (img.complete) {
      handleLoad();
    }
  }, [shouldLoad]);
  
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };
  
  const handleError = () => {
    setHasError(true);
    onError?.();
  };
  
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    ...(width && height ? { aspectRatio: `${width} / ${height}` } : {}),
  };
  
  const imgStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0,
  };
  
  const placeholderStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
    filter: 'blur(10px)',
    transform: 'scale(1.1)',
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 0 : 1,
  };
  
  return (
    <div ref={containerRef} style={containerStyle} className={className}>
      {/* Placeholder */}
      {placeholder === 'blur' && !isLoaded && (
        <div style={placeholderStyle}>
          {blurDataURL && (
            <img
              src={blurDataURL}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>
      )}
      
      {/* Actual image */}
      {shouldLoad && !hasError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          style={imgStyle}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
      {/* Error fallback */}
      {hasError && (
        <div
          style={{
            ...placeholderStyle,
            opacity: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#2a2a2a',
          }}
        >
          <span style={{ color: '#888' }}>Failed to load image</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
