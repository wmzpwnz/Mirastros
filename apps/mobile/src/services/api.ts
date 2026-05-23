import { StorageService, CachedReading, OfflineRequest } from './storage';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  User,
  Horoscope,
  NatalChart,
  TarotReading,
  AIResponse
} from '@mirastros-universal/shared-core';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
const AUTH_TOKEN_KEY = '@mirastros_auth_token';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fromCache?: boolean;
}

export class ApiClient {
  private static authToken: string | null = null;

  // Initialize auth token from storage
  static async initialize(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      this.authToken = token;
    } catch (error) {
      console.error('Error loading auth token:', error);
    }
  }

  // Set auth token
  static async setAuthToken(token: string | null): Promise<void> {
    this.authToken = token;
    if (token) {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }

  // Get auth token
  static getAuthToken(): string | null {
    return this.authToken;
  }

  // Make API request with offline support
  static async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    cacheConfig?: {
      type: CachedReading['type'];
      id: string;
      enableCache?: boolean;
    }
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Check network status
    const netInfo = await NetInfo.fetch();
    const isOnline = netInfo.isConnected && netInfo.isInternetReachable;

    // Try to get from cache if offline or cache is enabled
    if (cacheConfig && (!isOnline || cacheConfig.enableCache)) {
      const cached = await StorageService.getCachedReading(
        cacheConfig.type,
        cacheConfig.id
      );

      if (cached) {
        console.log(`Returning cached ${cacheConfig.type} reading`);
        return {
          success: true,
          data: cached.data as T,
          fromCache: true,
        };
      }
    }

    // If offline and no cache, queue the request
    if (!isOnline) {
      if (options.method && options.method !== 'GET') {
        const offlineRequest: OfflineRequest = {
          id: `${Date.now()}_${Math.random()}`,
          endpoint: url,
          method: options.method,
          body: options.body ? JSON.parse(options.body as string) : null,
          timestamp: Date.now(),
        };

        await StorageService.addToOfflineQueue(offlineRequest);

        return {
          success: false,
          error: 'No internet connection. Request queued for later.',
        };
      }

      return {
        success: false,
        error: 'No internet connection and no cached data available.',
      };
    }

    // Make the actual request
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Add auth token if available
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache the response if cache config is provided
      if (cacheConfig && options.method === 'GET') {
        const cachedReading: CachedReading = {
          id: cacheConfig.id,
          type: cacheConfig.type,
          data,
          timestamp: Date.now(),
        };
        await StorageService.cacheReading(cachedReading);
      }

      return {
        success: true,
        data: data as T,
        fromCache: false,
      };
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Convenience methods for common HTTP verbs
  static async get<T = any>(
    endpoint: string,
    cacheConfig?: {
      type: CachedReading['type'];
      id: string;
      enableCache?: boolean;
    }
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, cacheConfig);
  }

  static async post<T = any>(
    endpoint: string,
    body: any,
    cacheConfig?: {
      type: CachedReading['type'];
      id: string;
    }
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      cacheConfig
    );
  }

  static async put<T = any>(
    endpoint: string,
    body: any
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  static async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Service-specific API methods
export const TarotAPI = {
  async getReading(cards: string[], question?: string): Promise<ApiResponse<TarotReading>> {
    const cacheId = `${cards.join('_')}_${Date.now()}`;
    return ApiClient.post<TarotReading>(
      '/tarot/reading',
      { cards, question, spread_type: 'three-card' },
      { type: 'tarot', id: cacheId }
    );
  },

  async getHistory(): Promise<ApiResponse<TarotReading[]>> {
    return ApiClient.get<TarotReading[]>('/tarot/history');
  },
};

export const HoroscopeAPI = {
  async getDaily(sign: string): Promise<ApiResponse<Horoscope>> {
    return ApiClient.get<Horoscope>(
      `/horoscope/daily/${sign}`,
      { type: 'horoscope', id: `daily_${sign}_${new Date().toDateString()}`, enableCache: true }
    );
  },

  async getWeekly(sign: string): Promise<ApiResponse<Horoscope>> {
    return ApiClient.get<Horoscope>(
      `/horoscope/weekly/${sign}`,
      { type: 'horoscope', id: `weekly_${sign}`, enableCache: true }
    );
  },

  async getPersonalized(birthData: any): Promise<ApiResponse<Horoscope>> {
    return ApiClient.post<Horoscope>('/horoscope/personalized', birthData);
  },
};

export const NatalChartAPI = {
  async calculate(birthData: {
    birth_date: string;
    birth_time: string;
    birth_location: string;
    latitude: number;
    longitude: number;
  }): Promise<ApiResponse<NatalChart>> {
    const cacheId = `${birthData.birth_date}_${birthData.birth_time}`;
    return ApiClient.post<NatalChart>(
      '/natal/calculate',
      birthData,
      { type: 'natal', id: cacheId }
    );
  },

  async getUserChart(userId: string): Promise<ApiResponse<NatalChart>> {
    return ApiClient.get<NatalChart>(
      `/natal/${userId}`,
      { type: 'natal', id: userId, enableCache: true }
    );
  },
};

export const NumerologyAPI = {
  async calculate(data: {
    full_name: string;
    birth_date: string;
  }): Promise<ApiResponse> {
    const cacheId = `${data.full_name}_${data.birth_date}`;
    return ApiClient.post(
      '/numerology/calculate',
      data,
      { type: 'numerology', id: cacheId }
    );
  },
};

export const DreamAPI = {
  async interpret(dreamText: string): Promise<ApiResponse<AIResponse>> {
    const cacheId = `dream_${Date.now()}`;
    return ApiClient.post<AIResponse>(
      '/dreams/interpret',
      { dream_text: dreamText },
      { type: 'dream', id: cacheId }
    );
  },

  async getHistory(): Promise<ApiResponse> {
    return ApiClient.get('/dreams/history');
  },
};

export const RunesAPI = {
  async getReading(spreadType: string, question?: string): Promise<ApiResponse> {
    const cacheId = `runes_${spreadType}_${Date.now()}`;
    return ApiClient.post(
      '/runes/reading',
      { spread_type: spreadType, question },
      { type: 'runes', id: cacheId }
    );
  },
};

export const IChingAPI = {
  async consult(question: string, method: 'coin' | 'yarrow' = 'coin'): Promise<ApiResponse> {
    const cacheId = `iching_${Date.now()}`;
    return ApiClient.post(
      '/iching/consult',
      { question, method },
      { type: 'iching', id: cacheId }
    );
  },
};

// Auth API
export const AuthAPI = {
  async login(email: string, password: string): Promise<ApiResponse<{ access_token: string; user: User }>> {
    const response = await ApiClient.post<{ access_token: string; user: User }>('/auth/login', { email, password });
    if (response.success && response.data?.access_token) {
      await ApiClient.setAuthToken(response.data.access_token);
    }
    return response;
  },

  async register(data: {
    email: string;
    password: string;
    full_name: string;
  }): Promise<ApiResponse<{ access_token: string; user: User }>> {
    const response = await ApiClient.post<{ access_token: string; user: User }>('/auth/register', data);
    if (response.success && response.data?.access_token) {
      await ApiClient.setAuthToken(response.data.access_token);
    }
    return response;
  },

  async logout(): Promise<void> {
    await ApiClient.setAuthToken(null);
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return ApiClient.get<User>('/auth/me');
  },
};
