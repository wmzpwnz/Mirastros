/**
 * React hook for analytics tracking
 */
import { useCallback, useEffect } from 'react';
import { AnalyticsEvent, trackEvent, withAnalytics } from '../analytics';

export function useAnalytics() {
  /**
   * Track an event
   */
  const track = useCallback(
    (event: AnalyticsEvent, metadata?: Record<string, any>) => {
      trackEvent(event, metadata);
    },
    []
  );

  /**
   * Track page view on mount
   */
  const trackPageView = useCallback((pageName: string, metadata?: Record<string, any>) => {
    trackEvent(AnalyticsEvent.SERVICE_TAROT, {
      page: pageName,
      ...metadata,
    });
  }, []);

  /**
   * Track service usage with timing
   */
  const trackService = useCallback(
    async <T,>(
      service: AnalyticsEvent,
      fn: () => Promise<T>,
      metadata?: Record<string, any>
    ): Promise<T> => {
      return withAnalytics(service, fn, metadata);
    },
    []
  );

  return {
    track,
    trackPageView,
    trackService,
  };
}

/**
 * Hook to track page view on component mount
 */
export function usePageView(pageName: string, metadata?: Record<string, any>) {
  useEffect(() => {
    trackEvent(AnalyticsEvent.SERVICE_TAROT, {
      page: pageName,
      ...metadata,
    });
  }, [pageName, metadata]);
}
