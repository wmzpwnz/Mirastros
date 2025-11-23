/**
 * Constants
 */

// Zodiac Signs
export const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

export type ZodiacSign = typeof ZODIAC_SIGNS[number];

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  FREEMIUM: 'freemium',
  PREMIUM: 'premium',
  PLATINUM: 'platinum',
} as const;

export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS];

// Service Types
export const SERVICE_TYPES = {
  HOROSCOPE: 'horoscope',
  TAROT: 'tarot',
  NATAL: 'natal',
  NUMEROLOGY: 'numerology',
  DREAM: 'dream',
  RUNES: 'runes',
  ICHING: 'iching',
  LENORMAND: 'lenormand',
} as const;

export type ServiceType = typeof SERVICE_TYPES[keyof typeof SERVICE_TYPES];

// Tarot Spreads
export const TAROT_SPREADS = {
  ONE_CARD: 'one-card',
  THREE_CARD: 'three-card',
  FIVE_CARD: 'five-card',
  CELTIC_CROSS: 'celtic-cross',
} as const;

export type TarotSpread = typeof TAROT_SPREADS[keyof typeof TAROT_SPREADS];

// API Endpoints
export const API_ENDPOINTS = {
  AI_PREDICT: '/ai/predict',
  AI_CHAT: '/ai/chat',
  NATAL_CALCULATE: '/natal/calculate',
  NATAL_GET: '/natal',
  TAROT_READING: '/tarot/reading',
  TAROT_HISTORY: '/tarot/history',
  HOROSCOPE_DAILY: '/horoscope/daily',
  HOROSCOPE_WEEKLY: '/horoscope/weekly',
  HOROSCOPE_MONTHLY: '/horoscope/monthly',
  DOCUMENTS_UPLOAD: '/documents/upload',
  DOCUMENTS_LIST: '/documents/',
  HEALTH: '/health',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'mirastros_auth_token',
  USER_DATA: 'mirastros_user_data',
  NATAL_CHART: 'mirastros_natal_chart',
  LAST_HOROSCOPE: 'mirastros_last_horoscope',
  THEME: 'mirastros_theme',
} as const;

// Cache TTL (in seconds)
export const CACHE_TTL = {
  HOROSCOPE_DAILY: 86400, // 24 hours
  HOROSCOPE_WEEKLY: 604800, // 7 days
  HOROSCOPE_MONTHLY: 2592000, // 30 days
  GENERAL_QUERY: 3600, // 1 hour
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_REQUIRED: 'Authentication required. Please log in.',
  INVALID_INPUT: 'Invalid input. Please check your data.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'Resource not found.',
  RATE_LIMIT: 'Too many requests. Please try again later.',
} as const;
