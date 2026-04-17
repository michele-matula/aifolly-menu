import { prisma } from './prisma';

export type AccessStatus =
  | { status: 'ok' }
  | { status: 'trial'; trialEndsAt: Date; daysLeft: number }
  | { status: 'trial_expired' }
  | { status: 'suspended'; reason: string | null }
  | { status: 'email_unverified' };

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export interface AccessStatusInput {
  isSuspended: boolean;
  suspendedReason: string | null;
  trialEndsAt: Date | null;
  stripeSubscriptionStatus: string | null;
  plan: { isFreeEternal: boolean; slug: string } | null;
}

export function deriveAccessStatus(r: AccessStatusInput, now: Date = new Date()): AccessStatus {
  if (r.isSuspended) {
    return { status: 'suspended', reason: r.suspendedReason };
  }

  if (r.plan?.isFreeEternal) {
    return { status: 'ok' };
  }

  if (r.stripeSubscriptionStatus === 'active' || r.stripeSubscriptionStatus === 'trialing') {
    return { status: 'ok' };
  }

  // Piano pagato assegnato manualmente dal Super Admin (pre-Stripe)
  if (r.plan && r.plan.slug !== 'free-trial' && !r.plan.isFreeEternal) {
    return { status: 'ok' };
  }

  if (r.trialEndsAt) {
    const msLeft = r.trialEndsAt.getTime() - now.getTime();
    if (msLeft > 0) {
      return {
        status: 'trial',
        trialEndsAt: r.trialEndsAt,
        daysLeft: Math.ceil(msLeft / MS_PER_DAY),
      };
    }
    return { status: 'trial_expired' };
  }

  // Difensivo: ristorante senza piano, senza trial, senza subscription → accesso bloccato
  return { status: 'trial_expired' };
}

export async function getRestaurantAccessStatus(restaurantId: string): Promise<AccessStatus> {
  const r = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: {
      isSuspended: true,
      suspendedReason: true,
      trialEndsAt: true,
      stripeSubscriptionStatus: true,
      plan: { select: { isFreeEternal: true, slug: true } },
      owner: { select: { emailVerified: true } },
    },
  });

  if (!r) throw new Error(`Restaurant ${restaurantId} not found`);

  // Email non verificata ha priorità più alta di qualsiasi stato piano/trial
  if (r.owner && !r.owner.emailVerified) {
    return { status: 'email_unverified' };
  }

  return deriveAccessStatus(r);
}
