/**
 * Performance optimization utilities
 */

import React from 'react';

/**
 * Lazy load a component with loading fallback
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = React.lazy(importFunc);
  
  return (props: React.ComponentProps<T>) =>
    React.createElement(
      React.Suspense,
      { fallback: fallback || React.createElement('div', null, 'Loading...') },
      React.createElement(LazyComponent, props),
    );
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [ref, options]);
  
  return isIntersecting;
}

/**
 * Preload image
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Preload multiple images
 */
export async function preloadImages(srcs: string[]): Promise<void> {
  await Promise.all(srcs.map(preloadImage));
}

/**
 * Get optimized image URL (for CDN)
 */
export function getOptimizedImageUrl(
  src: string,
  width?: number,
  quality: number = 75
): string {
  // If using a CDN, add query parameters for optimization
  // For now, return the original URL
  // In production, you would integrate with your CDN
  const url = new URL(src, window.location.origin);
  
  if (width) {
    url.searchParams.set('w', width.toString());
  }
  url.searchParams.set('q', quality.toString());
  
  return url.toString();
}

/**
 * Measure performance
 */
export function measurePerformance(name: string, fn: () => void): number {
  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;
  
  console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  
  return duration;
}

/**
 * Async measure performance
 */
export async function measurePerformanceAsync(
  name: string,
  fn: () => Promise<void>
): Promise<number> {
  const start = performance.now();
  await fn();
  const end = performance.now();
  const duration = end - start;
  
  console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  
  return duration;
}

/**
 * Request idle callback wrapper
 */
export function requestIdleCallback(callback: () => void, timeout: number = 2000): void {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 1);
  }
}

/**
 * Memoize function results
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

/**
 * Check if device is low-end
 */
export function isLowEndDevice(): boolean {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Check for save-data header
  const saveData = 'connection' in navigator && (navigator as any).connection?.saveData;
  
  // Check device memory (if available)
  const lowMemory = 'deviceMemory' in navigator && (navigator as any).deviceMemory < 4;
  
  // Check hardware concurrency
  const lowCPU = navigator.hardwareConcurrency < 4;
  
  return prefersReducedMotion || saveData || lowMemory || lowCPU;
}

/**
 * Get connection speed
 */
export function getConnectionSpeed(): 'slow' | 'medium' | 'fast' {
  if (!('connection' in navigator)) {
    return 'medium';
  }
  
  const connection = (navigator as any).connection;
  const effectiveType = connection?.effectiveType;
  
  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    return 'slow';
  }
  
  if (effectiveType === '3g') {
    return 'medium';
  }
  
  return 'fast';
}

/**
 * Adaptive loading based on device capabilities
 */
export function shouldLoadHeavyFeatures(): boolean {
  return !isLowEndDevice() && getConnectionSpeed() !== 'slow';
}

/**
 * Web Vitals tracking
 */
export interface WebVitals {
  FCP?: number;  // First Contentful Paint
  LCP?: number;  // Largest Contentful Paint
  FID?: number;  // First Input Delay
  CLS?: number;  // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

export function trackWebVitals(callback: (vitals: WebVitals) => void): void {
  const vitals: WebVitals = {};
  
  // Track FCP
  const fcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const fcp = entries.find((entry) => entry.name === 'first-contentful-paint');
    if (fcp) {
      vitals.FCP = fcp.startTime;
      callback(vitals);
    }
  });
  fcpObserver.observe({ entryTypes: ['paint'] });
  
  // Track LCP
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    vitals.LCP = lastEntry.startTime;
    callback(vitals);
  });
  lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  
  // Track FID
  const fidObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const firstInput = entries[0];
    vitals.FID = (firstInput as any).processingStart - firstInput.startTime;
    callback(vitals);
  });
  fidObserver.observe({ entryTypes: ['first-input'] });
  
  // Track CLS
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
        vitals.CLS = clsValue;
        callback(vitals);
      }
    }
  });
  clsObserver.observe({ entryTypes: ['layout-shift'] });
  
  // Track TTFB
  const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigationEntry) {
    vitals.TTFB = navigationEntry.responseStart - navigationEntry.requestStart;
    callback(vitals);
  }
}

/**
 * Prefetch data
 */
export function prefetchData(url: string): void {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Preconnect to domain
 */
export function preconnect(url: string): void {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;
  document.head.appendChild(link);
}
