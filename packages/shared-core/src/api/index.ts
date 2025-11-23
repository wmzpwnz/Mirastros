/**
 * API Client for Mirastros Backend
 */

import type {
  User,
  NatalChart,
  TarotReading,
  Horoscope,
  AIQuery,
  AIResponse,
  Document,
} from '../types';

export interface MirastrosAPIConfig {
  baseURL: string;
  token?: string;
}

export class MirastrosAPI {
  private baseURL: string;
  private token?: string;

  constructor(config: MirastrosAPIConfig) {
    this.baseURL = config.baseURL;
    this.token = config.token;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Unknown error',
        message: response.statusText,
      }));
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  // AI Endpoints
  async predict(query: AIQuery): Promise<AIResponse> {
    return this.request<AIResponse>('/ai/predict', {
      method: 'POST',
      body: JSON.stringify(query),
    });
  }

  async chat(message: string, context?: Record<string, any>): Promise<AIResponse> {
    return this.request<AIResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  }

  // Natal Chart Endpoints
  async calculateNatalChart(birthData: {
    birthDate: string;
    birthTime: string;
    latitude: number;
    longitude: number;
  }): Promise<NatalChart> {
    return this.request<NatalChart>('/natal/calculate', {
      method: 'POST',
      body: JSON.stringify(birthData),
    });
  }

  async getNatalChart(userId: string): Promise<NatalChart> {
    return this.request<NatalChart>(`/natal/${userId}`);
  }

  // Tarot Endpoints
  async getTarotReading(spread: string, question?: string): Promise<TarotReading> {
    return this.request<TarotReading>('/tarot/reading', {
      method: 'POST',
      body: JSON.stringify({ spread, question }),
    });
  }

  async getTarotHistory(): Promise<TarotReading[]> {
    return this.request<TarotReading[]>('/tarot/history');
  }

  // Horoscope Endpoints
  async getDailyHoroscope(sign: string): Promise<Horoscope> {
    return this.request<Horoscope>(`/horoscope/daily/${sign}`);
  }

  async getWeeklyHoroscope(sign: string): Promise<Horoscope> {
    return this.request<Horoscope>(`/horoscope/weekly/${sign}`);
  }

  async getMonthlyHoroscope(sign: string): Promise<Horoscope> {
    return this.request<Horoscope>(`/horoscope/monthly/${sign}`);
  }

  // Document Endpoints (Admin)
  async uploadDocument(document: {
    title: string;
    content: string;
    category: string;
  }): Promise<Document> {
    return this.request<Document>('/documents/upload', {
      method: 'POST',
      body: JSON.stringify(document),
    });
  }

  async getDocuments(): Promise<Document[]> {
    return this.request<Document[]>('/documents/');
  }

  async deleteDocument(id: string): Promise<void> {
    return this.request<void>(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  // Health Check
  async health(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }
}

// Export Chat API
export { ChatAPI } from './chat';
