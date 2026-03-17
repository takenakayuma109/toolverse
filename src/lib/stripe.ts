import Stripe from 'stripe';

function createStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }
  return new Stripe(key, {
    apiVersion: '2026-02-25.clover',
    typescript: true,
    maxNetworkRetries: 3,
    timeout: 30000,
  });
}

const globalForStripe = globalThis as unknown as { _stripe?: Stripe };

export const stripe: Stripe = (() => {
  if (!globalForStripe._stripe) {
    globalForStripe._stripe = createStripe();
  }
  return globalForStripe._stripe;
})();

/**
 * Create a Stripe Checkout session for one-time or subscription payments.
 */
export async function createCheckoutSession(
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>,
  customerId?: string,
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    ...(customerId ? { customer: customerId } : {}),
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: userId,
    metadata: { userId, ...metadata },
    allow_promotion_codes: true,
  });
}

/**
 * Create a Stripe billing portal session so users can manage their subscription.
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

/**
 * Create a Stripe Connect Express account for a creator.
 */
export async function createConnectAccount(
  email: string,
  country: string = 'JP',
): Promise<Stripe.Account> {
  return stripe.accounts.create({
    type: 'express',
    country,
    email,
    capabilities: {
      transfers: { requested: true },
    },
    metadata: { email },
  });
}

/**
 * Create a transfer to a connected account (creator payout).
 */
export async function createTransfer(
  amount: number,
  currency: string,
  destinationAccountId: string,
  description?: string,
): Promise<Stripe.Transfer> {
  return stripe.transfers.create({
    amount,
    currency: currency.toLowerCase(),
    destination: destinationAccountId,
    description,
  });
}

/**
 * Fetch a subscription's details from Stripe.
 */
export async function getSubscription(
  subscriptionId: string,
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel a subscription at the end of the current billing period.
 */
export async function cancelSubscription(
  subscriptionId: string,
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * List invoices for a customer.
 */
export async function listInvoices(
  customerId: string,
  limit: number = 10,
): Promise<Stripe.Invoice[]> {
  const response = await stripe.invoices.list({
    customer: customerId,
    limit,
  });
  return response.data;
}

/**
 * List payment methods for a customer.
 */
export async function listPaymentMethods(
  customerId: string,
): Promise<Stripe.PaymentMethod[]> {
  const response = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  });
  return response.data;
}

/**
 * Construct and verify a webhook event from a raw body and signature.
 */
export function constructWebhookEvent(
  body: string | Buffer,
  signature: string,
  webhookSecret: string,
): Stripe.Event {
  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}
