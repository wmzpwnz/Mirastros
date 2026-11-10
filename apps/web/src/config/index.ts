/**
 * Application Configuration
 * Centralized configuration for the web application
 */

export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000'),
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '15000', 10), // 15 seconds
  },

  // App Configuration
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Mirastros',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://mirastros.ru',
  },

  // Feature Flags
  features: {
    enable3DBackground: process.env.NEXT_PUBLIC_ENABLE_3D_BACKGROUND === 'true',
    enableZScroll: process.env.NEXT_PUBLIC_ENABLE_ZSCROLL === 'true',
    enableLandingZScrollMobile: process.env.NEXT_PUBLIC_ENABLE_LANDING_ZSCROLL_MOBILE !== 'false',
    enableZScrollMobile:
      process.env.NEXT_PUBLIC_ENABLE_ZSCROLL_MOBILE === 'true',
    zScrollDesktopMinWidth: parseInt(
      process.env.NEXT_PUBLIC_ZSCROLL_DESKTOP_MIN_WIDTH || '1024',
      10
    ),
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  },

  // Payment Gateways
  payment: {
    stripe: {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    },
    yookassa: {
      shopId: process.env.NEXT_PUBLIC_YOOKASSA_SHOP_ID || '',
    },
  },

  // Social Auth
  auth: {
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    },
    apple: {
      clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || '',
    },
  },

  // Analytics
  analytics: {
    ga: {
      measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
    },
    yandex: {
      metrikaId: process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || '',
    },
  },
} as const;

export default config;
