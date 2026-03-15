import { prisma } from '@/lib/db';
import { DEFAULT_MAU_LIMIT } from './plans';

/** Get the current month key in "YYYY-MM" format. */
export function getCurrentMonthKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export interface MAUCapacityResult {
  allowed: boolean;
  currentCount: number;
  limit: number | null;
}

/**
 * Record an active user event.
 * Uses upsert so duplicate calls in the same month are no-ops.
 * Returns true if this was a newly created record.
 */
export async function recordActiveUser(
  userId: string,
  toolId: string,
  creatorId: string,
): Promise<boolean> {
  const monthKey = getCurrentMonthKey();
  const result = await prisma.activeUserEvent.upsert({
    where: {
      userId_toolId_monthKey: { userId, toolId, monthKey },
    },
    update: {},
    create: { userId, toolId, creatorId, monthKey },
    select: { createdAt: true },
  });
  // If createdAt is within the last 5 seconds, it was likely just created
  return Date.now() - result.createdAt.getTime() < 5000;
}

/**
 * Count distinct active users for a creator in a given month.
 */
export async function getCreatorMAU(
  creatorId: string,
  monthKey?: string,
): Promise<number> {
  const mk = monthKey ?? getCurrentMonthKey();

  const result = await prisma.activeUserEvent.groupBy({
    by: ['creatorId'],
    where: { creatorId, monthKey: mk },
    _count: { userId: true },
  });

  if (result.length === 0) return 0;

  // groupBy counts rows, but we need distinct users.
  // Use a raw count distinct instead.
  const distinct = await prisma.activeUserEvent.findMany({
    where: { creatorId, monthKey: mk },
    distinct: ['userId'],
    select: { userId: true },
  });

  return distinct.length;
}

/**
 * Get per-tool MAU breakdown for a creator.
 */
export async function getCreatorMAUByTool(
  creatorId: string,
  monthKey?: string,
): Promise<{ toolId: string; activeUsers: number }[]> {
  const mk = monthKey ?? getCurrentMonthKey();

  const events = await prisma.activeUserEvent.findMany({
    where: { creatorId, monthKey: mk },
    select: { toolId: true, userId: true },
  });

  // Count distinct users per tool
  const toolMap = new Map<string, Set<string>>();
  for (const e of events) {
    if (!toolMap.has(e.toolId)) toolMap.set(e.toolId, new Set());
    toolMap.get(e.toolId)!.add(e.userId);
  }

  return Array.from(toolMap.entries()).map(([toolId, users]) => ({
    toolId,
    activeUsers: users.size,
  }));
}

/**
 * Get the MAU limit for a creator based on their active billing plan.
 * Returns null for unlimited, or the numeric limit.
 */
export async function getCreatorMAULimit(
  creatorId: string,
): Promise<number | null> {
  // Find the user's active billing plan
  const userPlan = await prisma.userBillingPlan.findFirst({
    where: { userId: creatorId, status: 'ACTIVE' },
    include: { plan: { select: { name: true, mauLimit: true } } },
    orderBy: { createdAt: 'desc' },
  });

  if (!userPlan) {
    // No active plan → free tier
    return DEFAULT_MAU_LIMIT;
  }

  return userPlan.plan.mauLimit;
}

/**
 * Check if a creator has capacity for a new unique active user.
 * If the user is already counted this month, capacity is not consumed.
 */
export async function checkMAUCapacity(
  creatorId: string,
  userId?: string,
  toolId?: string,
): Promise<MAUCapacityResult> {
  const monthKey = getCurrentMonthKey();

  // If userId and toolId provided, check if already recorded (fast path)
  if (userId && toolId) {
    const existing = await prisma.activeUserEvent.findUnique({
      where: { userId_toolId_monthKey: { userId, toolId, monthKey } },
      select: { id: true },
    });
    if (existing) {
      // Already counted — no capacity consumed
      const limit = await getCreatorMAULimit(creatorId);
      const currentCount = await getCreatorMAU(creatorId, monthKey);
      return { allowed: true, currentCount, limit };
    }
  }

  const [limit, currentCount] = await Promise.all([
    getCreatorMAULimit(creatorId),
    getCreatorMAU(creatorId, monthKey),
  ]);

  // null limit = unlimited
  if (limit === null) {
    return { allowed: true, currentCount, limit };
  }

  return {
    allowed: currentCount < limit,
    currentCount,
    limit,
  };
}
