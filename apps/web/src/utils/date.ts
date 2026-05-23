/**
 * Date Utilities
 * Helper functions for date formatting and manipulation
 */

/**
 * Normalize birth date by extracting date part from ISO string
 */
export const normalizeBirthDate = (value?: string | null): string => {
  return (value || '').split('T')[0];
};

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export const formatIsoDate = (d: Date): string => {
  return d.toISOString().slice(0, 10);
};

/**
 * Get ISO date string for the start of the week (Monday)
 */
export const weekStartIso = (d: Date): string => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() - ((copy.getDay() + 6) % 7));
  return formatIsoDate(copy);
};

/**
 * Get ISO month string (YYYY-MM)
 */
export const monthIso = (d: Date): string => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
