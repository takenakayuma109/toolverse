export type Locale = 'ja' | 'en' | 'zh' | 'ko' | 'fr' | 'de' | 'es' | 'pt' | 'ar' | 'ru' | 'hi';

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
  targetCountries: string[]; // ISO 3166-1 alpha-2 codes, empty = worldwide
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
  | 'analytics'
  | 'security'
  | 'healthcare'
  | 'education'
  | 'ecommerce'
  | 'communication'
  | 'iot'
  | 'media'
  | 'logistics';

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

export type CreatorTier = 'early' | 'verified' | 'standard';

export interface CreatorTierInfo {
  tier: CreatorTier;
  creatorShare: number; // percentage (95, 90, 85)
  platformShare: number; // percentage (5, 10, 15)
  label: string;
  requirements: string[];
}

export interface CreatorWallet {
  id: string;
  creatorId: string;
  tier: CreatorTier;
  balance: number;
  pendingPayout: number;
  lifetimeEarnings: number;
  lifetimePlatformFee: number;
  currency: string;
  payoutMethod: PayoutMethod | null;
  payoutHistory: PayoutRecord[];
  monthlyRevenue: MonthlyRevenue[];
}

export type PayoutMethodType = 'stripe_connect' | 'bank_transfer' | 'paypal';

export interface PayoutMethod {
  type: PayoutMethodType;
  details: string; // masked info like "****1234" or "paypal@email.com"
  isVerified: boolean;
  addedAt: string;
}

export interface PayoutRecord {
  id: string;
  amount: number;
  currency: string;
  method: PayoutMethodType;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  completedAt: string | null;
  reference: string;
}

export interface MonthlyRevenue {
  month: string; // "2026-03"
  grossRevenue: number;
  creatorShare: number;
  platformFee: number;
  refunds: number;
  netPayout: number;
  transactions: number;
}

export interface InfrastructureUsage {
  service: InfraService;
  usage: number;
  unit: string;
  cost: number;
  period: string;
}

export type InfraService = 'ai_api' | 'storage' | 'database' | 'search' | 'automation' | 'notification' | 'auth' | 'workspace';

export interface InfraServicePricing {
  service: InfraService;
  name: string;
  unit: string;
  pricePerUnit: number;
  freeAllowance: number;
  icon: string;
}

// ─── API Usage Billing ─────────────────────────────────────────────────────────

export type CreditTransactionType = 'PURCHASE' | 'USAGE' | 'REFUND' | 'BONUS';

export interface CreditBalance {
  id: string;
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreditTransaction {
  id: string;
  balanceId: string;
  type: CreditTransactionType;
  amount: number;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ApiUsageRecord {
  id: string;
  userId: string;
  toolId?: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  rawCost: number;
  markupRate: number;
  totalCost: number;
  durationMs?: number;
  createdAt: string;
}

export interface ApiProviderConfig {
  id: string;
  provider: string;
  model: string;
  inputPricePerM: number;
  outputPricePerM: number;
  isActive: boolean;
}
