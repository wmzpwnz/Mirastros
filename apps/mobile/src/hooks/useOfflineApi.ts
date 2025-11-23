import { useState, useCallback, useEffect } from 'react';
import { ApiResponse } from '../services/api';
import { useNetworkStatus } from './useNetworkStatus';

export interface UseOfflineApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  fromCache: boolean;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for making API calls with offline support
 * Automatically handles loading states, errors, and cached data
 */
export function useOfflineApi<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>
): UseOfflineApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const { isOffline } = useNetworkStatus();

  const execute = useCallback(
    async (...args: any[]) => {
      setLoading(true);
      setError(null);
      setFromCache(false);

      try {
        const response = await apiFunction(...args);

        if (response.success && response.data) {
          setData(response.data);
          setFromCache(response.fromCache || false);
          setError(null);
        } else {
          setError(response.error || 'Unknown error occurred');
          
          // If offline and no cached data, show helpful message
          if (isOffline && !response.fromCache) {
            setError('No internet connection. Please try again when online.');
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('API call error:', err);
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, isOffline]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setFromCache(false);
  }, []);

  return {
    data,
    loading,
    error,
    fromCache,
    execute,
    reset,
  };
}

/**
 * Hook for making API calls that automatically execute on mount
 */
export function useOfflineApiAutoFetch<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  args: any[] = [],
  dependencies: any[] = []
): UseOfflineApiResult<T> {
  const result = useOfflineApi<T>(apiFunction);

  // Auto-execute on mount and when dependencies change
  useEffect(() => {
    result.execute(...args);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return result;
}
