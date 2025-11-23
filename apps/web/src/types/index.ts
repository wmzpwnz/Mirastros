/**
 * TypeScript type definitions for the web application
 */

// User types
export interface User {
  id: string;
  email: string;
  fullName: string;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  zodiacSign?: string;
  subscriptionTier: 'freemium' | 'premium' | 'platinum';
  subscriptionExpires?: string;
  createdAt: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Natal Chart types
export interface PlanetPosition {
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
}

export interface NatalChart {
  id: string;
  userId: string;
  planets: {
    sun: PlanetPosition;
    moon: PlanetPosition;
    mercury: PlanetPosition;
    venus: PlanetPosition;
    mars: PlanetPosition;
    jupiter: PlanetPosition;
    saturn: PlanetPosition;
    uranus: PlanetPosition;
    neptune: PlanetPosition;
    pluto: PlanetPosition;
  };
  houses: Array<{
    number: number;
    sign: string;
    degree: number;
  }>;
  aspects: Array<{
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
  }>;
  calculatedAt: string;
}

// Tarot types
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

export interface TarotReading {
  id: string;
  userId: string;
  spread: string;
  cards: TarotCard[];
  interpretation: string;
  question?: string;
  createdAt: string;
}

// Horoscope types
export interface Horoscope {
  id: string;
  sign: string;
  period: 'daily' | 'weekly' | 'monthly';
  date: string;
  prediction: string;
  luckyNumbers: number[];
  luckyColors: string[];
  compatibility: string[];
  advice: string;
}

// Shop types
export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'crystals' | 'tarot-decks' | 'books' | 'ritual-items';
  price: number;
  currency: string;
  stockQuantity: number;
  imageUrl?: string;
  zodiacSigns?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  paymentMethod?: string;
  paymentId?: string;
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Payment types
export interface PaymentIntent {
  paymentId: string;
  status: string;
  amount: number;
  currency: string;
  confirmationUrl?: string;
  clientSecret?: string;
}

// Journal types
export interface JournalEntry {
  id: string;
  userId: string;
  entryType: 'dream' | 'meditation' | 'reading' | 'ritual' | 'general';
  title: string;
  content: string;
  tags: string[];
  mood?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Form types
export interface FormErrors {
  [key: string]: string;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}

// Service types
export type ServiceType =
  | 'tarot'
  | 'horoscope'
  | 'natal'
  | 'numerology'
  | 'dream'
  | 'runes'
  | 'iching'
  | 'lenormand'
  | 'transits'
  | 'synastry'
  | 'lunar'
  | 'crystals'
  | 'rituals'
  | 'horary'
  | 'chakra'
  | 'solar-return'
  | 'karmic'
  | 'mandala'
  | 'journal';

export interface Service {
  id: ServiceType;
  name: string;
  description: string;
  icon: string;
  href: string;
  tier: 'freemium' | 'premium' | 'platinum';
}
