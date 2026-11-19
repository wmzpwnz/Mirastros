/**
 * API Service
 * Centralized API client for backend communication
 */

import config from '../config';
import type { ExplanationKind, ResultExplanation } from '../../../../packages/shared-core/src/types/explanation';
import type { WelcomeState, WelcomeStep, WelcomePlace } from './welcomeTypes';
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  NatalChart,
  PlanetPosition,
  Aspect,
  TarotReading,
  Horoscope,
  DestinyMatrix,
  Product,
  Order,
  OrderItem,
  ShippingAddress,
  PaymentIntent,
  JournalEntry,
} from '../types';

// Legacy interface for backward compatibility
export interface PredictionResponse {
  response: string;
  sources?: Array<{ title: string; similarity: number }>;
}

export interface OnboardingInsightRequest {
  fullName: string;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  } | null;
  gender?: string;
  relationshipStatus?: string;
  lifeGoal?: string;
  knownZodiacSign?: string;
  preferredLanguage?: string;
  timezone?: string;
}

export interface OnboardingInsight {
  title: string;
  subtitle: string;
  message: string;
  nameInsight: string;
  cosmicSignature: string;
  generationInsight: string;
  birthPlaceInsight: string;
  archetype: string;
  element: string;
  personalThreshold: string;
  hiddenStrength: string;
  gentleShadow: string;
  pathSummary: string;
  details: string[];
  firstKey: string;
  source: 'deepseek' | 'fallback';
}

class ApiConnectionError extends Error {}

/** One deadline covers headers, body decoding and an optional token refresh.
 * Abort alone is not sufficient for transports that leave a body promise pending. */
function requestDeadline(milliseconds: number) {
  const controller = new AbortController();
  let timer!: ReturnType<typeof setTimeout>;
  const expired = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new DOMException('Request deadline exceeded', 'AbortError'));
    }, milliseconds);
  });
  return {
    signal: controller.signal,
    wait: <T>(operation: Promise<T>): Promise<T> => Promise.race([operation, expired]),
    close: () => clearTimeout(timer),
  };
}

class ApiClient {
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
    // Check both accessToken and token keys for compatibility
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
    localStorage.removeItem('token'); // legacy key
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  private async refreshTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    // Coalesce concurrent refresh attempts into a single request.
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      const deadline = requestDeadline(this.timeout);
      try {
        const response = await deadline.wait(fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
          signal: deadline.signal,
        }));

        if (!response.ok) {
          return null;
        }

        const data = await deadline.wait(response.json());
        const newAccess = data.access_token || data.accessToken;
        const newRefresh = data.refresh_token || data.refreshToken;
        if (!newAccess || !newRefresh) return null;

        this.setToken(newAccess);
        this.setRefreshToken(newRefresh);

        return { accessToken: newAccess, refreshToken: newRefresh };
      } catch {
        return null;
      } finally {
        deadline.close();
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Make HTTP request (public method for custom requests)
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOnAuthFailure: boolean = true,
    timeoutMs: number = this.timeout
  ): Promise<T> {
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${normalizedEndpoint}`;
    const publicCredentials = /^\/auth\/(login|register)$/.test(normalizedEndpoint);
    const token = publicCredentials ? null : this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    const deadline = requestDeadline(timeoutMs);

    try {
      console.log(`Making request to: ${url}`);
      const response = await deadline.wait(fetch(url, {
        ...options,
        headers,
        signal: deadline.signal,
      }));

      if (!response.ok) {
        let errorMessage = response.statusText;
        try {
          const error = await deadline.wait(response.json());
          errorMessage = error.detail || error.message || error.error || response.statusText;
        } catch (error) {
          if (deadline.signal.aborted) throw error;
          // If response is not JSON, use status text
          errorMessage = response.statusText || `HTTP ${response.status}`;
        }

        // Provide more helpful error messages
        if (response.status === 503) {
          const lowered = (errorMessage || '').toLowerCase();
          if (
            lowered.includes('database unavailable') ||
            lowered.includes('database_url') ||
            lowered.includes('postgres') ||
            lowered.includes('база данных') ||
            lowered.includes('postgresql') ||
            lowered.includes('localhost:5432')
          ) {
            throw new Error(
              'База данных недоступна. Запустите PostgreSQL (localhost:5432) или укажите DATABASE_URL в apps/backend/.env.'
            );
          }
          throw new Error(errorMessage || 'Сервис временно недоступен');
        }
        if (response.status === 401) {
          // For login/register, show actual error (e.g. "Incorrect email or password")
          const isAuthEndpoint = /^\/auth\/(login|register)/.test(normalizedEndpoint);
          if (isAuthEndpoint && errorMessage) {
            throw new Error(
              errorMessage.includes('Incorrect') || errorMessage.includes('password')
                ? 'Неверный email или пароль'
                : errorMessage
            );
          }
          // Try refresh once, then retry the original request.
          if (retryOnAuthFailure) {
            const refreshed = await deadline.wait(this.refreshTokens());
            if (refreshed) {
              return this.request<T>(endpoint, options, false);
            }
          }

          // Clear invalid tokens and fail.
          this.clearToken();
          throw new Error('401: Требуется авторизация');
        }
        if (response.status === 400) {
          throw new Error(errorMessage || 'Неверные данные');
        }
        if (response.status === 500) {
          throw new Error(errorMessage || 'Ошибка сервера. Попробуйте позже');
        }

        throw new Error(errorMessage);
      }

      const data = await deadline.wait(response.json());
      console.log(`Request successful for ${endpoint}`);
      return data;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      const isNetworkError =
        error instanceof TypeError ||
        msg.includes('Failed to fetch') ||
        msg.includes('NetworkError') ||
        msg.includes('Network request failed') ||
        msg.includes('Load failed') ||
        msg.includes('ERR_CONNECTION_REFUSED');

      if (deadline.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
        console.error(`Request aborted (timeout) for ${endpoint}`);
        throw new ApiConnectionError('Таймаут запроса. Сервер не ответил вовремя.');
      }
      if (isNetworkError) {
        console.error(`Network error for ${endpoint}:`, error);
        throw new ApiConnectionError(
          `Сервер API недоступен (${this.baseUrl}). Запустите бэкенд: в корне проекта выполните \`npm start\` или \`bash start-local.sh\`.`
        );
      }
      if (error instanceof Error) {
        console.error(`Request error for ${endpoint}:`, error);
        throw error;
      }
      throw new Error('Неизвестная ошибка');
    } finally {
      deadline.close();
    }
  }

  // ==================== Authentication ====================

  async login(email: string, password: string): Promise<AuthResponse> {
    // Use JSON format instead of form-urlencoded for consistency
    const response = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Normalize response: convert snake_case to camelCase if needed
    const normalizedResponse: AuthResponse = {
      accessToken: response.access_token || response.accessToken,
      refreshToken: response.refresh_token || response.refreshToken,
      user: {
        id: response.user?.id || '',
        email: response.user?.email || '',
        fullName: response.user?.full_name || response.user?.fullName || '',
        birthDate: response.user?.birth_date || response.user?.birthDate,
        birthTime: response.user?.birth_time || response.user?.birthTime,
        birthLocation: response.user?.birth_location || response.user?.birthLocation,
        zodiacSign: response.user?.zodiac_sign || response.user?.zodiacSign,
        subscriptionTier: (response.user?.subscription_tier || response.user?.subscriptionTier || 'freemium').toLowerCase(),
        subscriptionExpires: response.user?.subscription_expires || response.user?.subscriptionExpires,
        preferredLanguage: response.user?.preferred_language || response.user?.preferredLanguage || 'ru',
        timezone: response.user?.timezone || response.user?.timezone || 'UTC',
        createdAt: response.user?.created_at || response.user?.createdAt || new Date().toISOString(),
        updatedAt: response.user?.updated_at || response.user?.updatedAt || new Date().toISOString(),
      },
    };

    // Store token
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

  async register(data: {
    email: string;
    password: string;
    full_name: string;
    birth_date?: string;
    preferredLanguage: string;
    timezone: string;
  }): Promise<AuthResponse> {
    let response: any;
    try {
      response = await this.request<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          full_name: data.full_name,
          preferred_language: data.preferredLanguage || 'ru',
          timezone: data.timezone || 'UTC',
        }),
      });
    } catch (error) {
      if (!(error instanceof ApiConnectionError)) throw error;
      // A lost response does not mean the account was not committed. Authenticate
      // once with the submitted credentials; do not repeat the registration POST.
      try { return await this.login(data.email, data.password); } catch { throw error; }
    }

    // Normalize response: convert snake_case to camelCase if needed
    const normalizedResponse: AuthResponse = {
      accessToken: response.access_token || response.accessToken,
      refreshToken: response.refresh_token || response.refreshToken,
      user: {
        id: response.user?.id || '',
        email: response.user?.email || '',
        fullName: response.user?.full_name || response.user?.fullName || '',
        birthDate: response.user?.birth_date || response.user?.birthDate,
        birthTime: response.user?.birth_time || response.user?.birthTime,
        birthLocation: response.user?.birth_location || response.user?.birthLocation,
        zodiacSign: response.user?.zodiac_sign || response.user?.zodiacSign,
        subscriptionTier: (response.user?.subscription_tier || response.user?.subscriptionTier || 'freemium').toLowerCase(),
        subscriptionExpires: response.user?.subscription_expires || response.user?.subscriptionExpires,
        preferredLanguage: response.user?.preferred_language || response.user?.preferredLanguage || 'ru',
        timezone: response.user?.timezone || response.user?.timezone || 'UTC',
        createdAt: response.user?.created_at || response.user?.createdAt || new Date().toISOString(),
        updatedAt: response.user?.updated_at || response.user?.updatedAt || new Date().toISOString(),
      },
    };

    // Store token
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

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return this.request('/auth/password/reset-request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyPasswordResetToken(token: string): Promise<{ valid: boolean; email: string }> {
    return this.request(`/auth/password/verify-token/${encodeURIComponent(token)}`, {
      method: 'GET',
    });
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<{ message: string }> {
    return this.request('/auth/password/reset-confirm', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    });
  }

  async generateWelcomeReading(step: 'name' | 'birth'): Promise<import('../../../../packages/shared-core/src/types/welcome').WelcomeMessageResponse> {
    return this.request('/auth/onboarding/reading', { method: 'POST', body: JSON.stringify({ step }) }, false, 20000);
  }

  async generateWelcomeMessage(): Promise<import('../../../../packages/shared-core/src/types/welcome').WelcomeMessageResponse> {
    return this.request('/auth/onboarding/message', { method: 'POST', body: '{}'}, false, 20000);
  }

  async getWelcomeState(): Promise<WelcomeState> {
    return this.request('/auth/onboarding/state', { cache: 'no-store' });
  }

  async startWelcome(): Promise<WelcomeState> {
    return this.request('/auth/onboarding/start', { method: 'POST' });
  }

  async saveWelcomeStep(data: WelcomeStep): Promise<WelcomeState> {
    let state: WelcomeState;
    try {
      state = await this.request<WelcomeState>('/auth/onboarding/step', { method: 'POST', body: JSON.stringify(data) });
    } catch (error) {
      if (!(error instanceof Error) || !/таймаут|сервер|network|fetch|timeout/i.test(error.message)) throw error;
      // The server can commit successfully even if the response is lost. Read
      // back once; never repeat a mutation just because the connection failed.
      let saved: WelcomeState;
      try { saved = await this.getWelcomeState(); } catch { throw error; }
      const expectedStep = { name: 2, birth: 3, sky: 4 }[data.step];
      const matches = data.step === 'name' ? saved.profile.full_name === data.full_name
        : data.step === 'birth' ? saved.profile.birth_date === data.birth_date
        : (saved.profile.birth_time?.slice(0, 5) || null) === (data.birth_time || null)
          && (['city', 'country', 'latitude', 'longitude'] as const).every(key => (saved.profile.birth_location?.[key] ?? null) === (data.birth_location?.[key] ?? null));
      if (saved.next_step < expectedStep || !matches) throw error;
      state = saved;
    }
    // Other browser modules still read the account cache. Keep it in sync with
    // the shared server profile without making storage failures undo a save.
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const user = JSON.parse(raw);
        user.fullName = state.profile.full_name;
        user.birthDate = state.profile.birth_date ?? undefined;
        user.birthTime = state.profile.birth_time ?? undefined;
        user.birthLocation = state.profile.birth_location ?? undefined;
        if (state.profile.zodiac_sign !== undefined) user.zodiacSign = state.profile.zodiac_sign ?? undefined;
        for (const field of ['full_name', 'birth_date', 'birth_time', 'birth_location', 'zodiac_sign']) delete user[field];
        this.setUser(user);
      }
    } catch { /* The server profile is already saved. */ }
    return state;
  }

  async completeWelcome(): Promise<WelcomeState> {
    try {
      return await this.request<WelcomeState>('/auth/onboarding/complete', { method: 'POST' });
    } catch (error) {
      if (!(error instanceof ApiConnectionError)) throw error;
      const saved = await this.getWelcomeState().catch(() => null);
      if (saved?.completed) return saved;
      throw error;
    }
  }

  async searchBirthplaces(query: string): Promise<WelcomePlace[]> {
    return this.request(`/auth/onboarding/places?q=${encodeURIComponent(query)}`);
  }

  async generateOnboardingInsight(data: OnboardingInsightRequest): Promise<OnboardingInsight> {
    const response = await this.request<any>('/auth/onboarding/insight', {
      method: 'POST',
      body: JSON.stringify({
        full_name: data.fullName,
        birth_date: data.birthDate,
        birth_time: data.birthTime,
        birth_location: data.birthLocation,
        gender: data.gender,
        relationship_status: data.relationshipStatus,
        life_goal: data.lifeGoal,
        known_zodiac_sign: data.knownZodiacSign,
        preferred_language: data.preferredLanguage || 'ru',
        timezone: data.timezone || 'UTC',
      }),
    });

    return {
      title: response.title || 'Mirastros приветствует тебя',
      subtitle: response.subtitle || 'Первая карта пути открыта',
      message: response.message || '',
      nameInsight: response.name_insight || response.nameInsight || '',
      cosmicSignature: response.cosmic_signature || response.cosmicSignature || '',
      generationInsight: response.generation_insight || response.generationInsight || '',
      birthPlaceInsight: response.birth_place_insight || response.birthPlaceInsight || '',
      archetype: response.archetype || '',
      element: response.element || '',
      personalThreshold: response.personal_threshold || response.personalThreshold || '',
      hiddenStrength: response.hidden_strength || response.hiddenStrength || '',
      gentleShadow: response.gentle_shadow || response.gentleShadow || '',
      pathSummary: response.path_summary || response.pathSummary || '',
      details: Array.isArray(response.details) ? response.details : [],
      firstKey: response.first_key || response.firstKey || '',
      source: response.source === 'fallback' ? 'fallback' : 'deepseek',
    };
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<any>('/auth/me');

    // Normalize response: convert snake_case to camelCase
    return {
      id: response.id || '',
      email: response.email || '',
      fullName: response.full_name || response.fullName || '',
      birthDate: response.birth_date || response.birthDate,
      birthTime: response.birth_time || response.birthTime,
      birthLocation: response.birth_location || response.birthLocation,
      zodiacSign: response.zodiac_sign || response.zodiacSign,
      subscriptionTier: (response.subscription_tier || response.subscriptionTier || 'freemium').toLowerCase() as 'freemium' | 'premium' | 'platinum',
      subscriptionExpires: response.subscription_expires || response.subscriptionExpires,
      preferredLanguage: response.preferred_language || response.preferredLanguage || 'ru',
      timezone: response.timezone || response.timezone || 'UTC',
      createdAt: response.created_at || response.createdAt || new Date().toISOString(),
      updatedAt: response.updated_at || response.updatedAt || new Date().toISOString(),
    };
  }

  async updateProfile(data: {
    fullName?: string;
    email?: string;
    birthDate?: string;
    birthTime?: string;
    birthLocation?: {
      city: string;
      country: string;
      latitude: number;
      longitude: number;
    };
  }): Promise<User> {
    const payload: any = {};
    if (data.fullName !== undefined) payload.full_name = data.fullName;
    if (data.email !== undefined) payload.email = data.email;
    if (data.birthDate !== undefined) payload.birth_date = data.birthDate;
    if (data.birthTime !== undefined) payload.birth_time = data.birthTime;
    if (data.birthLocation !== undefined) payload.birth_location = data.birthLocation;
    if ((data as any).preferredLanguage !== undefined) payload.preferred_language = (data as any).preferredLanguage;
    if ((data as any).timezone !== undefined) payload.timezone = (data as any).timezone;

    const response = await this.request<any>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    // Normalize response
    const user: User = {
      id: response.id || '',
      email: response.email || '',
      fullName: response.full_name || response.fullName || '',
      birthDate: response.birth_date || response.birthDate,
      birthTime: response.birth_time || response.birthTime,
      birthLocation: response.birth_location || response.birthLocation,
      zodiacSign: response.zodiac_sign || response.zodiacSign,
      subscriptionTier: (response.subscription_tier || response.subscriptionTier || 'freemium').toLowerCase() as 'freemium' | 'premium' | 'platinum',
      subscriptionExpires: response.subscription_expires || response.subscriptionExpires,
      preferredLanguage: response.preferred_language || response.preferredLanguage || 'ru',
      timezone: response.timezone || response.timezone || 'UTC',
      createdAt: response.created_at || response.createdAt || new Date().toISOString(),
      updatedAt: response.updated_at || response.updatedAt || new Date().toISOString(),
    };
    this.setUser(user);
    return user;
  }

  async logout(): Promise<void> {
    await this.request<void>('/auth/logout', { method: 'POST' });
    this.clearToken();
  }

  // ==================== Social Authentication ====================

  async loginWithGoogle(googleToken: string, googleId?: string, email?: string, name?: string): Promise<AuthResponse> {
    const response = await this.request<any>('/auth/social/google', {
      method: 'POST',
      body: JSON.stringify({
        google_id: googleId,
        id_token: googleToken,
        email: email,
        name: name,
      }),
    });

    // Normalize and store tokens
    const normalizedResponse: AuthResponse = {
      accessToken: response.access_token || response.accessToken,
      refreshToken: response.refresh_token || response.refreshToken,
      user: {
        id: response.user?.id || '',
        email: response.user?.email || '',
        fullName: response.user?.full_name || response.user?.fullName || '',
        birthDate: response.user?.birth_date || response.user?.birthDate,
        birthTime: response.user?.birth_time || response.user?.birthTime,
        birthLocation: response.user?.birth_location || response.user?.birthLocation,
        zodiacSign: response.user?.zodiac_sign || response.user?.zodiacSign,
        subscriptionTier: (response.user?.subscription_tier || response.user?.subscriptionTier || 'freemium').toLowerCase(),
        subscriptionExpires: response.user?.subscription_expires || response.user?.subscriptionExpires,
        preferredLanguage: response.user?.preferred_language || response.user?.preferredLanguage || 'ru',
        timezone: response.user?.timezone || response.user?.timezone || 'UTC',
        createdAt: response.user?.created_at || response.user?.createdAt || new Date().toISOString(),
        updatedAt: response.user?.updated_at || response.user?.updatedAt || new Date().toISOString(),
      },
    };

    if (normalizedResponse.accessToken) {
      this.setToken(normalizedResponse.accessToken);
    }
    if (normalizedResponse.refreshToken) this.setRefreshToken(normalizedResponse.refreshToken);
    if (normalizedResponse.user) this.setUser(normalizedResponse.user);

    return normalizedResponse;
  }

  async loginWithApple(appleToken: string, appleId: string, email?: string, name?: string): Promise<AuthResponse> {
    const response = await this.request<any>('/auth/social/apple', {
      method: 'POST',
      body: JSON.stringify({
        apple_id: appleId,
        id_token: appleToken,
        email: email,
        name: name,
      }),
    });

    const normalizedResponse: AuthResponse = {
      accessToken: response.access_token || response.accessToken,
      refreshToken: response.refresh_token || response.refreshToken,
      user: {
        id: response.user?.id || '',
        email: response.user?.email || '',
        fullName: response.user?.full_name || response.user?.fullName || '',
        birthDate: response.user?.birth_date || response.user?.birthDate,
        birthTime: response.user?.birth_time || response.user?.birthTime,
        birthLocation: response.user?.birth_location || response.user?.birthLocation,
        zodiacSign: response.user?.zodiac_sign || response.user?.zodiacSign,
        subscriptionTier: (response.user?.subscription_tier || response.user?.subscriptionTier || 'freemium').toLowerCase(),
        subscriptionExpires: response.user?.subscription_expires || response.user?.subscriptionExpires,
        preferredLanguage: response.user?.preferred_language || response.user?.preferredLanguage || 'ru',
        timezone: response.user?.timezone || response.user?.timezone || 'UTC',
        createdAt: response.user?.created_at || response.user?.createdAt || new Date().toISOString(),
        updatedAt: response.user?.updated_at || response.user?.updatedAt || new Date().toISOString(),
      },
    };

    if (normalizedResponse.accessToken) {
      this.setToken(normalizedResponse.accessToken);
    }
    if (normalizedResponse.refreshToken) this.setRefreshToken(normalizedResponse.refreshToken);
    if (normalizedResponse.user) this.setUser(normalizedResponse.user);

    return normalizedResponse;
  }

  async loginWithVK(vkId: string, vkToken: string, email?: string, firstName?: string, lastName?: string): Promise<AuthResponse> {
    const response = await this.request<any>('/auth/social/vk', {
      method: 'POST',
      body: JSON.stringify({
        vk_id: vkId,
        access_token: vkToken,
        email: email,
        first_name: firstName,
        last_name: lastName,
      }),
    });

    const normalizedResponse: AuthResponse = {
      accessToken: response.access_token || response.accessToken,
      refreshToken: response.refresh_token || response.refreshToken,
      user: {
        id: response.user?.id || '',
        email: response.user?.email || '',
        fullName: response.user?.full_name || response.user?.fullName || '',
        birthDate: response.user?.birth_date || response.user?.birthDate,
        birthTime: response.user?.birth_time || response.user?.birthTime,
        birthLocation: response.user?.birth_location || response.user?.birthLocation,
        zodiacSign: response.user?.zodiac_sign || response.user?.zodiacSign,
        subscriptionTier: (response.user?.subscription_tier || response.user?.subscriptionTier || 'freemium').toLowerCase(),
        subscriptionExpires: response.user?.subscription_expires || response.user?.subscriptionExpires,
        preferredLanguage: response.user?.preferred_language || response.user?.preferredLanguage || 'ru',
        timezone: response.user?.timezone || response.user?.timezone || 'UTC',
        createdAt: response.user?.created_at || response.user?.createdAt || new Date().toISOString(),
        updatedAt: response.user?.updated_at || response.user?.updatedAt || new Date().toISOString(),
      },
    };

    if (normalizedResponse.accessToken) {
      this.setToken(normalizedResponse.accessToken);
    }
    if (normalizedResponse.refreshToken) this.setRefreshToken(normalizedResponse.refreshToken);
    if (normalizedResponse.user) this.setUser(normalizedResponse.user);

    return normalizedResponse;
  }

  async loginWithTelegram(telegramData: string | {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
  }): Promise<AuthResponse> {
    const response = await this.request<any>('/auth/social/telegram', {
      method: 'POST',
      body: JSON.stringify({
        ...(typeof telegramData === 'string' ? { init_data: telegramData } : {
        telegram_id: telegramData.id.toString(),
        first_name: telegramData.first_name,
        last_name: telegramData.last_name,
        username: telegramData.username,
        photo_url: telegramData.photo_url,
        auth_date: telegramData.auth_date,
        hash: telegramData.hash,
        }),
      }),
    });

    const normalizedResponse: AuthResponse = {
      accessToken: response.access_token || response.accessToken,
      refreshToken: response.refresh_token || response.refreshToken,
      user: {
        id: response.user?.id || '',
        email: response.user?.email || '',
        fullName: response.user?.full_name || response.user?.fullName || '',
        birthDate: response.user?.birth_date || response.user?.birthDate,
        birthTime: response.user?.birth_time || response.user?.birthTime,
        birthLocation: response.user?.birth_location || response.user?.birthLocation,
        zodiacSign: response.user?.zodiac_sign || response.user?.zodiacSign,
        subscriptionTier: (response.user?.subscription_tier || response.user?.subscriptionTier || 'freemium').toLowerCase(),
        subscriptionExpires: response.user?.subscription_expires || response.user?.subscriptionExpires,
        preferredLanguage: response.user?.preferred_language || response.user?.preferredLanguage || 'ru',
        timezone: response.user?.timezone || response.user?.timezone || 'UTC',
        createdAt: response.user?.created_at || response.user?.createdAt || new Date().toISOString(),
        updatedAt: response.user?.updated_at || response.user?.updatedAt || new Date().toISOString(),
      },
    };

    if (normalizedResponse.accessToken) {
      this.setToken(normalizedResponse.accessToken);
    }
    if (normalizedResponse.refreshToken) this.setRefreshToken(normalizedResponse.refreshToken);
    if (normalizedResponse.user) this.setUser(normalizedResponse.user);

    return normalizedResponse;
  }

  async linkSocialAccount(provider: string, providerId: string): Promise<User> {
    const response = await this.request<any>('/auth/social/link', {
      method: 'POST',
      body: JSON.stringify({
        provider: provider,
        provider_id: providerId,
      }),
    });

    return {
      id: response.id || '',
      email: response.email || '',
      fullName: response.full_name || response.fullName || '',
      birthDate: response.birth_date || response.birthDate,
      birthTime: response.birth_time || response.birthTime,
      birthLocation: response.birth_location || response.birthLocation,
      zodiacSign: response.zodiac_sign || response.zodiacSign,
      subscriptionTier: (response.subscription_tier || response.subscriptionTier || 'freemium').toLowerCase() as 'freemium' | 'premium' | 'platinum',
      subscriptionExpires: response.subscription_expires || response.subscriptionExpires,
      preferredLanguage: response.preferred_language || response.preferredLanguage || 'ru',
      timezone: response.timezone || response.timezone || 'UTC',
      createdAt: response.created_at || response.createdAt || new Date().toISOString(),
      updatedAt: response.updated_at || response.updatedAt || new Date().toISOString(),
    };
  }

  async unlinkSocialAccount(provider: string): Promise<User> {
    const response = await this.request<any>(`/auth/social/unlink/${provider}`, {
      method: 'DELETE',
    });

    return {
      id: response.id || '',
      email: response.email || '',
      fullName: response.full_name || response.fullName || '',
      birthDate: response.birth_date || response.birthDate,
      birthTime: response.birth_time || response.birthTime,
      birthLocation: response.birth_location || response.birthLocation,
      zodiacSign: response.zodiac_sign || response.zodiacSign,
      subscriptionTier: (response.subscription_tier || response.subscriptionTier || 'freemium').toLowerCase() as 'freemium' | 'premium' | 'platinum',
      subscriptionExpires: response.subscription_expires || response.subscriptionExpires,
      preferredLanguage: response.preferred_language || response.preferredLanguage || 'ru',
      timezone: response.timezone || response.timezone || 'UTC',
      createdAt: response.created_at || response.createdAt || new Date().toISOString(),
      updatedAt: response.updated_at || response.updatedAt || new Date().toISOString(),
    };
  }

  // ==================== Horoscope ====================

  private normalizePlainText(value?: string): string {
    if (!value) return '';
    return value
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`([^`]*)`/g, '$1')
      .replace(/[*_~#[\]()]/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  private hasCyrillic(value?: string): boolean {
    if (!value) return false;
    return /[А-Яа-яЁё]/.test(value);
  }

  private normalizePeriodRangeLabel(period: 'daily' | 'weekly' | 'monthly', rawDate: string, provided?: string): string {
    if (provided) return provided;
    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) return '';
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    if (period === 'daily') return `${parsed.getDate()} ${months[parsed.getMonth()]} ${parsed.getFullYear()}`;
    if (period === 'monthly') return `${months[parsed.getMonth()]} ${parsed.getFullYear()}`;
    const end = new Date(parsed);
    end.setDate(end.getDate() + 6);
    if (parsed.getMonth() === end.getMonth()) {
      return `${parsed.getDate()}-${end.getDate()} ${months[parsed.getMonth()]} ${parsed.getFullYear()}`;
    }
    return `${parsed.getDate()} ${months[parsed.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]} ${parsed.getFullYear()}`;
  }

  async getHoroscope(sign: string, period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<Horoscope> {
    try {
      const response = await this.request<any>(`/horoscope/${period}/${sign}`);
      const normalizedPrediction = this.normalizePlainText(response.plain_text || response.prediction);
      const normalizedAdvice = this.normalizePlainText(response.advice);
      const language = response.language || 'ru';
      const hasRu = this.hasCyrillic(normalizedPrediction);
      if (!hasRu) {
        console.info('[metrics] horoscope_language_mismatch', { sign, period });
      }
      // Normalize response to match Horoscope interface
      const normalized = {
        id: response.horoscope_id || response.id,
        sign: response.sign,
        period: response.period as 'daily' | 'weekly' | 'monthly',
        date: response.date || response.target_date,
        prediction: hasRu
          ? normalizedPrediction
          : 'Сегодня фокусируйтесь на главном и поддерживайте внутренний баланс. Небольшие последовательные шаги дадут лучший результат.',
        plainText: normalizedPrediction,
        richText: response.rich_text || response.prediction,
        language,
        periodRangeLabel: this.normalizePeriodRangeLabel(
          response.period as 'daily' | 'weekly' | 'monthly',
          response.date || response.target_date,
          response.period_range_label || response.periodRangeLabel
        ),
        luckyNumbers: response.lucky_numbers || response.luckyNumbers,
        luckyColors: response.lucky_colors || response.luckyColors,
        compatibility: response.compatibility_signs || response.compatibility,
        advice: normalizedAdvice,
        ratings: response.ratings || null, // Explicitly handle null
        explanations: response.explanations
          ? {
              financeReason: response.explanations.finance_reason,
              loveReason: response.explanations.love_reason,
              careerReason: response.explanations.career_reason,
              healthReason: response.explanations.health_reason,
            }
          : undefined,
        bestTimeWindows: response.best_time_windows || response.bestTimeWindows || [],
        is_personalized: response.is_personalized,
        transit_data: response.transit_data,
        clarify_available: response.clarify_available,
        horoscope_id: response.horoscope_id,
      };

      if (!hasRu) {
        console.info('[metrics] horoscope_fallback_used', { sign, period });
      }

      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API] Horoscope ${period} for ${sign}:`, {
          hasRatings: !!normalized.ratings,
          ratings: normalized.ratings,
          hasToken: !!this.getToken(),
        });
      }

      return normalized;
    } catch (error) {
      console.error('Horoscope API error:', error);
      // Fallback for development - but don't use in production
      if (process.env.NODE_ENV === 'development') {
        return {
          id: 'mock',
          sign,
          period,
          date: new Date().toISOString(),
          prediction: 'Звезды сегодня благосклонны к вам. Ожидайте приятных сюрпризов.',
          luckyNumbers: [7, 14, 21],
          luckyColors: ['золотой', 'синий'],
          compatibility: ['Телец', 'Рак'],
          advice: 'Прислушайтесь к интуиции',
        };
      }
      throw error;
    }
  }

  // ==================== Tarot ====================

  async getResultExplanation(kind: ExplanationKind, id: string): Promise<ResultExplanation> {
    return this.request(`/explanations/${kind}/${encodeURIComponent(id)}`, { cache: 'no-store' });
  }

  async explainResult(kind: ExplanationKind, id: string, question?: string): Promise<ResultExplanation> {
    return this.request(`/explanations/${kind}/${encodeURIComponent(id)}`, { method: 'POST', body: JSON.stringify({ question: question || null }) }, false);
  }

  async getTarotReading(spreadType: string, question?: string): Promise<TarotReading> {
    return this.request<TarotReading>('/tarot/reading', {
      method: 'POST',
      body: JSON.stringify({ spread_type: spreadType, question }),
    });
  }

  async getTarotHistory(limit = 10, offset = 0): Promise<{ readings: TarotReading[]; total: number }> {
    return this.request(`/tarot/history?limit=${limit}&offset=${offset}`);
  }

  // ==================== Consultation History (unified) ====================

  async getUnifiedHistory(params: {
    serviceType?: string;
    page?: number;
    pageSize?: number;
    favoritesOnly?: boolean;
  }): Promise<import('../types').ConsultationHistoryResponse> {
    const q = new URLSearchParams();
    if (params.serviceType) q.set('service_type', params.serviceType);
    if (params.page != null) q.set('page', String(params.page));
    if (params.pageSize != null) q.set('page_size', String(params.pageSize));
    if (params.favoritesOnly) q.set('favorites_only', 'true');
    return this.request(`/history?${q.toString()}`);
  }

  async getConsultationDetail(
    type: string,
    id: string
  ): Promise<import('../types').ConsultationDetailResponse> {
    return this.request(`/history/${type}/${id}`);
  }

  async deleteConsultation(type: string, id: string): Promise<{ deleted: boolean }> {
    return this.request(`/history/${type}/${id}`, { method: 'DELETE' });
  }

  async getHistoryStats(): Promise<import('../types').HistoryStatsResponse> {
    return this.request('/history/stats');
  }

  // ==================== Natal Chart ====================

  async calculateNatalChart(params: {
    name: string;
    birthDate: string;
    birthTime: string;
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
    houseSystem?: string;
    generateInterpretation?: boolean;
  }): Promise<NatalChart> {
    const body = {
      birth_data: {
        name: params.name,
        birth_date: params.birthDate,
        birth_time: params.birthTime,
        latitude: params.latitude,
        longitude: params.longitude,
        city: params.city ?? null,
        country: params.country ?? null,
        house_system: params.houseSystem ?? 'placidus',
      },
      generate_interpretation: params.generateInterpretation ?? false,
    };
    const data = await this.request<{ chart_data: unknown; interpretation?: string; calculated_at: string }>('/natal/calculate', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return this.normalizeNatalChartResponse(data) as NatalChart & { interpretation?: string };
  }

  private normalizeNatalChartResponse(data: { chart_data?: unknown; interpretation?: string; calculated_at?: string }): NatalChart & { interpretation?: string } {
    const chartData = data.chart_data as Record<string, unknown> | undefined;
    const houses = (chartData?.houses as Array<{ cusp?: number; number?: number; sign: string; degree: number }>) || [];
    return {
      id: '',
      userId: '',
      planets: (chartData?.planets as Record<string, PlanetPosition>) || {},
      houses: houses.map((h) => ({ number: h.cusp ?? h.number ?? 0, sign: h.sign, degree: h.degree })),
      aspects: (chartData?.aspects as Aspect[]) || [],
      calculatedAt: data.calculated_at || new Date().toISOString(),
      interpretation: data.interpretation,
    };
  }

  async getNatalChart(): Promise<NatalChart | null> {
    try {
      console.log('[API] getNatalChart: Starting request to', `${this.baseUrl}/natal/me`);
      console.log('[API] getNatalChart: Token exists:', !!this.getToken());

      const response = await fetch(`${this.baseUrl}/natal/me`, {
        headers: {
          'Content-Type': 'application/json',
          ...(this.getToken() ? { Authorization: `Bearer ${this.getToken()}` } : {}),
        },
      });

      console.log('[API] getNatalChart: Response status:', response.status);

      if (response.status === 404 || response.status === 204) {
        console.log('[API] getNatalChart: Returning null (404/204)');
        return null;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }));
        console.error('[API] getNatalChart: Error response:', error);
        throw new Error(error.detail || error.message || response.statusText);
      }

      const data = await response.json();
      console.log('[API] getNatalChart: Raw response data:', data);

      // Handle null response
      if (!data) {
        console.log('[API] getNatalChart: Data is null');
        return null;
      }

      // Transform backend response to frontend NatalChart format
      const chartData = data.chart_data || data;
      console.log('[API] getNatalChart: Chart data:', chartData);

      // Map backend houses (cusp) to frontend (number)
      const houses = (chartData.houses || []).map((h: { cusp?: number; number?: number; sign: string; degree: number }) => ({
        number: h.cusp ?? h.number ?? 0,
        sign: h.sign,
        degree: h.degree,
      }));

      const result = {
        id: data.id || '',
        userId: data.user_id || '',
        planets: chartData.planets || {},
        houses,
        aspects: chartData.aspects || [],
        calculatedAt: data.calculated_at || new Date().toISOString(),
      };

      console.log('[API] getNatalChart: Transformed result:', result);
      return result;
    } catch (error) {
      console.error('[API] getNatalChart error:', error);
      return null;
    }
  }

  // ==================== Destiny Matrix ====================

  private normalizeDestinyMatrixPayload(matrix: any): DestinyMatrix {
    if (!matrix) return matrix;

    const linesBasic = matrix.lines_basic || matrix.lines || {
      destiny: 0,
      character: 0,
      purpose: 0,
      health: 0,
    };

    const linesExtended = matrix.lines_extended || {
      line_of_heaven: [linesBasic.destiny, linesBasic.destiny, linesBasic.purpose],
      line_of_earth: [linesBasic.character, linesBasic.character, linesBasic.health],
      line_of_man: [linesBasic.destiny, linesBasic.destiny, linesBasic.character],
      line_of_woman: [linesBasic.purpose, linesBasic.purpose, linesBasic.health],
    };

    return {
      ...matrix,
      calculation_version: matrix.calculation_version || (matrix.lines_basic ? 'v2' : 'v1'),
      lines: linesBasic,
      lines_basic: linesBasic,
      lines_extended: linesExtended,
      positions: matrix.positions || {},
      layout_meta: matrix.layout_meta || {},
    };
  }

  async getDestinyMatrix(): Promise<DestinyMatrix | null> {
    try {
      const response = await fetch(`${this.baseUrl}/destiny-matrix/me`, {
        headers: {
          'Content-Type': 'application/json',
          ...(this.getToken() ? { Authorization: `Bearer ${this.getToken()}` } : {}),
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(error.detail || error.message || response.statusText);
      }

      const data = await response.json();
      return this.normalizeDestinyMatrixPayload(data);
    } catch (error: any) {
      // Return null if matrix doesn't exist (404)
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  async calculateDestinyMatrix(birthDate: string): Promise<DestinyMatrix> {
    const data = await this.request<DestinyMatrix>('/destiny-matrix/calculate', {
      method: 'POST',
      body: JSON.stringify({ birth_date: birthDate }),
    });
    return this.normalizeDestinyMatrixPayload(data);
  }

  async recalculateDestinyMatrixV2(birthDate: string): Promise<DestinyMatrix> {
    const matrix = await this.calculateDestinyMatrix(birthDate);
    if (matrix.calculation_version !== 'v2') {
      throw new Error('Unexpected destiny matrix version: expected v2');
    }
    return matrix;
  }

  // ==================== Shop ====================

  async getProducts(params?: {
    category?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ products: Product[]; total: number; page: number; pageSize: number }> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.pageSize) query.append('page_size', params.pageSize.toString());

    return this.request(`/shop/products?${query.toString()}`);
  }

  async getProduct(productId: string): Promise<Product> {
    return this.request<Product>(`/shop/products/${productId}`);
  }

  async getProductRecommendations(limit = 5): Promise<{ products: Product[]; reason: string }> {
    return this.request(`/shop/recommendations?limit=${limit}`);
  }

  async createOrder(data: {
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    notes?: string;
  }): Promise<Order> {
    return this.request<Order>('/shop/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrders(limit = 10, offset = 0): Promise<{ orders: Order[]; total: number }> {
    return this.request(`/shop/orders?limit=${limit}&offset=${offset}`);
  }

  async getOrder(orderId: string): Promise<Order> {
    return this.request<Order>(`/shop/orders/${orderId}`);
  }

  // ==================== Payments ====================

  async createPayment(data: {
    orderId: string;
    paymentMethod: 'stripe' | 'yookassa';
    returnUrl: string;
  }): Promise<PaymentIntent> {
    return this.request<PaymentIntent>('/payments/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPaymentStatus(paymentId: string, paymentMethod: string): Promise<{
    paymentId: string;
    status: string;
    amount: number;
    currency: string;
    paid: boolean;
  }> {
    return this.request(`/payments/status/${paymentId}?payment_method=${paymentMethod}`);
  }

  // ==================== Subscriptions ====================

  async createSubscription(data: {
    tier: 'premium' | 'platinum';
    paymentMethod: 'stripe' | 'yookassa';
    billingPeriod: 'monthly' | 'annual';
  }): Promise<{
    subscriptionId: string;
    paymentUrl?: string;
    clientSecret?: string;
    confirmationUrl?: string;
  }> {
    const response = await this.request<any>('/subscriptions/create', {
      method: 'POST',
      body: JSON.stringify({
        tier: data.tier,
        payment_method: data.paymentMethod,
        billing_period: data.billingPeriod,
      }),
    });

    // Normalize response
    return {
      subscriptionId: response.subscription_id || response.subscriptionId || '',
      paymentUrl: response.payment_url || response.paymentUrl,
      clientSecret: response.client_secret || response.clientSecret,
      confirmationUrl: response.confirmation_url || response.confirmationUrl,
    };
  }

  async getSubscriptionStatus(): Promise<{
    tier: string;
    status: string;
    expiresAt?: string;
    active: boolean;
  }> {
    return this.request('/subscriptions/status');
  }

  // ==================== Journal ====================

  async createJournalEntry(data: {
    entryType: string;
    title: string;
    content: string;
    tags?: string[];
    mood?: string;
  }): Promise<JournalEntry> {
    return this.request<JournalEntry>('/journal/entry', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getJournalEntries(limit = 10, offset = 0): Promise<{ entries: JournalEntry[]; total: number }> {
    return this.request(`/journal/entries?limit=${limit}&offset=${offset}`);
  }

  async getJournalInsights(): Promise<{ insights: string; patterns: string[] }> {
    return this.request('/journal/insights');
  }

  // ==================== Numerology ====================

  async calculateNumerology(data: {
    fullName: string;
    birthDate: string;
  }): Promise<any> {
    return this.request('/numerology/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyNumerology(): Promise<any> {
    return this.request('/numerology/me');
  }

  // ==================== Dream Interpretation ====================

  async interpretDream(dreamText: string): Promise<any> {
    return this.request('/dreams/interpret', {
      method: 'POST',
      body: JSON.stringify({ dream_text: dreamText }),
    });
  }

  async getDreamHistory(limit = 10, offset = 0): Promise<any> {
    return this.request(`/dreams/history?limit=${limit}&offset=${offset}`);
  }

  // ==================== Runes ====================

  async getRuneReading(spreadType: string, question: string): Promise<any> {
    return this.request('/runes/reading', {
      method: 'POST',
      body: JSON.stringify({ spread_type: spreadType, question }),
    });
  }

  async getAllRunes(): Promise<any> {
    return this.request('/runes/all');
  }

  // ==================== I Ching ====================

  async consultIChing(question: string, method: 'coin' | 'yarrow' = 'coin'): Promise<any> {
    return this.request('/iching/consult', {
      method: 'POST',
      body: JSON.stringify({ question, method }),
    });
  }

  async getHexagrams(): Promise<any> {
    return this.request('/iching/hexagrams');
  }

  // ==================== Lenormand ====================

  async getLenormandReading(spreadType: string, question: string): Promise<any> {
    return this.request('/lenormand/reading', {
      method: 'POST',
      body: JSON.stringify({ spread_type: spreadType, question }),
    });
  }

  // ==================== Transits ====================

  async getCurrentTransits(): Promise<any> {
    return this.request('/transits/current');
  }

  async getPersonalTransits(): Promise<any> {
    const user = await this.getCurrentUser();
    return this.request(`/transits/personal/${user.id}`);
  }

  // ==================== Synastry ====================

  async calculateSynastry(data: {
    partner1BirthDate: string;
    partner1BirthTime: string;
    partner1Latitude: number;
    partner1Longitude: number;
    partner2BirthDate: string;
    partner2BirthTime: string;
    partner2Latitude: number;
    partner2Longitude: number;
  } | Record<string, unknown>, partner2Data?: Record<string, unknown>): Promise<any> {
    const payload = partner2Data ? { partner1: data, partner2: partner2Data } : data;
    return this.request('/synastry/calculate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // ==================== Lunar Calendar ====================

  async getLunarPhase(): Promise<any> {
    return this.request('/lunar/current');
  }

  async getLunarCalendar(months = 3): Promise<any> {
    return this.request(`/lunar/calendar?months=${months}`);
  }

  async getLunarRecommendations(activity?: string): Promise<any> {
    const query = activity ? `?activity=${activity}` : '';
    return this.request(`/lunar/recommendations${query}`);
  }

  // ==================== Crystals ====================

  async getAllCrystals(): Promise<any> {
    return this.request('/crystals/all');
  }

  async getCrystals(): Promise<any> {
    return this.getAllCrystals();
  }

  async getCrystalRecommendations(goal?: string): Promise<any> {
    const query = goal ? `?goal=${goal}` : '';
    return this.request(`/crystals/recommend${query}`);
  }

  async getCrystalsByZodiac(sign: string): Promise<any> {
    return this.request(`/crystals/zodiac/${sign}`);
  }

  // ==================== Rituals ====================

  async generateRitual(goal: string): Promise<any> {
    return this.request('/rituals/generate', {
      method: 'POST',
      body: JSON.stringify({ goal }),
    });
  }

  async getPersonalizedRitual(): Promise<any> {
    return this.generateRitual('personalized');
  }

  async getRitualLibrary(): Promise<any> {
    return this.request('/rituals/library');
  }

  async getRituals(): Promise<any> {
    return this.getRitualLibrary();
  }

  async getLunarRituals(): Promise<any> {
    return this.request('/rituals/lunar');
  }

  // ==================== Horary Astrology ====================

  async askHoraryQuestion(question: string): Promise<any> {
    return this.request('/horary/question', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  }

  async getHoraryAnswer(question: string): Promise<any> {
    return this.askHoraryQuestion(question);
  }

  // ==================== Chakra Analysis ====================

  async analyzeChakras(birthDate: string | Record<string, unknown>): Promise<any> {
    const payload = typeof birthDate === 'string'
      ? { birth_date: birthDate }
      : { birth_data: birthDate };
    return this.request('/chakra/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getChakraPractices(): Promise<any> {
    return this.request('/chakra/practices');
  }

  // ==================== Solar Return ====================

  async calculateSolarReturn(year: number | Record<string, unknown>): Promise<any> {
    const payload = typeof year === 'number'
      ? { year }
      : { year: new Date().getFullYear(), birth_data: year };
    return this.request('/solar-return/calculate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getSolarReturnForecast(): Promise<any> {
    return this.request('/solar-return/forecast');
  }

  // ==================== Karmic Tasks ====================

  async analyzeKarmicTasks(): Promise<any> {
    return this.request('/karmic/analyze', {
      method: 'POST',
    });
  }

  async getKarmicLessons(birthData?: Record<string, unknown>): Promise<any> {
    return this.request('/karmic/analyze', {
      method: 'POST',
      body: birthData ? JSON.stringify({ birth_data: birthData }) : undefined,
    });
  }

  async getKarmicRecommendations(): Promise<any> {
    return this.request('/karmic/recommendations');
  }

  // ==================== Mandala Generation ====================

  async generateMandala(birthDate: string, intention?: string): Promise<any> {
    return this.request('/mandala/generate', {
      method: 'POST',
      body: JSON.stringify({ birth_date: birthDate, intention }),
    });
  }

  async getMandalaInstructions(): Promise<any> {
    return this.request('/mandala/instructions');
  }

  // ==================== Chat & AI ====================

  async requestChatCompletion(
    message: string,
    options: { conversationId: string }
  ): Promise<{ content: string }> {
    return this.request(`/chat/conversations/${encodeURIComponent(options.conversationId)}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async startConversation(contextType = 'general', contextData?: Record<string, unknown>): Promise<{ id: string }> {
    return this.request('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ service_type: contextType, context_data: contextData }),
    });
  }

  async getConversationHistory(conversationId: string): Promise<any> {
    return this.request(`/chat/conversations/${encodeURIComponent(conversationId)}`);
  }

  async getTarotReadingLegacy(question: string): Promise<PredictionResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/ai/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: question,
          service_type: 'tarot',
          use_rag: true,
        }),
      });

      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (error) {
      console.error('Tarot API error:', error);
      return {
        response: 'Карты указывают на период трансформации. Важно прислушаться к внутреннему голосу.',
        sources: [],
      };
    }
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export class for testing
export { ApiClient };
