/**
 * TypeScript type definitions for the admin panel
 */

export interface User {
  id: string;
  email: string;
  fullName: string;
  subscriptionTier: 'freemium' | 'premium' | 'platinum';
  subscriptionExpires?: string;
  createdAt: string;
  lastLogin?: string;
  birthDate?: string;
  zodiacSign?: string;
  birthTime?: string;
  birthLocation?: any;
  googleId?: string;
  appleId?: string;
  telegramId?: string;
  vkId?: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  stockQuantity: number;
  isActive: boolean;
  imageUrl?: string;
  zodiacSigns?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  itemsCount: number;
}

export interface JournalEntry {
  id: string;
  userId: string;
  userEmail: string;
  entryType: string;
  title: string;
  content: string;
  tags?: string[];
  createdAt: string;
  flagged: boolean;
}

export interface Document {
  id: number;
  title: string;
  category?: string;
  source?: string;
}

export interface UserStats {
  totalUsers: number;
  freemiumUsers: number;
  premiumUsers: number;
  platinumUsers: number;
  activeUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

export interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  premiumCount: number;
  platinumCount: number;
  monthlyRevenue: number;
  annualRevenue: number;
}

export interface ServiceUsage {
  serviceName: string;
  usageCount: number;
  percentage: number;
}

export interface ModerationStats {
  totalJournalEntries: number;
  flaggedEntries: number;
  pendingReview: number;
}
