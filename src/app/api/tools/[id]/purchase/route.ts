import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { requireAuth } from '@/lib/auth-helpers';
import { errorResponse, withErrorHandler } from '@/lib/api-utils';

type Params = { params: Promise<{ id: string }> };

// ---------------------------------------------------------------------------
// POST /api/tools/[id]/purchase — Create a Stripe Checkout session
// Body: { priceType: 'one_time' | 'subscription' }
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest, { params }: Params) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;
    const { id: toolId } = await params;

    const body = await request.json();
    const { priceType } = body as { priceType?: string };

    if (!priceType || !['one_time', 'subscription'].includes(priceType)) {
      return errorResponse('Invalid priceType. Must be "one_time" or "subscription".', 400);
    }

    // Fetch the tool and its pricing info
    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
      include: {
        creator: { select: { userId: true, stripeConnectId: true } },
      },
    });

    if (!tool) {
      return errorResponse('Tool not found', 404);
    }

    if (tool.status !== 'PUBLISHED') {
      return errorResponse('Tool is not available for purchase', 400);
    }

    if (tool.pricingType === 'free') {
      return errorResponse('This tool is free and does not require purchase', 400);
    }

    if (!tool.price) {
      return errorResponse('Tool does not have a price configured', 400);
    }

    const currency = tool.currency || 'USD';
    const unitAmount = Math.round(Number(tool.price) * 100); // Convert to cents

    const mode = priceType === 'subscription' ? 'subscription' : 'payment';
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Build Stripe Checkout session params
    const checkoutParams: Record<string, unknown> = {
      mode,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: unitAmount,
            product_data: {
              name: tool.name,
              description: tool.description,
            },
            ...(mode === 'subscription'
              ? { recurring: { interval: tool.period === 'yearly' ? 'year' : 'month' } }
              : {}),
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/discover/${tool.slug}?purchase=success`,
      cancel_url: `${origin}/discover/${tool.slug}?purchase=cancelled`,
      client_reference_id: userId,
      metadata: {
        userId,
        toolId: tool.id,
        creatorId: tool.creatorId,
      },
    };

    // Apply platform fee via Stripe Connect if creator has a connected account
    if (tool.creator.stripeConnectId) {
      checkoutParams.payment_intent_data =
        mode === 'payment'
          ? {
              application_fee_amount: Math.round(unitAmount * 0.15),
              transfer_data: { destination: tool.creator.stripeConnectId },
            }
          : undefined;

      if (mode === 'subscription') {
        checkoutParams.subscription_data = {
          application_fee_percent: 15,
          transfer_data: { destination: tool.creator.stripeConnectId },
        };
      }
    }

    const checkoutSession = await stripe.checkout.sessions.create(checkoutParams);

    return NextResponse.json({ url: checkoutSession.url });
  });
}
