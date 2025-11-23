/**
 * API Service
 * Centralized API client for backend communication
 */

import config from '../config';
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  NatalChart,
  TarotReading,
  Horoscope,
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

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.timeout = config.api.timeout;
  }

  /**
   * Get authentication token from localStorage
   */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  /**
   * Set authentication token in localStorage
   */
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', token);
  }

  /**
   * Remove authentication token from localStorage
   */
  clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          detail: response.statusText,
        }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  // ==================== Authentication ====================

  async login(email: string, password: string): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    // Store token
    if (response.access_token) {
      this.setToken(response.access_token);
    }

    return response;
  }

  async register(data: {
    email: string;
    password: string;
    full_name: string;
    birth_date?: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store token
    if (response.access_token) {
      this.setToken(response.access_token);
    }

    return response;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async logout(): Promise<void> {
    await this.request<void>('/auth/logout', { method: 'POST' });
    this.clearToken();
  }

  // ==================== Horoscope ====================

  async getHoroscope(sign: string, period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<Horoscope> {
    try {
      return await this.request<Horoscope>(`/horoscope/${period}/${sign}`);
    } catch (error) {
      console.error('Horoscope API error:', error);
      // Fallback for development
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
  }

  // ==================== Tarot ====================

  async getTarotReading(spreadType: string, question?: string): Promise<TarotReading> {
    return this.request<TarotReading>('/tarot/reading', {
      method: 'POST',
      body: JSON.stringify({ spread_type: spreadType, question }),
    });
  }

  async getTarotHistory(limit = 10, offset = 0): Promise<{ readings: TarotReading[]; total: number }> {
    return this.request(`/tarot/history?limit=${limit}&offset=${offset}`);
  }

  // ==================== Natal Chart ====================

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

  async getNatalChart(): Promise<NatalChart> {
    const user = await this.getCurrentUser();
    return this.request<NatalChart>(`/natal/${user.id}`);
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
  }): Promise<any> {
    return this.request('/synastry/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
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

  async getRitualLibrary(): Promise<any> {
    return this.request('/rituals/library');
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

  // ==================== Chakra Analysis ====================

  async analyzeChakras(birthDate: string): Promise<any> {
    return this.request('/chakra/analyze', {
      method: 'POST',
      body: JSON.stringify({ birth_date: birthDate }),
    });
  }

  async getChakraPractices(): Promise<any> {
    return this.request('/chakra/practices');
  }

  // ==================== Solar Return ====================

  async calculateSolarReturn(year: number): Promise<any> {
    return this.request('/solar-return/calculate', {
      method: 'POST',
      body: JSON.stringify({ year }),
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

  async getKarmicRecommendations(): Promise<any> {
    return this.request('/karmic/recommendations');
  }

  // ==================== Mandala Generation ====================

  async generateMandala(birthDate: string): Promise<any> {
    return this.request('/mandala/generate', {
      method: 'POST',
      body: JSON.stringify({ birth_date: birthDate }),
    });
  }

  async getMandalaInstructions(): Promise<any> {
    return this.request('/mandala/instructions');
  }

  // ==================== Legacy Methods (for backward compatibility) ====================

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
