/**
 * Zod validation schemas for frontend
 * Provides type-safe validation for all API requests
 */
import { z } from 'zod';

// ============================================================================
// Authentication Schemas
// ============================================================================

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .max(255, 'Email must be less than 255 characters');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one digit');

export const userRegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const tokenRefreshSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
});

// ============================================================================
// Natal Chart Schemas
// ============================================================================

export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const birthDataSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  birth_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Invalid time format (HH:MM or HH:MM:SS)'),
  latitude: z.number().min(-90, 'Invalid latitude').max(90, 'Invalid latitude'),
  longitude: z.number().min(-180, 'Invalid longitude').max(180, 'Invalid longitude'),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  house_system: z.enum(['placidus', 'koch', 'equal', 'whole_sign', 'campanus', 'regiomontanus']).optional(),
});

export const natalChartCalculateSchema = z.object({
  birth_data: birthDataSchema,
  generate_interpretation: z.boolean().optional().default(true),
});

// ============================================================================
// Tarot Schemas
// ============================================================================

export const tarotSpreadTypeSchema = z.enum(['one-card', 'three-card', 'five-card', 'celtic-cross']);

export const tarotReadingRequestSchema = z.object({
  spread_type: tarotSpreadTypeSchema,
  question: z.string().min(1, 'Question is required').max(500, 'Question is too long'),
});

// ============================================================================
// Horoscope Schemas
// ============================================================================

export const zodiacSignSchema = z.enum([
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
]);

export const horoscopePeriodSchema = z.enum(['daily', 'weekly', 'monthly']);

export const horoscopeRequestSchema = z.object({
  zodiac_sign: zodiacSignSchema,
  period: horoscopePeriodSchema.optional().default('daily'),
});

export const personalizedHoroscopeSchema = z.object({
  birth_data: birthDataSchema.optional(),
  period: horoscopePeriodSchema.optional().default('daily'),
});

// ============================================================================
// Numerology Schemas
// ============================================================================

export const numerologyCalculateSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
});

// ============================================================================
// Dream Interpretation Schemas
// ============================================================================

export const dreamInterpretationSchema = z.object({
  dream_text: z.string().min(10, 'Dream description must be at least 10 characters').max(5000, 'Dream description is too long'),
  mood: z.string().max(50).optional(),
  tags: z.array(z.string().max(50)).optional(),
});

// ============================================================================
// Runes Schemas
// ============================================================================

export const runeSpreadTypeSchema = z.enum(['one-rune', 'three-rune', 'cross']);

export const runeReadingRequestSchema = z.object({
  spread_type: runeSpreadTypeSchema,
  question: z.string().min(1, 'Question is required').max(500, 'Question is too long'),
});

// ============================================================================
// I Ching Schemas
// ============================================================================

export const ichingMethodSchema = z.enum(['coin', 'yarrow']);

export const ichingConsultSchema = z.object({
  question: z.string().min(1, 'Question is required').max(500, 'Question is too long'),
  method: ichingMethodSchema.optional().default('coin'),
});

// ============================================================================
// Lenormand Schemas
// ============================================================================

export const lenormandSpreadTypeSchema = z.enum(['three-card', 'five-card', 'nine-card']);

export const lenormandReadingRequestSchema = z.object({
  spread_type: lenormandSpreadTypeSchema,
  question: z.string().min(1, 'Question is required').max(500, 'Question is too long'),
});

// ============================================================================
// Chat Schemas
// ============================================================================

export const chatContextTypeSchema = z.enum([
  'tarot', 'horoscope', 'dream', 'natal', 'numerology', 'runes', 'iching', 'lenormand', 'general'
]);

export const chatStartSessionSchema = z.object({
  context_type: chatContextTypeSchema,
  context_data: z.record(z.any()).optional(),
});

export const chatMessageSchema = z.object({
  session_id: z.string().uuid('Invalid session ID'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message is too long'),
});

// ============================================================================
// Journal Schemas
// ============================================================================

export const journalEntryTypeSchema = z.enum(['dream', 'meditation', 'reading', 'reflection', 'other']);

export const journalEntryCreateSchema = z.object({
  entry_type: journalEntryTypeSchema,
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  content: z.string().min(1, 'Content is required').max(10000, 'Content is too long'),
  tags: z.array(z.string().max(50)).optional(),
  mood: z.string().max(50).optional(),
});

export const journalEntryUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(10000).optional(),
  tags: z.array(z.string().max(50)).optional(),
  mood: z.string().max(50).optional(),
});

// ============================================================================
// Shop Schemas
// ============================================================================

export const productCategorySchema = z.enum(['crystal', 'tarot-deck', 'book', 'ritual-item', 'other']);

export const orderItemSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity is too large'),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
  shipping_address: z.object({
    full_name: z.string().min(1).max(100),
    address_line1: z.string().min(1).max(200),
    address_line2: z.string().max(200).optional(),
    city: z.string().min(1).max(100),
    state: z.string().max(100).optional(),
    postal_code: z.string().min(1).max(20),
    country: z.string().min(1).max(100),
    phone: z.string().max(20).optional(),
  }),
});

// ============================================================================
// Subscription Schemas
// ============================================================================

export const subscriptionTierSchema = z.enum(['freemium', 'premium', 'platinum']);

export const billingPeriodSchema = z.enum(['monthly', 'annual']);

export const createSubscriptionSchema = z.object({
  tier: subscriptionTierSchema,
  billing_period: billingPeriodSchema,
  payment_method: z.enum(['stripe', 'yookassa', 'revenucat']),
});

// ============================================================================
// Pagination Schemas
// ============================================================================

export const paginationSchema = z.object({
  skip: z.number().int().min(0).optional().default(0),
  limit: z.number().int().min(1).max(100).optional().default(50),
});

// ============================================================================
// Search Schemas
// ============================================================================

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(200, 'Search query is too long'),
  ...paginationSchema.shape,
});

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate data against a schema and return typed result
 */
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map(err => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });
  
  return { success: false, errors };
}

/**
 * Sanitize string input (remove dangerous characters)
 */
export function sanitizeString(text: string, maxLength: number = 1000): string {
  if (!text) return '';
  
  // Truncate to max length
  text = text.slice(0, maxLength);
  
  // Remove null bytes
  text = text.replace(/\0/g, '');
  
  // Remove control characters except newlines and tabs
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return text.trim();
}

/**
 * Check if string contains SQL injection patterns
 */
export function containsSQLInjection(text: string): boolean {
  const patterns = [
    /\bUNION\b.*\bSELECT\b/i,
    /\bSELECT\b.*\bFROM\b/i,
    /\bINSERT\b.*\bINTO\b/i,
    /\bUPDATE\b.*\bSET\b/i,
    /\bDELETE\b.*\bFROM\b/i,
    /\bDROP\b.*\bTABLE\b/i,
    /(--|#|\/\*|\*\/)/,
  ];
  
  return patterns.some(pattern => pattern.test(text));
}

/**
 * Check if string contains XSS patterns
 */
export function containsXSS(text: string): boolean {
  const patterns = [
    /<script[^>]*>.*?<\/script>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];
  
  return patterns.some(pattern => pattern.test(text));
}

// Export all schemas as a namespace for convenience
export const schemas = {
  // Auth
  userRegister: userRegisterSchema,
  userLogin: userLoginSchema,
  tokenRefresh: tokenRefreshSchema,
  
  // Natal Chart
  birthData: birthDataSchema,
  natalChartCalculate: natalChartCalculateSchema,
  
  // Tarot
  tarotReadingRequest: tarotReadingRequestSchema,
  
  // Horoscope
  horoscopeRequest: horoscopeRequestSchema,
  personalizedHoroscope: personalizedHoroscopeSchema,
  
  // Numerology
  numerologyCalculate: numerologyCalculateSchema,
  
  // Dream
  dreamInterpretation: dreamInterpretationSchema,
  
  // Runes
  runeReadingRequest: runeReadingRequestSchema,
  
  // I Ching
  ichingConsult: ichingConsultSchema,
  
  // Lenormand
  lenormandReadingRequest: lenormandReadingRequestSchema,
  
  // Chat
  chatStartSession: chatStartSessionSchema,
  chatMessage: chatMessageSchema,
  
  // Journal
  journalEntryCreate: journalEntryCreateSchema,
  journalEntryUpdate: journalEntryUpdateSchema,
  
  // Shop
  createOrder: createOrderSchema,
  
  // Subscription
  createSubscription: createSubscriptionSchema,
  
  // Pagination
  pagination: paginationSchema,
  search: searchSchema,
};
