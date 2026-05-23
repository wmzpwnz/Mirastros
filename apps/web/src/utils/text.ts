/**
 * Text Utilities
 * Helper functions for text processing and sanitization
 */

/**
 * Sanitize plain text by removing markdown formatting
 * Used to clean AI-generated text responses
 */
export const sanitizePlain = (value: string): string => {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/[*_~#[\]()]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
};
