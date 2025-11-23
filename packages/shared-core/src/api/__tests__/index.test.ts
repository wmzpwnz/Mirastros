/**
 * Unit tests for API client
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MirastrosAPI } from '../index';

// Mock fetch
global.fetch = vi.fn();

describe('MirastrosAPI', () => {
  let api: MirastrosAPI;

  beforeEach(() => {
    api = new MirastrosAPI({
      baseURL: 'http://localhost:8000',
      token: 'test-token',
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with config', () => {
      expect(api).toBeInstanceOf(MirastrosAPI);
    });

    it('should set token', () => {
      api.setToken('new-token');
      // Token is private, but we can test it through requests
      expect(api).toBeInstanceOf(MirastrosAPI);
    });
  });

  describe('request method', () => {
    it('should make successful request', async () => {
      const mockResponse = { data: 'test' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.health();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/health',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          }),
        })
      );
    });

    it('should handle error response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
        json: async () => ({ message: 'Resource not found' }),
      });

      await expect(api.health()).rejects.toThrow('Resource not found');
    });

    it('should handle network error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(api.health()).rejects.toThrow('Network error');
    });
  });

  describe('AI endpoints', () => {
    it('should call predict endpoint', async () => {
      const mockResponse = { response: 'AI prediction' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.predict({
        query: 'What is my future?',
        context: {},
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/ai/predict',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            query: 'What is my future?',
            context: {},
          }),
        })
      );
    });

    it('should call chat endpoint', async () => {
      const mockResponse = { response: 'AI chat response' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.chat('Hello', { type: 'tarot' });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/ai/chat',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('Natal Chart endpoints', () => {
    it('should calculate natal chart', async () => {
      const mockChart = {
        id: '123',
        planets: {},
        houses: {},
        aspects: {},
      };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockChart,
      });

      const result = await api.calculateNatalChart({
        birthDate: '1990-01-01',
        birthTime: '12:00:00',
        latitude: 40.7128,
        longitude: -74.0060,
      });

      expect(result).toEqual(mockChart);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/natal/calculate',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should get natal chart', async () => {
      const mockChart = { id: '123' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockChart,
      });

      const result = await api.getNatalChart('user-123');

      expect(result).toEqual(mockChart);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/natal/user-123',
        expect.any(Object)
      );
    });
  });

  describe('Tarot endpoints', () => {
    it('should get tarot reading', async () => {
      const mockReading = {
        id: '123',
        cards: [],
        interpretation: 'Your reading...',
      };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockReading,
      });

      const result = await api.getTarotReading('three-card', 'What is my future?');

      expect(result).toEqual(mockReading);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/tarot/reading',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should get tarot history', async () => {
      const mockHistory = [{ id: '123' }, { id: '456' }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHistory,
      });

      const result = await api.getTarotHistory();

      expect(result).toEqual(mockHistory);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/tarot/history',
        expect.any(Object)
      );
    });
  });

  describe('Horoscope endpoints', () => {
    it('should get daily horoscope', async () => {
      const mockHoroscope = {
        sign: 'aries',
        prediction: 'Today is a great day...',
      };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHoroscope,
      });

      const result = await api.getDailyHoroscope('aries');

      expect(result).toEqual(mockHoroscope);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/horoscope/daily/aries',
        expect.any(Object)
      );
    });

    it('should get weekly horoscope', async () => {
      const mockHoroscope = { sign: 'aries' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHoroscope,
      });

      const result = await api.getWeeklyHoroscope('aries');

      expect(result).toEqual(mockHoroscope);
    });

    it('should get monthly horoscope', async () => {
      const mockHoroscope = { sign: 'aries' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHoroscope,
      });

      const result = await api.getMonthlyHoroscope('aries');

      expect(result).toEqual(mockHoroscope);
    });
  });

  describe('Document endpoints', () => {
    it('should upload document', async () => {
      const mockDocument = { id: '123', title: 'Test Doc' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDocument,
      });

      const result = await api.uploadDocument({
        title: 'Test Doc',
        content: 'Content',
        category: 'astrology',
      });

      expect(result).toEqual(mockDocument);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/documents/upload',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should get documents', async () => {
      const mockDocuments = [{ id: '123' }, { id: '456' }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDocuments,
      });

      const result = await api.getDocuments();

      expect(result).toEqual(mockDocuments);
    });

    it('should delete document', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await api.deleteDocument('123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/documents/123',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('Health check', () => {
    it('should check health', async () => {
      const mockHealth = { status: 'healthy' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHealth,
      });

      const result = await api.health();

      expect(result).toEqual(mockHealth);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/health',
        expect.any(Object)
      );
    });
  });
});
