import Link from 'next/link';
import { requireOwnership } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import DishesList from '@/components/admin/DishesList';
import DishesToolbar from '@/components/admin/DishesToolbar';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ category?: string; search?: string }>;
};

export default async function DishesPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  await requireOwnership(id);

  const categories = await prisma.category.findMany({
    where: { restaurantId: id },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true },
  });

  const where: Record<string, unknown> = {};
  if (sp.category) {
    where.categoryId = sp.category;
  } else {
    where.categoryId = { in: categories.map(c => c.id) };
  }
  if (sp.search) {
    where.name = { contains: sp.search, mode: 'insensitive' };
  }

  const dishes = await prisma.dish.findMany({
    where,
    orderBy: sp.category
      ? { sortOrder: 'asc' }
      : [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
    include: {
      category: { select: { id: true, name: true } },
      variants: { orderBy: { sortOrder: 'asc' }, select: { label: true, price: true } },
    },
  });

  const totalDishes = dishes.length;
  const totalCategories = new Set(dishes.map(d => d.category.id)).size;

  const serialized = dishes.map(d => ({
    id: d.id,
    name: d.name,
    price: d.price ? Number(d.price) : null,
    categoryId: d.category.id,
    categoryName: d.category.name,
    isChefChoice: d.isChefChoice,
    isVisible: d.isVisible,
    isAvailable: d.isAvailable,
    variantsSummary: d.variants.length > 0
      ? d.variants.map(v => `€${Number(v.price)}`).join(' / ')
      : null,
  }));

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[#1c1917]">Piatti</h2>
          <p className="text-sm text-[#78716c] mt-0.5">
            {totalDishes === 0
              ? 'Nessun piatto ancora.'
              : `${totalDishes} piatt${totalDishes === 1 ? 'o' : 'i'} in ${totalCategories} categori${totalCategories === 1 ? 'a' : 'e'}`}
            {sp.category ? '. Trascina per riordinare.' : ''}
          </p>
        </div>
        <Link
          href={`/admin/restaurants/${id}/dishes/new${sp.category ? `?category=${sp.category}` : ''}`}
          className="shrink-0 px-4 py-2 text-[13px] font-medium text-white bg-[#c9b97a] rounded-md hover:bg-[#b5a468] transition-colors no-underline"
        >
          + Nuovo piatto
        </Link>
      </div>

      {/* Toolbar */}
      <div className="mb-4">
        <DishesToolbar restaurantId={id} categories={categories} />
      </div>

      {/* List */}
      <DishesList
        restaurantId={id}
        dishes={serialized}
        filterCategoryId={sp.category ?? null}
        grouped={!sp.category}
        categoryGroups={categories}
      />
    </div>
  );
}
