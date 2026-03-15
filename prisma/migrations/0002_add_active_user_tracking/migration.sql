-- AlterTable
ALTER TABLE "BillingPlan" ADD COLUMN "mauLimit" INTEGER;

-- CreateTable
CREATE TABLE "ActiveUserEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "monthKey" VARCHAR(7) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActiveUserEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActiveUserEvent_userId_toolId_monthKey_key" ON "ActiveUserEvent"("userId", "toolId", "monthKey");

-- CreateIndex
CREATE INDEX "ActiveUserEvent_creatorId_monthKey_idx" ON "ActiveUserEvent"("creatorId", "monthKey");

-- CreateIndex
CREATE INDEX "ActiveUserEvent_toolId_monthKey_idx" ON "ActiveUserEvent"("toolId", "monthKey");

-- AddForeignKey
ALTER TABLE "ActiveUserEvent" ADD CONSTRAINT "ActiveUserEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveUserEvent" ADD CONSTRAINT "ActiveUserEvent_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed mauLimit for existing plans
UPDATE "BillingPlan" SET "mauLimit" = 1000 WHERE LOWER("name") = 'free';
UPDATE "BillingPlan" SET "mauLimit" = 50000 WHERE LOWER("name") = 'pro';
UPDATE "BillingPlan" SET "mauLimit" = NULL WHERE LOWER("name") IN ('team', 'enterprise');
