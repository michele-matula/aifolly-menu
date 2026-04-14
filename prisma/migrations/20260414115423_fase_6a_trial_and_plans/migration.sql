-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'TENANT_TRIAL_EXTENDED';
ALTER TYPE "AuditAction" ADD VALUE 'SIGNUP_COMPLETED';
ALTER TYPE "AuditAction" ADD VALUE 'EMAIL_VERIFIED';
ALTER TYPE "AuditAction" ADD VALUE 'STRIPE_CHECKOUT_COMPLETED';
ALTER TYPE "AuditAction" ADD VALUE 'STRIPE_SUBSCRIPTION_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'STRIPE_SUBSCRIPTION_CANCELED';
ALTER TYPE "AuditAction" ADD VALUE 'STRIPE_PAYMENT_FAILED';

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "isFreeEternal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripePriceId" TEXT;

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "trialEndsAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerificationToken" TEXT,
ADD COLUMN     "emailVerificationTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Plan_stripePriceId_key" ON "Plan"("stripePriceId");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailVerificationToken_key" ON "User"("emailVerificationToken");
