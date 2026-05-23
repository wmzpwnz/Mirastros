/**
 * Cache Utilities
 * Helper functions for sessionStorage caching
 */

export const CACHE_PREFIX = 'mira_hero_cache_';
export const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
export const MATRIX_UPDATED_EVENT = 'mira:matrix-updated';

/**
 * Get cached data from sessionStorage
 * Returns null if cache expired or doesn't exist
 */
export const getCachedData = <T,>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const item = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!item) return null;
    const { data, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp > CACHE_DURATION) {
      sessionStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

/**
 * Set data in sessionStorage cache
 * Silently handles quota exceeded errors
 */
export const setCachedData = (key: string, data: any): void => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (e) {
    console.warn('Cache quota exceeded');
  }
};
