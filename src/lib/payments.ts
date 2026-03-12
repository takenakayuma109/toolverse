export interface CheckoutParams {
  toolId: string;
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
  quantity?: number;
  metadata?: Record<string, string>;
}

export interface CheckoutSession {
  id: string;
  url: string;
  status: 'pending' | 'complete' | 'expired';
  expiresAt: string;
  amountTotal: number;
  currency: string;
}

export interface SubscriptionParams {
  userId: string;
  customerId: string;
  priceId: string;
  planId: string;
  trialDays?: number;
  metadata?: Record<string, string>;
}

export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  priceId: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'paused';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'konbini';
  card?: {
    brand: 'visa' | 'mastercard' | 'amex' | 'jcb' | 'diners';
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
  createdAt: string;
}

export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  reason?: string;
  createdAt: string;
}

export interface RevenueQuery {
  startDate: string;
  endDate: string;
  granularity: 'day' | 'week' | 'month';
  creatorId?: string;
  toolId?: string;
}

export interface RevenueData {
  totalRevenue: number;
  totalTransactions: number;
  currency: string;
  platformFee: number;
  creatorPayout: number;
  dataPoints: RevenueDataPoint[];
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  transactions: number;
  refunds: number;
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  description: string;
  paidAt: string | null;
  createdAt: string;
  pdfUrl: string;
}

export interface PaymentProvider {
  name: string;
  createCheckoutSession: (params: CheckoutParams) => Promise<CheckoutSession>;
  createSubscription: (params: SubscriptionParams) => Promise<Subscription>;
  cancelSubscription: (subscriptionId: string) => Promise<void>;
  getSubscription: (subscriptionId: string) => Promise<Subscription>;
  getPaymentMethods: (customerId: string) => Promise<PaymentMethod[]>;
  addPaymentMethod: (customerId: string, token: string) => Promise<PaymentMethod>;
  removePaymentMethod: (paymentMethodId: string) => Promise<void>;
  processRefund: (paymentId: string, amount?: number) => Promise<Refund>;
  getInvoices: (customerId: string, limit?: number) => Promise<Invoice[]>;
  getRevenue: (params: RevenueQuery) => Promise<RevenueData>;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const mockId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 14)}`;

export class StripeProvider implements PaymentProvider {
  name = 'stripe';

  async createCheckoutSession(params: CheckoutParams): Promise<CheckoutSession> {
    await delay(400);
    return {
      id: mockId('cs'),
      url: `https://checkout.stripe.com/pay/${mockId('cs')}`,
      status: 'pending',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      amountTotal: 1980,
      currency: 'jpy',
    };
  }

  async createSubscription(params: SubscriptionParams): Promise<Subscription> {
    await delay(500);
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    return {
      id: mockId('sub'),
      customerId: params.customerId,
      planId: params.planId,
      priceId: params.priceId,
      status: params.trialDays ? 'trialing' : 'active',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      trialEnd: params.trialDays
        ? new Date(Date.now() + params.trialDays * 86400000).toISOString()
        : null,
      createdAt: now.toISOString(),
    };
  }

  async cancelSubscription(_subscriptionId: string): Promise<void> {
    await delay(300);
  }

  async getSubscription(_subscriptionId: string): Promise<Subscription> {
    await delay(200);
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    return {
      id: _subscriptionId,
      customerId: mockId('cus'),
      planId: 'free',
      priceId: 'price_free',
      status: 'active',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      trialEnd: null,
      createdAt: '2025-01-15T00:00:00Z',
    };
  }

  async getPaymentMethods(_customerId: string): Promise<PaymentMethod[]> {
    await delay(200);
    return [
      {
        id: mockId('pm'),
        type: 'card',
        card: { brand: 'visa', last4: '4242', expMonth: 12, expYear: 2027 },
        isDefault: true,
        createdAt: '2025-06-01T00:00:00Z',
      },
    ];
  }

  async addPaymentMethod(_customerId: string, _token: string): Promise<PaymentMethod> {
    await delay(400);
    return {
      id: mockId('pm'),
      type: 'card',
      card: { brand: 'mastercard', last4: '8888', expMonth: 6, expYear: 2028 },
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
  }

  async removePaymentMethod(_paymentMethodId: string): Promise<void> {
    await delay(200);
  }

  async processRefund(paymentId: string, amount?: number): Promise<Refund> {
    await delay(400);
    return {
      id: mockId('re'),
      paymentId,
      amount: amount ?? 1980,
      currency: 'jpy',
      status: 'succeeded',
      createdAt: new Date().toISOString(),
    };
  }

  async getInvoices(_customerId: string, limit = 6): Promise<Invoice[]> {
    await delay(300);
    const invoices: Invoice[] = [];
    for (let i = 0; i < limit; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
      invoices.push({
        id: mockId('inv'),
        number: `INV-2026-${String(date.getMonth() + 1).padStart(2, '0')}`,
        customerId: _customerId,
        subscriptionId: mockId('sub'),
        amount: i === 0 ? 1980 : 1980,
        currency: 'jpy',
        status: 'paid',
        description: `Toolverse Pro - ${monthStr}`,
        paidAt: date.toISOString(),
        createdAt: date.toISOString(),
        pdfUrl: `https://invoices.toolverse.com/${mockId('inv')}.pdf`,
      });
    }
    return invoices;
  }

  async getRevenue(params: RevenueQuery): Promise<RevenueData> {
    await delay(400);
    const dataPoints: RevenueDataPoint[] = [];
    const start = new Date(params.startDate);
    const end = new Date(params.endDate);
    const current = new Date(start);

    while (current <= end) {
      const revenue = Math.floor(Math.random() * 50000) + 10000;
      const transactions = Math.floor(Math.random() * 30) + 5;
      dataPoints.push({
        date: current.toISOString().split('T')[0],
        revenue,
        transactions,
        refunds: Math.floor(Math.random() * 3),
      });
      if (params.granularity === 'day') current.setDate(current.getDate() + 1);
      else if (params.granularity === 'week') current.setDate(current.getDate() + 7);
      else current.setMonth(current.getMonth() + 1);
    }

    const totalRevenue = dataPoints.reduce((s, d) => s + d.revenue, 0);
    const totalTransactions = dataPoints.reduce((s, d) => s + d.transactions, 0);

    return {
      totalRevenue,
      totalTransactions,
      currency: 'jpy',
      platformFee: Math.floor(totalRevenue * 0.15),
      creatorPayout: Math.floor(totalRevenue * 0.85),
      dataPoints,
    };
  }
}

export class ToolversePayProvider implements PaymentProvider {
  name = 'toolverse-pay';

  async createCheckoutSession(params: CheckoutParams): Promise<CheckoutSession> {
    await delay(300);
    return {
      id: mockId('tvcs'),
      url: `https://pay.toolverse.com/checkout/${mockId('tvcs')}`,
      status: 'pending',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      amountTotal: 1980,
      currency: 'jpy',
    };
  }

  async createSubscription(params: SubscriptionParams): Promise<Subscription> {
    await delay(400);
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    return {
      id: mockId('tvsub'),
      customerId: params.customerId,
      planId: params.planId,
      priceId: params.priceId,
      status: 'active',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      trialEnd: null,
      createdAt: now.toISOString(),
    };
  }

  async cancelSubscription(_subscriptionId: string): Promise<void> {
    await delay(200);
  }

  async getSubscription(_subscriptionId: string): Promise<Subscription> {
    await delay(200);
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    return {
      id: _subscriptionId,
      customerId: mockId('tvcus'),
      planId: 'free',
      priceId: 'tvprice_free',
      status: 'active',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      trialEnd: null,
      createdAt: '2025-01-15T00:00:00Z',
    };
  }

  async getPaymentMethods(_customerId: string): Promise<PaymentMethod[]> {
    await delay(150);
    return [];
  }

  async addPaymentMethod(_customerId: string, _token: string): Promise<PaymentMethod> {
    await delay(300);
    return {
      id: mockId('tvpm'),
      type: 'card',
      card: { brand: 'visa', last4: '1234', expMonth: 3, expYear: 2028 },
      isDefault: true,
      createdAt: new Date().toISOString(),
    };
  }

  async removePaymentMethod(_paymentMethodId: string): Promise<void> {
    await delay(150);
  }

  async processRefund(paymentId: string, amount?: number): Promise<Refund> {
    await delay(300);
    return {
      id: mockId('tvre'),
      paymentId,
      amount: amount ?? 1980,
      currency: 'jpy',
      status: 'succeeded',
      createdAt: new Date().toISOString(),
    };
  }

  async getInvoices(_customerId: string, _limit = 6): Promise<Invoice[]> {
    await delay(200);
    return [];
  }

  async getRevenue(_params: RevenueQuery): Promise<RevenueData> {
    await delay(300);
    return {
      totalRevenue: 0,
      totalTransactions: 0,
      currency: 'jpy',
      platformFee: 0,
      creatorPayout: 0,
      dataPoints: [],
    };
  }
}

let providerInstance: PaymentProvider | null = null;

export function getPaymentProvider(provider: 'stripe' | 'toolverse-pay' = 'stripe'): PaymentProvider {
  if (providerInstance && providerInstance.name === provider) return providerInstance;
  providerInstance = provider === 'toolverse-pay' ? new ToolversePayProvider() : new StripeProvider();
  return providerInstance;
}
