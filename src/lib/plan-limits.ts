import { prisma } from './prisma';

export type PlanLimitKey = 'maxDishes' | 'maxCategories' | 'maxImages';

export interface PlanLimitResult {
  allowed: boolean;
  current: number;
  limit: number;
}

// Controlla se il ristorante puo' creare un'altra entita' di tipo `key`.
// Usato come guard prima di createDish / createCategory / upload immagine.
export async function checkPlanLimit(
  restaurantId: string,
  key: PlanLimitKey
): Promise<PlanLimitResult> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: {
      plan: { select: { maxDishes: true, maxCategories: true, maxImages: true } },
    },
  });
  if (!restaurant) throw new Error(`Restaurant ${restaurantId} not found`);

  // Ristorante senza piano: limite 0 (blocco totale). In pratica requireOwnership
  // intercetta trial_expired prima; questo e' un safety net difensivo.
  const limit = restaurant.plan?.[key] ?? 0;

  let current = 0;
  if (key === 'maxDishes') {
    current = await prisma.dish.count({ where: { category: { restaurantId } } });
  } else if (key === 'maxCategories') {
    current = await prisma.category.count({ where: { restaurantId } });
  } else {
    current = await prisma.mediaAsset.count({ where: { restaurantId } });
  }

  return { allowed: current < limit, current, limit };
}

export async function getPlanQuotas(
  restaurantId: string
): Promise<Record<PlanLimitKey, PlanLimitResult>> {
  const [dishes, categories, images] = await Promise.all([
    checkPlanLimit(restaurantId, 'maxDishes'),
    checkPlanLimit(restaurantId, 'maxCategories'),
    checkPlanLimit(restaurantId, 'maxImages'),
  ]);
  return { maxDishes: dishes, maxCategories: categories, maxImages: images };
}
