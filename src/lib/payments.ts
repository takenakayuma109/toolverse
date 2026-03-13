import {
  stripe,
  createCheckoutSession as stripeCreateCheckout,
  getSubscription as stripeGetSubscription,
  cancelSubscription as stripeCancelSubscription,
  listInvoices as stripeListInvoices,
  listPaymentMethods as stripeListPaymentMethods,
} from '@/lib/stripe';
import type Stripe from 'stripe';

// ─── Shared interfaces (backward compatible) ─────────────────────────────────

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

// ─── Stripe status mappers ────────────────────────────────────────────────────

function mapStripeSubStatus(
  status: Stripe.Subscription.Status,
): Subscription['status'] {
  const map: Record<string, Subscription['status']> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'canceled',
    incomplete: 'incomplete',
    incomplete_expired: 'canceled',
    unpaid: 'past_due',
    paused: 'paused',
  };
  return map[status] ?? 'incomplete';
}

function mapStripeInvoiceStatus(
  status: Stripe.Invoice.Status | null,
): Invoice['status'] {
  if (!status) return 'draft';
  const map: Record<string, Invoice['status']> = {
    draft: 'draft',
    open: 'open',
    paid: 'paid',
    void: 'void',
    uncollectible: 'uncollectible',
  };
  return map[status] ?? 'draft';
}

function toCardBrand(brand: string): PaymentMethod['card'] extends infer C ? C extends { brand: infer B } ? B : never : never {
  const normalized = brand.toLowerCase();
  const valid = ['visa', 'mastercard', 'amex', 'jcb', 'diners'] as const;
  return (valid.includes(normalized as typeof valid[number])
    ? normalized
    : 'visa') as typeof valid[number];
}

function toISOString(ts: number | null | undefined): string {
  if (!ts) return new Date().toISOString();
  return new Date(ts * 1000).toISOString();
}

// ─── Real Stripe Provider ─────────────────────────────────────────────────────

export class StripeProvider implements PaymentProvider {
  name = 'stripe';

  async createCheckoutSession(params: CheckoutParams): Promise<CheckoutSession> {
    const session = await stripeCreateCheckout(
      params.userId,
      params.priceId,
      params.successUrl,
      params.cancelUrl,
      { toolId: params.toolId, ...params.metadata },
    );

    return {
      id: session.id,
      url: session.url ?? '',
      status: session.status === 'complete' ? 'complete' : 'pending',
      expiresAt: toISOString(session.expires_at),
      amountTotal: session.amount_total ?? 0,
      currency: session.currency ?? 'jpy',
    };
  }

  async createSubscription(params: SubscriptionParams): Promise<Subscription> {
    const subParams: Stripe.SubscriptionCreateParams = {
      customer: params.customerId,
      items: [{ price: params.priceId }],
      metadata: { userId: params.userId, planId: params.planId, ...params.metadata },
    };

    if (params.trialDays) {
      subParams.trial_period_days = params.trialDays;
    }

    const sub = await stripe.subscriptions.create(subParams);

    return {
      id: sub.id,
      customerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
      planId: params.planId,
      priceId: params.priceId,
      status: mapStripeSubStatus(sub.status),
      currentPeriodStart: toISOString(sub.billing_cycle_anchor),
      currentPeriodEnd: toISOString(sub.billing_cycle_anchor),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      trialEnd: sub.trial_end ? toISOString(sub.trial_end) : null,
      createdAt: toISOString(sub.created),
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await stripeCancelSubscription(subscriptionId);
  }

  async getSubscription(subscriptionId: string): Promise<Subscription> {
    const sub = await stripeGetSubscription(subscriptionId);
    const item = sub.items.data[0];

    return {
      id: sub.id,
      customerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
      planId: (sub.metadata?.planId as string) ?? '',
      priceId: typeof item?.price === 'object' ? item.price.id : '',
      status: mapStripeSubStatus(sub.status),
      currentPeriodStart: toISOString(sub.billing_cycle_anchor),
      currentPeriodEnd: toISOString(sub.billing_cycle_anchor),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      trialEnd: sub.trial_end ? toISOString(sub.trial_end) : null,
      createdAt: toISOString(sub.created),
    };
  }

  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    const methods = await stripeListPaymentMethods(customerId);
    const customer = await stripe.customers.retrieve(customerId);
    const defaultPmId =
      typeof customer !== 'string' && !customer.deleted
        ? (customer.invoice_settings?.default_payment_method as string | null)
        : null;

    return methods.map((pm) => ({
      id: pm.id,
      type: 'card' as const,
      card: pm.card
        ? {
            brand: toCardBrand(pm.card.brand),
            last4: pm.card.last4 ?? '****',
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year,
          }
        : undefined,
      isDefault: pm.id === defaultPmId,
      createdAt: toISOString(pm.created),
    }));
  }

  async addPaymentMethod(customerId: string, token: string): Promise<PaymentMethod> {
    const pm = await stripe.paymentMethods.attach(token, {
      customer: customerId,
    });

    return {
      id: pm.id,
      type: 'card',
      card: pm.card
        ? {
            brand: toCardBrand(pm.card.brand),
            last4: pm.card.last4 ?? '****',
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year,
          }
        : undefined,
      isDefault: false,
      createdAt: toISOString(pm.created),
    };
  }

  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    await stripe.paymentMethods.detach(paymentMethodId);
  }

  async processRefund(paymentId: string, amount?: number): Promise<Refund> {
    const params: Stripe.RefundCreateParams = {
      payment_intent: paymentId,
    };
    if (amount !== undefined) {
      params.amount = amount;
    }

    const refund = await stripe.refunds.create(params);

    return {
      id: refund.id,
      paymentId,
      amount: refund.amount,
      currency: refund.currency,
      status:
        refund.status === 'succeeded'
          ? 'succeeded'
          : refund.status === 'failed'
            ? 'failed'
            : 'pending',
      createdAt: toISOString(refund.created),
    };
  }

  async getInvoices(customerId: string, limit = 10): Promise<Invoice[]> {
    const invoices = await stripeListInvoices(customerId, limit);

    return invoices.map((inv) => ({
      id: inv.id,
      number: inv.number ?? inv.id,
      customerId: typeof inv.customer === 'string' ? inv.customer : inv.customer?.id ?? '',
      subscriptionId: (() => {
        const subRef = inv.parent?.subscription_details?.subscription;
        return typeof subRef === 'string' ? subRef : subRef?.id ?? '';
      })(),
      amount: inv.amount_paid ?? inv.total ?? 0,
      currency: inv.currency,
      status: mapStripeInvoiceStatus(inv.status),
      description: inv.description ?? `Invoice ${inv.number ?? inv.id}`,
      paidAt: inv.status === 'paid' && inv.status_transitions?.paid_at
        ? toISOString(inv.status_transitions.paid_at)
        : null,
      createdAt: toISOString(inv.created),
      pdfUrl: inv.invoice_pdf ?? '',
    }));
  }

  async getRevenue(params: RevenueQuery): Promise<RevenueData> {
    // Revenue data is fetched from the database via the /api/revenue endpoint.
    // This method is kept for interface compatibility but delegates to the API.
    const response = await fetch(
      `/api/revenue?startDate=${params.startDate}&endDate=${params.endDate}&granularity=${params.granularity}` +
        (params.creatorId ? `&creatorId=${params.creatorId}` : '') +
        (params.toolId ? `&toolId=${params.toolId}` : ''),
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch revenue data: ${response.statusText}`);
    }

    return response.json();
  }
}

// ─── Provider Singleton ───────────────────────────────────────────────────────

let providerInstance: PaymentProvider | null = null;

export function getPaymentProvider(provider: 'stripe' | 'toolverse-pay' = 'stripe'): PaymentProvider {
  if (providerInstance && providerInstance.name === provider) return providerInstance;
  // All providers now use Stripe under the hood
  providerInstance = new StripeProvider();
  return providerInstance;
}
