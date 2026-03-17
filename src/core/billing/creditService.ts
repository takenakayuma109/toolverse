import { prisma } from '@/lib/db';
import { Prisma } from '../../generated/prisma/client';

/**
 * Get or create a credit balance for a user.
 */
export async function getOrCreateBalance(userId: string) {
  return prisma.creditBalance.upsert({
    where: { userId },
    create: { userId, balance: 0 },
    update: {},
  });
}

/**
 * Get the current credit balance for a user.
 * Returns 0 if no balance record exists.
 */
export async function getBalance(userId: string): Promise<number> {
  const balance = await prisma.creditBalance.findUnique({
    where: { userId },
  });
  return balance ? Number(balance.balance) : 0;
}

/**
 * Check if a user has enough credits for a given amount.
 */
export async function hasEnoughCredits(userId: string, amount: number): Promise<boolean> {
  const balance = await getBalance(userId);
  return balance >= amount;
}

/**
 * Add credits to a user's balance (purchase, refund, bonus).
 * Uses a Prisma transaction for atomicity.
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: 'PURCHASE' | 'REFUND' | 'BONUS',
  description?: string,
  metadata?: Record<string, unknown>,
) {
  return prisma.$transaction(async (tx) => {
    const balance = await tx.creditBalance.upsert({
      where: { userId },
      create: { userId, balance: amount },
      update: {
        balance: { increment: amount },
      },
    });

    const transaction = await tx.creditTransaction.create({
      data: {
        balanceId: balance.id,
        type,
        amount: new Prisma.Decimal(amount),
        description,
        metadata: metadata as Prisma.InputJsonValue ?? undefined,
      },
    });

    return { balance, transaction };
  });
}

/**
 * Deduct credits from a user's balance (API usage).
 * Throws an error if the user has insufficient credits.
 * Uses a Prisma transaction for atomicity.
 */
export async function deductCredits(
  userId: string,
  amount: number,
  description?: string,
  metadata?: Record<string, unknown>,
) {
  return prisma.$transaction(async (tx) => {
    const balance = await tx.creditBalance.findUnique({
      where: { userId },
    });

    if (!balance || Number(balance.balance) < amount) {
      throw new Error('Insufficient credits');
    }

    const updated = await tx.creditBalance.update({
      where: { userId },
      data: {
        balance: { decrement: amount },
      },
    });

    const transaction = await tx.creditTransaction.create({
      data: {
        balanceId: balance.id,
        type: 'USAGE',
        amount: new Prisma.Decimal(-amount), // negative for deduction
        description,
        metadata: metadata as Prisma.InputJsonValue ?? undefined,
      },
    });

    return { balance: updated, transaction };
  });
}
