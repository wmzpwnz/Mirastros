/**
 * Application Configuration
 * Centralized configuration for the admin panel
 */

export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '15000', 10), // 15 seconds
  },

  // App Configuration
  app: {
    name: 'Mirastros Admin',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  },
} as const;

export default config;
