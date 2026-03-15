import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("[db] DATABASE_URL is not set. Database queries will fail.");
    // Return a proxy that throws descriptive errors on query access
    return new Proxy({} as PrismaClient, {
      get(_target, prop: string) {
        if (prop === 'then' || prop === 'catch' || prop === 'finally') return undefined;
        if (typeof prop === 'symbol' || prop.startsWith('_') || prop === 'constructor') return undefined;
        return new Proxy(() => {}, {
          get() {
            throw new Error(`Database not available: DATABASE_URL is not configured. Cannot access prisma.${prop}`);
          },
          apply() {
            throw new Error(`Database not available: DATABASE_URL is not configured. Cannot call prisma.${prop}()`);
          },
        });
      },
    }) as unknown as PrismaClient;
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    return (globalForPrisma.prisma as unknown as Record<string | symbol, unknown>)[prop];
  },
});
