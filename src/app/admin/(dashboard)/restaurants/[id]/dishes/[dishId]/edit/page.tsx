import { notFound } from 'next/navigation';
import { requireOwnership } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import DishForm from '@/components/admin/DishForm';

type Props = {
  params: Promise<{ id: string; dishId: string }>;
};

export default async function EditDishPage({ params }: Props) {
  const { id, dishId } = await params;
  await requireOwnership(id);

  const dish = await prisma.dish.findUnique({
    where: { id: dishId },
    include: {
      category: { select: { restaurantId: true } },
      variants: { orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!dish || dish.category.restaurantId !== id) notFound();

  const categories = await prisma.category.findMany({
    where: { restaurantId: id },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#1c1917] mb-1">Modifica piatto</h2>
      <p className="text-sm text-[#78716c] mb-6">{dish.name}</p>
      <DishForm
        mode="edit"
        restaurantId={id}
        categories={categories}
        dish={{
          id: dish.id,
          name: dish.name,
          description: dish.description,
          imageUrl: dish.imageUrl,
          price: dish.price ? Number(dish.price) : null,
          priceLabel: dish.priceLabel,
          categoryId: dish.categoryId,
          tags: dish.tags as string[],
          allergens: dish.allergens as string[],
          isChefChoice: dish.isChefChoice,
          isAvailable: dish.isAvailable,
          isVisible: dish.isVisible,
          variants: dish.variants.map(v => ({
            id: v.id,
            label: v.label,
            price: Number(v.price),
          })),
        }}
      />
    </div>
  );
}
