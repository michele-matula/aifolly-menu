import { requireOwnership } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import DishForm from '@/components/admin/DishForm';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ category?: string }>;
};

export default async function NewDishPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  await requireOwnership(id);

  const categories = await prisma.category.findMany({
    where: { restaurantId: id },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#1c1917] mb-1">Nuovo piatto</h2>
      <p className="text-sm text-[#78716c] mb-6">Compila i dati e salva.</p>
      <DishForm
        mode="create"
        restaurantId={id}
        categories={categories}
        defaultCategoryId={sp.category}
      />
    </div>
  );
}
