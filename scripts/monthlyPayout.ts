/**
 * Monthly Payout Script
 *
 * Run with: npx tsx scripts/monthlyPayout.ts
 *
 * Aggregates the previous month's revenue and creates payout records
 * for each creator based on their tier.
 */

import { runPayoutJob } from '../src/core/payouts/payoutJob';

async function main() {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  console.log(
    `Running payout for ${periodStart.toISOString()} - ${periodEnd.toISOString()}`,
  );

  const payouts = await runPayoutJob(periodStart, periodEnd);

  console.log(`Created ${payouts.length} payouts`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Payout job failed:', err);
  process.exit(1);
});
