/**
 * Unit tests for validation schemas
 */

import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  userRegisterSchema,
  birthDataSchema,
  tarotReadingRequestSchema,
  zodiacSignSchema,
  validateSchema,
  sanitizeString,
  containsSQLInjection,
  containsXSS,
} from '../schemas';

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should validate correct email', () => {
      const result = emailSchema.safeParse('test@example.com');
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = emailSchema.safeParse('invalid-email');
      expect(result.success).toBe(false);
    });

    it('should reject email without domain', () => {
      const result = emailSchema.safeParse('test@');
      expect(result.success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('should validate strong password', () => {
      const result = passwordSchema.safeParse('Test123!@#');
      expect(result.success).toBe(true);
    });

    it('should reject short password', () => {
      const result = passwordSchema.safeParse('Test1');
      expect(result.success).toBe(false);
    });

    it('should reject password without uppercase', () => {
      const result = passwordSchema.safeParse('test123!@#');
      expect(result.success).toBe(false);
    });

    it('should reject password without lowercase', () => {
      const result = passwordSchema.safeParse('TEST123!@#');
      expect(result.success).toBe(false);
    });

    it('should reject password without digit', () => {
      const result = passwordSchema.safeParse('TestTest!@#');
      expect(result.success).toBe(false);
    });
  });

  describe('userRegisterSchema', () => {
    it('should validate correct registration data', () => {
      const result = userRegisterSchema.safeParse({
        email: 'test@example.com',
        password: 'Test123!@#',
        full_name: 'Test User',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing fields', () => {
      const result = userRegisterSchema.safeParse({
        email: 'test@example.com',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('birthDataSchema', () => {
    it('should validate correct birth data', () => {
      const result = birthDataSchema.safeParse({
        name: 'Test User',
        birth_date: '1990-01-01',
        birth_time: '12:00:00',
        latitude: 40.7128,
        longitude: -74.0060,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const result = birthDataSchema.safeParse({
        name: 'Test User',
        birth_date: '01/01/1990',
        birth_time: '12:00:00',
        latitude: 40.7128,
        longitude: -74.0060,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid time format', () => {
      const result = birthDataSchema.safeParse({
        name: 'Test User',
        birth_date: '1990-01-01',
        birth_time: '12:00 PM',
        latitude: 40.7128,
        longitude: -74.0060,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid latitude', () => {
      const result = birthDataSchema.safeParse({
        name: 'Test User',
        birth_date: '1990-01-01',
        birth_time: '12:00:00',
        latitude: 100,
        longitude: -74.0060,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid longitude', () => {
      const result = birthDataSchema.safeParse({
        name: 'Test User',
        birth_date: '1990-01-01',
        birth_time: '12:00:00',
        latitude: 40.7128,
        longitude: 200,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('tarotReadingRequestSchema', () => {
    it('should validate correct tarot request', () => {
      const result = tarotReadingRequestSchema.safeParse({
        spread_type: 'three-card',
        question: 'What does my future hold?',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid spread type', () => {
      const result = tarotReadingRequestSchema.safeParse({
        spread_type: 'invalid-spread',
        question: 'What does my future hold?',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty question', () => {
      const result = tarotReadingRequestSchema.safeParse({
        spread_type: 'three-card',
        question: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('zodiacSignSchema', () => {
    it('should validate all zodiac signs', () => {
      const signs = [
        'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
        'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
      ];

      signs.forEach(sign => {
        const result = zodiacSignSchema.safeParse(sign);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid zodiac sign', () => {
      const result = zodiacSignSchema.safeParse('invalid-sign');
      expect(result.success).toBe(false);
    });
  });

  describe('validateSchema helper', () => {
    it('should return success for valid data', () => {
      const result = validateSchema(emailSchema, 'test@example.com');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test@example.com');
      }
    });

    it('should return errors for invalid data', () => {
      const result = validateSchema(emailSchema, 'invalid-email');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('sanitizeString', () => {
    it('should remove null bytes', () => {
      const result = sanitizeString('test\0string');
      expect(result).toBe('teststring');
    });

    it('should remove control characters', () => {
      const result = sanitizeString('test\x01\x02string');
      expect(result).toBe('teststring');
    });

    it('should truncate to max length', () => {
      const longString = 'a'.repeat(2000);
      const result = sanitizeString(longString, 100);
      expect(result.length).toBe(100);
    });

    it('should trim whitespace', () => {
      const result = sanitizeString('  test string  ');
      expect(result).toBe('test string');
    });
  });

  describe('containsSQLInjection', () => {
    it('should detect UNION SELECT', () => {
      expect(containsSQLInjection('UNION SELECT * FROM users')).toBe(true);
    });

    it('should detect DROP TABLE', () => {
      expect(containsSQLInjection('DROP TABLE users')).toBe(true);
    });

    it('should detect SQL comments', () => {
      expect(containsSQLInjection('test -- comment')).toBe(true);
      expect(containsSQLInjection('test /* comment */')).toBe(true);
    });

    it('should not flag normal text', () => {
      expect(containsSQLInjection('This is a normal question')).toBe(false);
    });
  });

  describe('containsXSS', () => {
    it('should detect script tags', () => {
      expect(containsXSS('<script>alert("xss")</script>')).toBe(true);
    });

    it('should detect javascript: protocol', () => {
      expect(containsXSS('javascript:alert("xss")')).toBe(true);
    });

    it('should detect event handlers', () => {
      expect(containsXSS('<img onerror="alert(1)">')).toBe(true);
    });

    it('should detect iframe tags', () => {
      expect(containsXSS('<iframe src="evil.com"></iframe>')).toBe(true);
    });

    it('should not flag normal text', () => {
      expect(containsXSS('This is a normal question')).toBe(false);
    });
  });
});
