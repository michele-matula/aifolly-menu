import { prisma } from '@/lib/prisma';

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
