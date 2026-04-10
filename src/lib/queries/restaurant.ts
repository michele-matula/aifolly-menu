import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { RESTAURANT_TAG } from '@/lib/cache/restaurant';

export async function getPublicRestaurant(slug: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      categories: {
        where: { isVisible: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          dishes: {
            where: { isVisible: true },
            orderBy: { sortOrder: 'asc' },
            include: {
              variants: {
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
      },
    },
  });

  if (!restaurant || !restaurant.isPublished || restaurant.isSuspended || !restaurant.isActive) {
    return null;
  }

  return restaurant;
}

// Versione cached del fetch pubblico, da usare nelle pagine pubbliche fuori
// dal preview mode. La cache è invalidata via tag (vedi `revalidateRestaurantPublic`)
// dalle server actions che cambiano dati visibili al pubblico.
//
// Il wrapper unstable_cache viene ricostruito a ogni chiamata: Next deduplica
// internamente sulle keyParts, quindi l'effetto è quello di una singola
// entry per slug. Pattern documentato per costruire tag dinamici per-call.
export async function getCachedPublicRestaurant(slug: string) {
  return unstable_cache(
    async () => getPublicRestaurant(slug),
    ['public-restaurant', slug],
    { tags: [RESTAURANT_TAG(slug)], revalidate: 60 }
  )();
}
