/**
 * TypeScript Interfaces for Data Models
 */

// User
export interface User {
  id: string;
  email: string;
  fullName: string;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: BirthLocation;
  zodiacSign?: string;
  subscriptionTier: 'freemium' | 'premium' | 'platinum';
  subscriptionExpires?: string;
  preferredLanguage: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface BirthLocation {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

// Natal Chart
export interface NatalChart {
  id: string;
  userId: string;
  planets: Record<string, PlanetPosition>;
  houses: HousePosition[];
  aspects: Aspect[];
  calculatedAt: string;
}

export interface PlanetPosition {
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
}

export interface HousePosition {
  number: number;
  sign: string;
  degree: number;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
  orb: number;
}

// Tarot
export interface TarotReading {
  id: string;
  userId: string;
  spread: 'one-card' | 'three-card' | 'celtic-cross';
  cards: TarotCard[];
  interpretation: string;
  question?: string;
  createdAt: string;
}

export interface TarotCard {
  id: string;
  name: string;
  suit: string;
  number: number;
  position: string;
  reversed: boolean;
  meaning: string;
  imageUrl: string;
}

// Horoscope
export interface Horoscope {
  id: string;
  sign: string;
  period: 'daily' | 'weekly' | 'monthly';
  date: string;
  prediction: string;
  plainText?: string;
  richText?: string;
  language?: string;
  periodRangeLabel?: string;
  luckyNumbers?: number[];
  luckyColors?: string[];
  compatibility?: string[];
  advice?: string;
  bestTimeWindows?: string[];
  ratings?: {
    finance: number;
    love: number;
    career: number;
    health: number;
  };
  explanations?: {
    financeReason?: string;
    loveReason?: string;
    careerReason?: string;
    healthReason?: string;
  };
  is_personalized?: boolean;
  transit_data?: Record<string, unknown>;
  clarify_available?: boolean;
  horoscope_id?: string;
}

// AI Query
export interface AIQuery {
  query: string;
  serviceType: 'horoscope' | 'tarot' | 'natal' | 'dream' | 'general';
  useRag?: boolean;
  stream?: boolean;
  context?: Record<string, any>;
}

export interface AIResponse {
  response: string;
  cached?: boolean;
  processingTime?: number;
}

// Document (RAG)
export interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
  source?: string;
  createdAt: string;
}

// Subscription
export interface Subscription {
  id: string;
  userId: string;
  tier: 'premium' | 'platinum';
  status: 'active' | 'cancelled' | 'expired';
  paymentMethod: string;
  amount: number;
  currency: string;
  startsAt: string;
  expiresAt: string;
  createdAt: string;
}

// Chat
export * from './chat';
