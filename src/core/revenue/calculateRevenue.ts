import type { CreatorTier } from '../../generated/prisma/client';

/**
 * Calculate revenue split between platform and creator.
 * Amount is in the smallest currency unit (e.g. cents for USD, yen for JPY).
 */
export function calculateRevenue(amount: number, rate: number) {
  const platformFee = Math.floor(amount * rate);
  const creatorRevenue = amount - platformFee;
  return { platformFee, creatorRevenue };
}

/**
 * Revenue share rates by creator tier.
 * Early: 5% platform fee (creator keeps 95%)
 * Verified: 10% platform fee (creator keeps 90%)
 * Standard: 15% platform fee (creator keeps 85%)
 */
export function getRevenueShareRate(tier: CreatorTier): number {
  switch (tier) {
    case 'EARLY':
      return 0.05;
    case 'VERIFIED':
      return 0.10;
    case 'STANDARD':
    default:
      return 0.15;
  }
}
