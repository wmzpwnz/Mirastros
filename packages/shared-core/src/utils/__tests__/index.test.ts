/**
 * Unit tests for utility functions
 */

import { describe, it, expect, vi } from 'vitest';
import {
  formatDate,
  validateEmail,
  calculateZodiacSign,
  truncate,
  debounce,
  sleep,
  generateId,
} from '../index';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('should format date in short format', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date, 'short');
      expect(formatted).toMatch(/01\/15\/2024/);
    });

    it('should format date in long format', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date, 'long');
      expect(formatted).toContain('January');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should handle string dates', () => {
      const formatted = formatDate('2024-01-15', 'short');
      expect(formatted).toMatch(/01\/15\/2024/);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test @example.com')).toBe(false);
    });
  });

  describe('calculateZodiacSign', () => {
    it('should calculate Aries', () => {
      expect(calculateZodiacSign(new Date('1990-04-15'))).toBe('Aries');
    });

    it('should calculate Taurus', () => {
      expect(calculateZodiacSign(new Date('1990-05-15'))).toBe('Taurus');
    });

    it('should calculate Gemini', () => {
      expect(calculateZodiacSign(new Date('1990-06-15'))).toBe('Gemini');
    });

    it('should calculate Cancer', () => {
      expect(calculateZodiacSign(new Date('1990-07-15'))).toBe('Cancer');
    });

    it('should calculate Leo', () => {
      expect(calculateZodiacSign(new Date('1990-08-15'))).toBe('Leo');
    });

    it('should calculate Virgo', () => {
      expect(calculateZodiacSign(new Date('1990-09-15'))).toBe('Virgo');
    });

    it('should calculate Libra', () => {
      expect(calculateZodiacSign(new Date('1990-10-15'))).toBe('Libra');
    });

    it('should calculate Scorpio', () => {
      expect(calculateZodiacSign(new Date('1990-11-15'))).toBe('Scorpio');
    });

    it('should calculate Sagittarius', () => {
      expect(calculateZodiacSign(new Date('1990-12-15'))).toBe('Sagittarius');
    });

    it('should calculate Capricorn', () => {
      expect(calculateZodiacSign(new Date('1990-01-15'))).toBe('Capricorn');
    });

    it('should calculate Aquarius', () => {
      expect(calculateZodiacSign(new Date('1990-02-15'))).toBe('Aquarius');
    });

    it('should calculate Pisces', () => {
      expect(calculateZodiacSign(new Date('1990-03-15'))).toBe('Pisces');
    });

    it('should handle string dates', () => {
      expect(calculateZodiacSign('1990-04-15')).toBe('Aries');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      const text = 'This is a very long text that needs to be truncated';
      const truncated = truncate(text, 20);
      expect(truncated).toBe('This is a very long ...');
      expect(truncated.length).toBe(23); // 20 + '...'
    });

    it('should not truncate short text', () => {
      const text = 'Short text';
      const truncated = truncate(text, 20);
      expect(truncated).toBe('Short text');
    });

    it('should handle exact length', () => {
      const text = 'Exactly twenty chars';
      const truncated = truncate(text, 20);
      expect(truncated).toBe('Exactly twenty chars');
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      await sleep(150);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments correctly', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1', 'arg2');

      await sleep(150);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('sleep', () => {
    it('should wait for specified time', async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();
      const elapsed = end - start;

      expect(elapsed).toBeGreaterThanOrEqual(90); // Allow some tolerance
      expect(elapsed).toBeLessThan(150);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
      expect(id2.length).toBeGreaterThan(0);
    });

    it('should generate alphanumeric IDs', () => {
      const id = generateId();
      expect(id).toMatch(/^[a-z0-9]+$/);
    });
  });
});
