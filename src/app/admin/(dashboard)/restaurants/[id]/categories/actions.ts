'use server';

import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireOwnership } from '@/lib/auth-helpers';
import { invalidateRestaurantPublic } from '@/lib/cache/restaurant';
import { checkPlanLimit } from '@/lib/plan-limits';
import { AdminCreateCategorySchema, AdminUpdateCategorySchema } from '@/lib/validators/category';

export type CategoryActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function revalidateRestaurant(restaurantId: string, slug: string) {
  revalidatePath(`/admin/restaurants/${restaurantId}/categories`);
  invalidateRestaurantPublic(slug);
}

export async function createCategory(
  restaurantId: string,
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const restaurant = await requireOwnership(restaurantId);

  const quota = await checkPlanLimit(restaurantId, 'maxCategories');
  if (!quota.allowed) {
    return {
      success: false,
      error: `Hai raggiunto il limite di ${quota.limit} categorie previsto dal tuo piano. Passa a un piano superiore per crearne altre.`,
    };
  }

  const raw = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    icon: formData.get('icon') as string,
    isVisible: formData.get('isVisible') === 'on',
  };

  const result = AdminCreateCategorySchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as string;
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { success: false, error: 'Verifica i campi evidenziati.', fieldErrors };
  }

  const data = result.data;
  const slug = slugify(data.name);

  // Calcola prossimo sortOrder
  const last = await prisma.category.findFirst({
    where: { restaurantId },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  });
  const nextOrder = last ? last.sortOrder + 1 : 0;

  // Verifica slug univoco nel ristorante
  const existingSlug = await prisma.category.findUnique({
    where: { restaurantId_slug: { restaurantId, slug } },
  });

  const finalSlug = existingSlug ? `${slug}-${nextOrder}` : slug;

  await prisma.category.create({
    data: {
      name: data.name,
      slug: finalSlug,
      description: data.description || null,
      icon: data.icon || null,
      isVisible: data.isVisible,
      sortOrder: nextOrder,
      restaurantId,
    },
  });

  await revalidateRestaurant(restaurantId, restaurant.slug);
  return { success: true };
}

export async function updateCategory(
  restaurantId: string,
  categoryId: string,
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const restaurant = await requireOwnership(restaurantId);

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category || category.restaurantId !== restaurantId) notFound();

  const raw = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    icon: formData.get('icon') as string,
    isVisible: formData.get('isVisible') === 'on',
  };

  const result = AdminUpdateCategorySchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as string;
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { success: false, error: 'Verifica i campi evidenziati.', fieldErrors };
  }

  const data = result.data;

  // Rigenera slug se il nome è cambiato
  let newSlug = category.slug;
  if (data.name !== category.name) {
    newSlug = slugify(data.name);
    const existingSlug = await prisma.category.findUnique({
      where: { restaurantId_slug: { restaurantId, slug: newSlug } },
    });
    if (existingSlug && existingSlug.id !== categoryId) {
      newSlug = `${newSlug}-${category.sortOrder}`;
    }
  }

  await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: data.name,
      slug: newSlug,
      description: data.description || null,
      icon: data.icon || null,
      isVisible: data.isVisible,
    },
  });

  await revalidateRestaurant(restaurantId, restaurant.slug);
  return { success: true };
}

export async function deleteCategory(
  restaurantId: string,
  categoryId: string,
): Promise<CategoryActionState> {
  const restaurant = await requireOwnership(restaurantId);

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { _count: { select: { dishes: true } } },
  });
  if (!category || category.restaurantId !== restaurantId) notFound();

  if (category._count.dishes > 0) {
    return {
      success: false,
      error: `La categoria contiene ${category._count.dishes} piatt${category._count.dishes === 1 ? 'o' : 'i'}. Spostali o eliminali prima di eliminare la categoria.`,
    };
  }

  await prisma.category.delete({ where: { id: categoryId } });

  // Compatta sortOrder delle categorie rimanenti
  const remaining = await prisma.category.findMany({
    where: { restaurantId },
    orderBy: { sortOrder: 'asc' },
    select: { id: true },
  });
  await prisma.$transaction(
    remaining.map((cat, idx) =>
      prisma.category.update({
        where: { id: cat.id },
        data: { sortOrder: idx },
      })
    )
  );

  await revalidateRestaurant(restaurantId, restaurant.slug);
  return { success: true };
}

export async function reorderCategories(
  restaurantId: string,
  orderedIds: string[],
): Promise<CategoryActionState> {
  const restaurant = await requireOwnership(restaurantId);

  // Verifica che l'array contenga esattamente le categorie del ristorante
  const existing = await prisma.category.findMany({
    where: { restaurantId },
    select: { id: true },
  });
  const existingIds = new Set(existing.map(c => c.id));

  if (orderedIds.length !== existingIds.size) {
    return { success: false, error: 'Lista categorie non valida.' };
  }
  for (const id of orderedIds) {
    if (!existingIds.has(id)) {
      return { success: false, error: 'Lista categorie non valida.' };
    }
  }

  await prisma.$transaction(
    orderedIds.map((id, idx) =>
      prisma.category.update({
        where: { id },
        data: { sortOrder: idx },
      })
    )
  );

  await revalidateRestaurant(restaurantId, restaurant.slug);
  return { success: true };
}
