import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { listInvoices } from '@/lib/stripe';
import { logger } from '@/lib/logger';

export async function GET() {
  let session;
  try {
    session = await requireAuth();
  } catch (res) {
    return res as NextResponse;
  }

  const userId = session.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
  }

  try {
    // Find the user's billing plan to get their Stripe subscription ID
    const billingPlan = await prisma.userBillingPlan.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!billingPlan?.stripeSubscriptionId) {
      return NextResponse.json({ invoices: [] });
    }

    // Use userId as the Stripe customer ID (set during checkout creation)
    const stripeInvoices = await listInvoices(userId, 12);

    const invoices = stripeInvoices.map((inv) => ({
      id: inv.id,
      number: inv.number ?? inv.id,
      amount: inv.amount_paid ?? inv.total ?? 0,
      currency: inv.currency,
      status: inv.status ?? 'draft',
      description: inv.description ?? `Invoice ${inv.number ?? inv.id}`,
      paidAt: inv.status === 'paid' && inv.status_transitions?.paid_at
        ? new Date(inv.status_transitions.paid_at * 1000).toISOString()
        : null,
      createdAt: new Date(inv.created * 1000).toISOString(),
      pdfUrl: inv.invoice_pdf ?? null,
    }));

    return NextResponse.json({ invoices });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Failed to fetch invoices', { error: message });
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 },
    );
  }
}
