/**
 * Admin API Service
 * Centralized API client for admin panel backend communication
 */

import config from '../config';
import type {
  User,
  AuthResponse,
  LoginCredentials,
  Product,
  Order,
  JournalEntry,
  Document,
  UserStats,
  SubscriptionStats,
  ServiceUsage,
  ModerationStats,
} from '../types';

/** Нормализация пользователя из API (snake_case) в тип User (camelCase) */
function normalizeUser(raw: Record<string, unknown>): User {
  return {
    id: String(raw.id ?? ''),
    email: String(raw.email ?? ''),
    fullName: String(raw.full_name ?? raw.fullName ?? ''),
    subscriptionTier: (String(raw.subscription_tier ?? raw.subscriptionTier ?? 'freemium').toLowerCase()) as User['subscriptionTier'],
    subscriptionExpires: raw.subscription_expires != null || raw.subscriptionExpires != null
      ? (raw.subscription_expires ?? raw.subscriptionExpires) as string
      : undefined,
    createdAt: raw.created_at != null || raw.createdAt != null
      ? new Date((raw.created_at ?? raw.createdAt) as string | number).toISOString()
      : new Date().toISOString(),
    updatedAt: raw.updated_at != null || raw.updatedAt != null
      ? new Date((raw.updated_at ?? raw.updatedAt) as string | number).toISOString()
      : new Date().toISOString(),
    lastLogin: raw.last_login != null || raw.lastLogin != null
      ? (raw.last_login ?? raw.lastLogin) as string
      : undefined,
    birthDate: (raw.birth_date ?? raw.birthDate) as string | undefined,
    birthTime: (raw.birth_time ?? raw.birthTime) as string | undefined,
    zodiacSign: (raw.zodiac_sign ?? raw.zodiacSign) as string | undefined,
    birthLocation: (raw.birth_location ?? raw.birthLocation) as any,
    googleId: (raw.google_id ?? raw.googleId) as string | undefined,
    appleId: (raw.apple_id ?? raw.appleId) as string | undefined,
    telegramId: (raw.telegram_id ?? raw.telegramId) as string | undefined,
    vkId: (raw.vk_id ?? raw.vkId) as string | undefined,
  };
}

class AdminApiClient {
  private baseUrl: string;
  private timeout: number;
  private refreshPromise: Promise<{ accessToken: string; refreshToken: string } | null> | null = null;

  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.timeout = config.api.timeout;
  }

  /**
   * Get authentication token from localStorage
   */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  /**
   * Set authentication token in localStorage
   */
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', token);
  }

  private setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('refreshToken', token);
  }

  private setUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Remove authentication token from localStorage
   */
  clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  private async refreshTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!response.ok) {
          return null;
        }

        const data = await response.json();
        const newAccess = data.access_token || data.accessToken;
        const newRefresh = data.refresh_token || data.refreshToken;
        if (!newAccess || !newRefresh) return null;

        this.setToken(newAccess);
        this.setRefreshToken(newRefresh);

        return { accessToken: newAccess, refreshToken: newRefresh };
      } catch {
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Make HTTP request with automatic token handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOnAuthFailure: boolean = true
  ): Promise<T> {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${normalizedEndpoint}`;
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.timeout);

    try {
      let response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && retryOnAuthFailure) {
        const refreshed = await this.refreshTokens();
        if (refreshed) {
          // Retry request with new token
          (headers as any)['Authorization'] = `Bearer ${refreshed.accessToken}`;
          response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
          });
        } else {
          // Refresh failed, clear tokens
          this.clearToken();
          throw new Error('Session expired. Please login again.');
        }
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Server unavailable. Check that backend is running on ' + this.baseUrl);
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  // ==================== Authentication ====================

  async login(email: string, password: string): Promise<AuthResponse> {
    // Не retry при 401: на логине 401 = неверный email/пароль, показываем сообщение бэкенда
    const response = await this.request<any>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
      false
    );

    const normalizedResponse: AuthResponse = {
      accessToken: response.access_token || response.accessToken,
      refreshToken: response.refresh_token || response.refreshToken,
      user: {
        id: response.user?.id || '',
        email: response.user?.email || '',
        fullName: response.user?.full_name || response.user?.fullName || '',
        subscriptionTier: (response.user?.subscription_tier || response.user?.subscriptionTier || 'freemium').toLowerCase() as any,
        subscriptionExpires: response.user?.subscription_expires || response.user?.subscriptionExpires,
        createdAt: response.user?.created_at || response.user?.createdAt || new Date().toISOString(),
        lastLogin: response.user?.last_login || response.user?.lastLogin,
        birthDate: response.user?.birth_date || response.user?.birthDate,
        zodiacSign: response.user?.zodiac_sign || response.user?.zodiacSign,
        updatedAt: response.user?.updated_at || response.user?.updatedAt || new Date().toISOString(),
      },
    };

    if (normalizedResponse.accessToken) {
      this.setToken(normalizedResponse.accessToken);
    }
    if (normalizedResponse.refreshToken) {
      this.setRefreshToken(normalizedResponse.refreshToken);
    }
    if (normalizedResponse.user) {
      this.setUser(normalizedResponse.user);
    }

    return normalizedResponse;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<any>('/auth/me');
    
    return {
      id: response.id || '',
      email: response.email || '',
      fullName: response.full_name || response.fullName || '',
      subscriptionTier: (response.subscription_tier || response.subscriptionTier || 'freemium').toLowerCase() as any,
      subscriptionExpires: response.subscription_expires || response.subscriptionExpires,
      createdAt: response.created_at || response.createdAt || new Date().toISOString(),
      lastLogin: response.last_login || response.lastLogin,
      birthDate: response.birth_date || response.birthDate,
      zodiacSign: response.zodiac_sign || response.zodiacSign,
      birthTime: response.birth_time || response.birthTime,
      birthLocation: response.birth_location || response.birthLocation,
      googleId: response.google_id || response.googleId,
      appleId: response.apple_id || response.appleId,
      telegramId: response.telegram_id || response.telegramId,
      vkId: response.vk_id || response.vkId,
      updatedAt: response.updated_at || response.updatedAt || new Date().toISOString(),
    };
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Ignore errors on logout
    } finally {
      this.clearToken();
    }
  }

  // ==================== Admin Endpoints ====================

  // Users
  async getUsers(params?: {
    skip?: number;
    limit?: number;
    search?: string;
    subscriptionTier?: string;
  }): Promise<User[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.subscriptionTier) queryParams.append('subscription_tier', params.subscriptionTier);

    const query = queryParams.toString();
    const raw = await this.request<Record<string, unknown>[]>(`/admin/users${query ? `?${query}` : ''}`);
    return Array.isArray(raw) ? raw.map(normalizeUser) : [];
  }

  async getUser(userId: string): Promise<User> {
    const raw = await this.request<Record<string, unknown>>(`/admin/users/${userId}`);
    return normalizeUser(raw ?? {});
  }

  async updateUser(userId: string, data: {
    fullName?: string;
    subscriptionTier?: string;
    subscriptionExpires?: string;
  }): Promise<User> {
    const raw = await this.request<Record<string, unknown>>(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({
        full_name: data.fullName,
        subscription_tier: data.subscriptionTier,
        subscription_expires: data.subscriptionExpires,
      }),
    });
    return normalizeUser(raw ?? {});
  }

  async deleteUser(userId: string): Promise<void> {
    await this.request(`/admin/users/${userId}`, { method: 'DELETE' });
  }

  // Statistics
  async getUserStats(): Promise<UserStats> {
    return this.request<UserStats>('/admin/stats/users');
  }

  async getSubscriptionStats(): Promise<SubscriptionStats> {
    return this.request<SubscriptionStats>('/admin/stats/subscriptions');
  }

  async getServiceUsage(): Promise<ServiceUsage[]> {
    return this.request<ServiceUsage[]>('/admin/stats/service-usage');
  }

  // Shop
  async getProducts(params?: {
    category?: string;
    isActive?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<Product[]> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.isActive !== undefined) queryParams.append('is_active', params.isActive.toString());
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return this.request<Product[]>(`/admin/shop/products${query ? `?${query}` : ''}`);
  }

  async getOrders(params?: {
    status?: string;
    skip?: number;
    limit?: number;
  }): Promise<Order[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return this.request<Order[]>(`/admin/shop/orders${query ? `?${query}` : ''}`);
  }

  // Moderation
  async getJournalEntries(params?: {
    flaggedOnly?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<JournalEntry[]> {
    const queryParams = new URLSearchParams();
    if (params?.flaggedOnly) queryParams.append('flagged_only', 'true');
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return this.request<JournalEntry[]>(`/admin/moderation/journal-entries${query ? `?${query}` : ''}`);
  }

  async moderateJournalEntry(entryId: string, action: string, reason?: string): Promise<void> {
    await this.request(`/admin/moderation/journal-entries/${entryId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    });
  }

  async getModerationStats(): Promise<ModerationStats> {
    return this.request<ModerationStats>('/admin/moderation/stats');
  }

  // Documents
  async getDocuments(category?: string): Promise<Document[]> {
    const query = category ? `?category=${category}` : '';
    return this.request<Document[]>(`/documents/${query}`);
  }

  async uploadDocument(data: {
    title: string;
    content: string;
    category?: string;
    source?: string;
  }): Promise<Document> {
    return this.request<Document>('/documents/upload', {
      method: 'POST',
      body: JSON.stringify({
        title: data.title,
        content: data.content,
        category: data.category,
        source: data.source || 'admin-upload',
      }),
    });
  }

  async uploadPdf(file: File, category?: string): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    if (category) formData.append('category', category);

    const token = this.getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/documents/upload-pdf`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async deleteDocument(documentId: number): Promise<void> {
    await this.request(`/documents/${documentId}`, { method: 'DELETE' });
  }

  // Analytics
  async getAnalytics(endpoint: string, params?: Record<string, any>): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const query = queryParams.toString();
    return this.request(`/analytics/${endpoint}${query ? `?${query}` : ''}`);
  }

  // Cache
  async getCacheStats(): Promise<any> {
    return this.request('/admin/cache/stats');
  }

  async clearCache(): Promise<void> {
    await this.request('/admin/cache/clear', { method: 'DELETE' });
  }

  async invalidateHoroscopeCache(zodiacSign?: string, period?: string): Promise<void> {
    const queryParams = new URLSearchParams();
    if (zodiacSign) queryParams.append('zodiac_sign', zodiacSign);
    if (period) queryParams.append('period', period);

    const query = queryParams.toString();
    await this.request(`/admin/cache/invalidate/horoscopes${query ? `?${query}` : ''}`, {
      method: 'POST',
    });
  }
}

export const adminApi = new AdminApiClient();
