import type { Plan } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// Piani pagati (con stripePriceId non-null) visibili agli utenti nella pagina upgrade.
// Esclude free-trial e free-eternal (quelli non sono sottoscrivibili: free-trial e'
// auto-assegnato al signup, free-eternal e' assegnato solo dal Super Admin).
export async function getPaidPlans(): Promise<Plan[]> {
  return prisma.plan.findMany({
    where: {
      isActive: true,
      isFreeEternal: false,
      // Piani con prezzo > 0: sono i piani pagati. stripePriceId potrebbe essere
      // null in 6a.4 (non abbiamo ancora creato i Price Stripe); lo diventera'
      // nei sub-step 6a.5+.
      priceMonthly: { gt: 0 },
    },
    orderBy: { priceMonthly: 'asc' },
  });
}
