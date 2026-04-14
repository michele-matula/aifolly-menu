import { requireOwnership } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { checkPlanLimit } from '@/lib/plan-limits';
import CategoriesManager from '@/components/admin/CategoriesManager';

type Props = { params: Promise<{ id: string }> };

export default async function CategoriesPage({ params }: Props) {
  const { id } = await params;
  await requireOwnership(id);

  const [categories, catQuota] = await Promise.all([
    prisma.category.findMany({
      where: { restaurantId: id },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { dishes: true } } },
    }),
    checkPlanLimit(id, 'maxCategories'),
  ]);

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
    <div>
      <div className="mb-4 flex items-center gap-3 text-sm text-[#78716c]">
        <span>
          <strong className="text-[#1c1917]">Categorie</strong>{' '}
          <span className="text-[#a8a29e]">
            {catQuota.current}/{catQuota.limit}
          </span>
        </span>
        {!catQuota.allowed && (
          <span className="text-amber-700">
            — quota esaurita, le nuove categorie saranno rifiutate
          </span>
        )}
      </div>
      <CategoriesManager
        restaurantId={id}
        initialCategories={serialized}
      />
    </div>
  );
}
