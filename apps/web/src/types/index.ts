/**
 * TypeScript type definitions for the web application
 * Re-exports common types from shared-core to ensure consistency
 */

export * from '@mirastros-universal/shared-core';
import type { User } from '@mirastros-universal/shared-core';

// Web-specific types (extended or new)

// Authentication types (extended for local usage if needed)
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  preferredLanguage?: string;
  timezone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Shop types (If not in shared-core)
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

// Journal types (If not in shared-core)
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

// Destiny Matrix types (If not in shared-core)
export interface DestinyMatrix {
  id?: string;
  birth_date: string;
  calculation_version?: 'v1' | 'v2';
  matrix_data: number[][]; // 4x4 grid
  lines: {
    destiny: number;
    character: number;
    purpose: number;
    health: number;
  };
  lines_basic: {
    destiny: number;
    character: number;
    purpose: number;
    health: number;
  };
  lines_extended: {
    line_of_earth: number[];
    line_of_heaven: number[];
    line_of_man: number[];
    line_of_woman: number[];
  };
  positions: Record<string, number>;
  layout_meta?: Record<string, unknown>;
  active_arcana: number[];
  interpretation: string;
  matrix_id?: string;
  clarify_available?: boolean;
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

// Consultation history (unified)
export type ConsultationServiceType =
  | 'tarot'
  | 'numerology'
  | 'iching'
  | 'dreams'
  | 'lenormand'
  | 'synastry';export interface ConsultationHistoryItem {
  id: string;
  type: ConsultationServiceType;
  title: string;
  question: string | null;
  preview: string;
  created_at: string;
  is_favorite: boolean;
}export interface ConsultationHistoryResponse {
  items: ConsultationHistoryItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ConsultationDetailResponse {
  id: string;
  type: ConsultationServiceType;
  title: string;
  question: string | null;
  result: string;
  created_at: string;
  is_favorite: boolean;
  raw: Record<string, unknown>;
}

export interface HistoryStatsResponse {
  total_consultations: number;
  by_service: Record<string, number>;
  most_used_service: string;
  first_consultation_at: string | null;
  last_consultation_at: string | null;
  favorites_count: number;
}
