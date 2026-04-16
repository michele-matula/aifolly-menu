'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { RestaurantOnboardingSchema } from '@/lib/validators/signup';

type OnboardingResult =
  | { error?: undefined }
  | { error: string; fieldErrors?: Partial<Record<string, string>> };

export async function completeGoogleSignup(input: {
  restaurantName: string;
  slug: string;
}): Promise<OnboardingResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Sessione non valida. Riprova il login.' };
  }

  const parsed = RestaurantOnboardingSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<string, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { error: 'Verifica i campi evidenziati.', fieldErrors };
  }

  const { restaurantName, slug } = parsed.data;

  // Ensure user doesn't already have a restaurant
  const existing = await prisma.userRestaurant.findFirst({
    where: { userId: session.user.id },
  });
  if (existing) {
    return { error: 'Hai già un ristorante associato.' };
  }

  // Check slug uniqueness
  const existingSlug = await prisma.restaurant.findUnique({ where: { slug } });
  if (existingSlug) {
    return { error: 'Questo indirizzo del menu è già in uso.', fieldErrors: { slug: 'Indirizzo già in uso' } };
  }

  const trialEndsAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

  const freePlan = await prisma.plan.findFirst({
    where: { slug: 'free-trial' },
  });

  await prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.create({
      data: {
        name: restaurantName,
        slug,
        ownerId: session.user.id,
        planId: freePlan?.id ?? null,
        trialEndsAt,
      },
    });

    await tx.userRestaurant.create({
      data: {
        userId: session.user.id,
        restaurantId: restaurant.id,
        role: 'OWNER',
      },
    });
  });

  return {};
}
