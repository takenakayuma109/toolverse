/**
 * Stripe Product & Price Setup Script
 *
 * Creates Toolverse billing plan products and prices in Stripe.
 * Run with: npx tsx scripts/stripe-setup.ts
 *
 * Uses STRIPE_SECRET_KEY from .env (supports both test and live keys).
 */
import 'dotenv/config';
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is required. Set it in .env');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' });

const PLANS = [
  {
    id: 'pro',
    name: 'Toolverse Pro',
    description: 'For professional developers — unlimited apps, 50K MAU, priority support',
    monthlyPrice: 1980, // JPY
    yearlyPrice: 19800,  // JPY (2 months free)
  },
  {
    id: 'team',
    name: 'Toolverse Team',
    description: 'For teams — unlimited MAU, collaboration, SLA & dedicated support',
    monthlyPrice: 4980,  // JPY
    yearlyPrice: 49800,  // JPY (2 months free)
  },
];

async function main() {
  const isTest = STRIPE_SECRET_KEY!.startsWith('sk_test_');
  console.log(`\n🔧 Stripe Setup (${isTest ? 'TEST MODE' : '⚠️  LIVE MODE'})\n`);

  for (const plan of PLANS) {
    // Check if product already exists
    const existing = await stripe.products.search({
      query: `metadata["toolverse_plan"]:"${plan.id}"`,
    });

    let product: Stripe.Product;

    if (existing.data.length > 0) {
      product = existing.data[0];
      console.log(`✅ Product "${plan.name}" already exists: ${product.id}`);
    } else {
      product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: { toolverse_plan: plan.id },
      });
      console.log(`✨ Created product "${plan.name}": ${product.id}`);
    }

    // Create monthly price
    const monthlyPrices = await stripe.prices.list({
      product: product.id,
      type: 'recurring',
      active: true,
    });

    const existingMonthly = monthlyPrices.data.find(
      (p) => p.recurring?.interval === 'month' && p.unit_amount === plan.monthlyPrice
    );

    if (existingMonthly) {
      console.log(`  ✅ Monthly price exists: ${existingMonthly.id} (¥${plan.monthlyPrice}/月)`);
    } else {
      const monthly = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.monthlyPrice,
        currency: 'jpy',
        recurring: { interval: 'month' },
        metadata: { toolverse_plan: plan.id, period: 'monthly' },
      });
      console.log(`  ✨ Created monthly price: ${monthly.id} (¥${plan.monthlyPrice}/月)`);
    }

    // Create yearly price
    const existingYearly = monthlyPrices.data.find(
      (p) => p.recurring?.interval === 'year' && p.unit_amount === plan.yearlyPrice
    );

    if (existingYearly) {
      console.log(`  ✅ Yearly price exists: ${existingYearly.id} (¥${plan.yearlyPrice}/年)`);
    } else {
      const yearly = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.yearlyPrice,
        currency: 'jpy',
        recurring: { interval: 'year' },
        metadata: { toolverse_plan: plan.id, period: 'yearly' },
      });
      console.log(`  ✨ Created yearly price: ${yearly.id} (¥${plan.yearlyPrice}/年)`);
    }
  }

  console.log('\n✅ Setup complete!\n');
  console.log('Next steps:');
  console.log('1. Copy the price IDs above');
  console.log('2. Set them in your .env or Vercel environment variables');
  console.log('3. Update PLANS in BillingPage.tsx with real price IDs');
  console.log('');
}

main().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
