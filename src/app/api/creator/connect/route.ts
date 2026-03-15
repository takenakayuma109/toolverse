import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth-helpers';
import { stripe, createConnectAccount } from '@/lib/stripe';
import { errorResponse, withErrorHandler } from '@/lib/api-utils';

// ---------------------------------------------------------------------------
// POST /api/creator/connect — Initiate Stripe Connect onboarding
// ---------------------------------------------------------------------------

export async function POST() {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;
    const userRole = (session.user as { role?: string }).role;

    if (userRole !== 'CREATOR' && userRole !== 'ADMIN') {
      return errorResponse('Creator role required', 403);
    }

    const creator = await prisma.creatorProfile.findUnique({
      where: { userId },
      include: { user: { select: { email: true } } },
    });

    if (!creator) {
      return errorResponse('Creator profile not found', 404);
    }

    let connectAccountId = creator.stripeConnectId;

    // Create a new Connect account if one doesn't exist
    if (!connectAccountId) {
      const account = await createConnectAccount(creator.user.email);
      connectAccountId = account.id;

      await prisma.creatorProfile.update({
        where: { userId },
        data: { stripeConnectId: connectAccountId },
      });
    }

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: connectAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/creator/connect?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/creator/connect?success=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  });
}

// ---------------------------------------------------------------------------
// GET /api/creator/connect — Get Connect account status / dashboard link
// ---------------------------------------------------------------------------

export async function GET() {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;
    const userRole = (session.user as { role?: string }).role;

    if (userRole !== 'CREATOR' && userRole !== 'ADMIN') {
      return errorResponse('Creator role required', 403);
    }

    const creator = await prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (!creator) {
      return errorResponse('Creator profile not found', 404);
    }

    if (!creator.stripeConnectId) {
      return NextResponse.json({
        connected: false,
        message: 'No Stripe Connect account linked. Use POST to start onboarding.',
      });
    }

    // Retrieve account details from Stripe
    const account = await stripe.accounts.retrieve(creator.stripeConnectId);

    // If onboarding is complete, create a login link to the Express dashboard
    let dashboardUrl: string | null = null;
    if (account.details_submitted) {
      const loginLink = await stripe.accounts.createLoginLink(creator.stripeConnectId);
      dashboardUrl = loginLink.url;
    }

    return NextResponse.json({
      connected: true,
      accountId: creator.stripeConnectId,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      dashboardUrl,
    });
  });
}
