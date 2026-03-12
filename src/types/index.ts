export type Locale = 'ja' | 'en';

export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  icon: string;
  category: ToolCategory;
  pricing: ToolPricing;
  rating: number;
  reviewCount: number;
  userCount: number;
  isOfficial: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  creatorId: string;
  creatorName: string;
  tags: string[];
  screenshots: string[];
  createdAt: string;
  updatedAt: string;
}

export type ToolCategory =
  | 'ai'
  | 'productivity'
  | 'finance'
  | 'marketing'
  | 'development'
  | 'creator'
  | 'automation'
  | 'analytics';

export interface ToolPricing {
  type: 'free' | 'freemium' | 'paid' | 'subscription';
  price?: number;
  currency?: string;
  period?: 'monthly' | 'yearly';
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'creator' | 'admin';
  locale: Locale;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  toolIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Creator {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  website?: string;
  tools: Tool[];
  totalRevenue: number;
  monthlyRevenue: number;
  totalUsers: number;
}

export interface Review {
  id: string;
  toolId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: 'monthly' | 'yearly';
  features: string[];
}
