import { requireOwnership } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import CategoriesManager from '@/components/admin/CategoriesManager';

type Props = { params: Promise<{ id: string }> };

export default async function CategoriesPage({ params }: Props) {
  const { id } = await params;
  await requireOwnership(id);

  const categories = await prisma.category.findMany({
    where: { restaurantId: id },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { dishes: true } } },
  });

  const serialized = categories.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    icon: c.icon,
    sortOrder: c.sortOrder,
    isVisible: c.isVisible,
    dishCount: c._count.dishes,
  }));

  return (
    <CategoriesManager
      restaurantId={id}
      initialCategories={serialized}
    />
  );
}
