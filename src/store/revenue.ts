import { create } from 'zustand';
import type { CreatorTierInfo, CreatorWallet, PayoutMethodType, InfrastructureUsage, InfraServicePricing } from '@/types';

export const CREATOR_TIERS: CreatorTierInfo[] = [
  {
    tier: 'early',
    creatorShare: 95,
    platformShare: 5,
    label: 'Early Creator',
    requirements: [
      'Early Creator Program participant',
      'First 1,000 creators',
      'Limited time offer',
    ],
  },
  {
    tier: 'verified',
    creatorShare: 90,
    platformShare: 10,
    label: 'Verified Creator',
    requirements: [
      'Average rating ≥ 4.5',
      '1,000+ active users',
      '6+ months on platform',
    ],
  },
  {
    tier: 'standard',
    creatorShare: 85,
    platformShare: 15,
    label: 'Standard Creator',
    requirements: [
      'Completed creator registration',
      'Published at least 1 tool',
    ],
  },
];

export const INFRA_PRICING: InfraServicePricing[] = [
  { service: 'ai_api', name: 'AI API', unit: 'request', pricePerUnit: 0.003, freeAllowance: 1000, icon: '🤖' },
  { service: 'storage', name: 'Storage', unit: 'GB', pricePerUnit: 0.023, freeAllowance: 5, icon: '💾' },
  { service: 'database', name: 'Database', unit: '1K queries', pricePerUnit: 0.01, freeAllowance: 10000, icon: '🗄️' },
  { service: 'search', name: 'Search', unit: 'request', pricePerUnit: 0.001, freeAllowance: 5000, icon: '🔍' },
  { service: 'automation', name: 'Automation', unit: 'execution', pricePerUnit: 0.005, freeAllowance: 500, icon: '⚡' },
  { service: 'notification', name: 'Notification', unit: 'message', pricePerUnit: 0.001, freeAllowance: 1000, icon: '🔔' },
  { service: 'auth', name: 'Auth', unit: 'MAU', pricePerUnit: 0.005, freeAllowance: 1000, icon: '🔐' },
  { service: 'workspace', name: 'Workspace API', unit: 'request', pricePerUnit: 0.002, freeAllowance: 2000, icon: '📦' },
];

interface RevenueState {
  wallet: CreatorWallet | null;
  infraUsage: InfrastructureUsage[];
  isLoading: boolean;
  error: string | null;
  loadWallet: () => void;
  requestPayout: (amount: number, method: PayoutMethodType) => Promise<void>;
  updatePayoutMethod: (method: PayoutMethodType, details: string) => void;
}

export const useRevenueStore = create<RevenueState>((set, get) => ({
  wallet: null,
  infraUsage: [],
  isLoading: false,
  error: null,

  loadWallet: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/revenue');

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      set({
        wallet: data.wallet,
        infraUsage: data.infraUsage ?? [],
        isLoading: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load wallet';
      console.error('Failed to load wallet:', message);
      set({ isLoading: false, error: message });
    }
  },

  requestPayout: async (amount, method) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/revenue/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const wallet = get().wallet;

      if (wallet && data.payout) {
        // Optimistically update local state
        set({
          wallet: {
            ...wallet,
            balance: wallet.balance - amount,
            pendingPayout: wallet.pendingPayout + amount,
            payoutHistory: [
              {
                id: data.payout.id,
                amount: data.payout.amount,
                currency: data.payout.currency,
                method: data.payout.method,
                status: data.payout.status,
                requestedAt: data.payout.requestedAt,
                completedAt: null,
                reference: data.payout.reference,
              },
              ...wallet.payoutHistory,
            ],
          },
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to request payout';
      console.error('Payout request failed:', message);
      set({ isLoading: false, error: message });
    }
  },

  updatePayoutMethod: (type, details) => {
    const wallet = get().wallet;
    if (!wallet) return;
    set({
      wallet: {
        ...wallet,
        payoutMethod: { type, details, isVerified: false, addedAt: new Date().toISOString() },
      },
    });
  },
}));
