/**
 * Analytics tracking utilities for frontend applications
 */

export enum AnalyticsEvent {
  // User lifecycle
  USER_REGISTERED = 'user_registered',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  
  // Subscription
  SUBSCRIPTION_CREATED = 'subscription_created',
  SUBSCRIPTION_UPGRADED = 'subscription_upgraded',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  
  // Service usage
  SERVICE_TAROT = 'service_tarot',
  SERVICE_HOROSCOPE = 'service_horoscope',
  SERVICE_NATAL_CHART = 'service_natal_chart',
  SERVICE_NUMEROLOGY = 'service_numerology',
  SERVICE_DREAM = 'service_dream',
  SERVICE_RUNES = 'service_runes',
  SERVICE_ICHING = 'service_iching',
  SERVICE_LENORMAND = 'service_lenormand',
  SERVICE_TRANSITS = 'service_transits',
  SERVICE_SYNASTRY = 'service_synastry',
  SERVICE_LUNAR = 'service_lunar',
  SERVICE_CRYSTALS = 'service_crystals',
  SERVICE_RITUALS = 'service_rituals',
  SERVICE_HORARY = 'service_horary',
  SERVICE_CHAKRA = 'service_chakra',
  SERVICE_SOLAR_RETURN = 'service_solar_return',
  SERVICE_KARMIC = 'service_karmic',
  SERVICE_MANDALA = 'service_mandala',
  
  // AI assistant
  AI_CHAT_STARTED = 'ai_chat_started',
  AI_CHAT_MESSAGE = 'ai_chat_message',
  
  // Shop
  SHOP_PRODUCT_VIEW = 'shop_product_view',
  SHOP_CART_ADD = 'shop_cart_add',
  SHOP_ORDER_CREATED = 'shop_order_created',
  
  // Journal
  JOURNAL_ENTRY_CREATED = 'journal_entry_created',
}

interface AnalyticsConfig {
  apiUrl: string;
  platform: 'web' | 'mobile' | 'telegram' | 'vk';
  getAuthToken?: () => string | null;
}

class AnalyticsService {
  private config: AnalyticsConfig;
  private sessionId: string;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track an analytics event
   */
  async track(
    event: AnalyticsEvent,
    metadata?: Record<string, any>,
    responseTimeMs?: number
  ): Promise<void> {
    try {
      const token = this.config.getAuthToken?.();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Platform': this.config.platform,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${this.config.apiUrl}/analytics/track`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          event_type: event,
          metadata,
          platform: this.config.platform,
          session_id: this.sessionId,
          response_time_ms: responseTimeMs,
        }),
      });
    } catch (error) {
      // Silently fail - don't disrupt user experience
      console.warn('Analytics tracking failed:', error);
    }
  }

  /**
   * Track page view
   */
  async trackPageView(pageName: string, metadata?: Record<string, any>): Promise<void> {
    await this.track(AnalyticsEvent.SERVICE_TAROT, {
      page: pageName,
      ...metadata,
    });
  }

  /**
   * Track service usage with timing
   */
  async trackServiceUsage(
    service: AnalyticsEvent,
    startTime: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    const responseTimeMs = Date.now() - startTime;
    await this.track(service, metadata, responseTimeMs);
  }
}

// Singleton instance
let analyticsInstance: AnalyticsService | null = null;

/**
 * Initialize analytics service
 */
export function initAnalytics(config: AnalyticsConfig): void {
  analyticsInstance = new AnalyticsService(config);
}

/**
 * Get analytics instance
 */
export function getAnalytics(): AnalyticsService {
  if (!analyticsInstance) {
    throw new Error('Analytics not initialized. Call initAnalytics() first.');
  }
  return analyticsInstance;
}

/**
 * Track an event (convenience function)
 */
export async function trackEvent(
  event: AnalyticsEvent,
  metadata?: Record<string, any>,
  responseTimeMs?: number
): Promise<void> {
  try {
    const analytics = getAnalytics();
    await analytics.track(event, metadata, responseTimeMs);
  } catch (error) {
    console.warn('Analytics not initialized');
  }
}

/**
 * Track service usage with automatic timing
 */
export function withAnalytics<T>(
  service: AnalyticsEvent,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const startTime = Date.now();
  
  return fn().then(
    (result) => {
      trackEvent(service, metadata, Date.now() - startTime);
      return result;
    },
    (error) => {
      trackEvent(service, { ...metadata, error: true }, Date.now() - startTime);
      throw error;
    }
  );
}
