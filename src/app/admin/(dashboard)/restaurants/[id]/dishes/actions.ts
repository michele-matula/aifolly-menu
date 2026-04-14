'use server';

import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireOwnership } from '@/lib/auth-helpers';
import { invalidateRestaurantPublic } from '@/lib/cache/restaurant';
import { checkPlanLimit } from '@/lib/plan-limits';
import { AdminDishSchema, type PriceVariantInputType } from '@/lib/validators/dish';
import type { DishTag, Allergen } from '@prisma/client';

export type DishActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

async function revalidateRestaurant(restaurantId: string, slug: string) {
  revalidatePath(`/admin/restaurants/${restaurantId}/dishes`);
  invalidateRestaurantPublic(slug);
}

async function verifyDishOwnership(restaurantId: string, dishId: string) {
  const dish = await prisma.dish.findUnique({
    where: { id: dishId },
    include: { category: { select: { restaurantId: true } } },
  });
  if (!dish || dish.category.restaurantId !== restaurantId) notFound();
  return dish;
}

async function verifyCategoryOwnership(restaurantId: string, categoryId: string) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category || category.restaurantId !== restaurantId) notFound();
  return category;
}

function parseFormData(formData: FormData) {
  const priceRaw = formData.get('price') as string;
  const variantsJson = formData.get('variants') as string;

  return {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    categoryId: formData.get('categoryId') as string,
    price: priceRaw && priceRaw !== '' ? parseFloat(priceRaw) : null,
    priceLabel: formData.get('priceLabel') as string,
    imageUrl: formData.get('imageUrl') as string,
    tags: formData.getAll('tags') as DishTag[],
    allergens: formData.getAll('allergens') as Allergen[],
    isChefChoice: formData.get('isChefChoice') === 'on',
    isAvailable: formData.get('isAvailable') !== 'off', // default true
    isVisible: formData.get('isVisible') !== 'off',
    variants: variantsJson ? JSON.parse(variantsJson) as PriceVariantInputType[] : [],
  };
}

function extractFieldErrors(error: { issues: readonly { path: readonly PropertyKey[]; message: string }[] }) {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = [];
    fieldErrors[key].push(issue.message);
  }
  return fieldErrors;
}

export async function createDish(
  restaurantId: string,
  _prevState: DishActionState,
  formData: FormData,
): Promise<DishActionState> {
  const restaurant = await requireOwnership(restaurantId);

  const quota = await checkPlanLimit(restaurantId, 'maxDishes');
  if (!quota.allowed) {
    return {
      success: false,
      error: `Hai raggiunto il limite di ${quota.limit} piatti previsto dal tuo piano. Passa a un piano superiore per crearne altri.`,
    };
  }

  const raw = parseFormData(formData);

  const result = AdminDishSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: 'Verifica i campi evidenziati.', fieldErrors: extractFieldErrors(result.error) };
  }

  const data = result.data;
  await verifyCategoryOwnership(restaurantId, data.categoryId);

  const last = await prisma.dish.findFirst({
    where: { categoryId: data.categoryId },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  });

  await prisma.dish.create({
    data: {
      name: data.name,
      description: data.description || null,
      categoryId: data.categoryId,
      price: data.price,
      priceLabel: data.priceLabel || null,
      imageUrl: data.imageUrl || null,
      tags: data.tags,
      allergens: data.allergens,
      isChefChoice: data.isChefChoice,
      isAvailable: data.isAvailable,
      isVisible: data.isVisible,
      sortOrder: last ? last.sortOrder + 1 : 0,
      ...(data.variants.length > 0
        ? {
            variants: {
              create: data.variants.map((v, idx) => ({
                label: v.label,
                price: v.price,
                sortOrder: idx,
              })),
            },
          }
        : {}),
    },
  });

  await revalidateRestaurant(restaurantId, restaurant.slug);
  return { success: true };
}

export async function updateDish(
  restaurantId: string,
  dishId: string,
  _prevState: DishActionState,
  formData: FormData,
): Promise<DishActionState> {
  const restaurant = await requireOwnership(restaurantId);
  const existingDish = await verifyDishOwnership(restaurantId, dishId);
  const raw = parseFormData(formData);

  const result = AdminDishSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: 'Verifica i campi evidenziati.', fieldErrors: extractFieldErrors(result.error) };
  }

  const data = result.data;

  // Se la categoria è cambiata, verifica ownership e ricalcola sortOrder
  let newSortOrder = existingDish.sortOrder;
  if (data.categoryId !== existingDish.categoryId) {
    await verifyCategoryOwnership(restaurantId, data.categoryId);
    const last = await prisma.dish.findFirst({
      where: { categoryId: data.categoryId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    newSortOrder = last ? last.sortOrder + 1 : 0;
  }

  // Gestione variants in transazione
  const existingVariants = await prisma.priceVariant.findMany({
    where: { dishId },
    select: { id: true },
  });
  const existingVariantIds = new Set(existingVariants.map(v => v.id));
  const inputVariantIds = new Set(data.variants.filter(v => v.id).map(v => v.id!));

  const toDelete = [...existingVariantIds].filter(id => !inputVariantIds.has(id));
  const toUpdate = data.variants.filter(v => v.id && existingVariantIds.has(v.id));
  const toCreate = data.variants.filter(v => !v.id);

  await prisma.$transaction([
    // Update dish
    prisma.dish.update({
      where: { id: dishId },
      data: {
        name: data.name,
        description: data.description || null,
        categoryId: data.categoryId,
        price: data.price,
        priceLabel: data.priceLabel || null,
        imageUrl: data.imageUrl || null,
        tags: data.tags,
        allergens: data.allergens,
        isChefChoice: data.isChefChoice,
        isAvailable: data.isAvailable,
        isVisible: data.isVisible,
        sortOrder: newSortOrder,
      },
    }),
    // Delete removed variants
    ...(toDelete.length > 0
      ? [prisma.priceVariant.deleteMany({ where: { id: { in: toDelete } } })]
      : []),
    // Update existing variants
    ...toUpdate.map((v, idx) =>
      prisma.priceVariant.update({
        where: { id: v.id! },
        data: { label: v.label, price: v.price, sortOrder: idx },
      })
    ),
    // Create new variants
    ...toCreate.map((v, idx) =>
      prisma.priceVariant.create({
        data: {
          label: v.label,
          price: v.price,
          sortOrder: toUpdate.length + idx,
          dishId,
        },
      })
    ),
  ]);

  // Compatta sortOrder nella vecchia categoria se il piatto è stato spostato
  if (data.categoryId !== existingDish.categoryId) {
    const remaining = await prisma.dish.findMany({
      where: { categoryId: existingDish.categoryId },
      orderBy: { sortOrder: 'asc' },
      select: { id: true },
    });
    await prisma.$transaction(
      remaining.map((d, idx) =>
        prisma.dish.update({ where: { id: d.id }, data: { sortOrder: idx } })
      )
    );
  }

  await revalidateRestaurant(restaurantId, restaurant.slug);
  return { success: true };
}

export async function deleteDish(
  restaurantId: string,
  dishId: string,
): Promise<DishActionState> {
  const restaurant = await requireOwnership(restaurantId);
  const dish = await verifyDishOwnership(restaurantId, dishId);

  const categoryId = dish.categoryId;
  await prisma.dish.delete({ where: { id: dishId } });

  // Compatta sortOrder
  const remaining = await prisma.dish.findMany({
    where: { categoryId },
    orderBy: { sortOrder: 'asc' },
    select: { id: true },
  });
  await prisma.$transaction(
    remaining.map((d, idx) =>
      prisma.dish.update({ where: { id: d.id }, data: { sortOrder: idx } })
    )
  );

  await revalidateRestaurant(restaurantId, restaurant.slug);
  return { success: true };
}

export async function reorderDishes(
  restaurantId: string,
  categoryId: string,
  orderedIds: string[],
): Promise<DishActionState> {
  const restaurant = await requireOwnership(restaurantId);
  await verifyCategoryOwnership(restaurantId, categoryId);

  const existing = await prisma.dish.findMany({
    where: { categoryId },
    select: { id: true },
  });
  const existingIds = new Set(existing.map(d => d.id));

  if (orderedIds.length !== existingIds.size || !orderedIds.every(id => existingIds.has(id))) {
    return { success: false, error: 'Lista piatti non valida.' };
  }

  await prisma.$transaction(
    orderedIds.map((id, idx) =>
      prisma.dish.update({ where: { id }, data: { sortOrder: idx } })
    )
  );

  await revalidateRestaurant(restaurantId, restaurant.slug);
  return { success: true };
}

export async function toggleDishField(
  restaurantId: string,
  dishId: string,
  field: 'isChefChoice' | 'isVisible' | 'isAvailable',
): Promise<DishActionState> {
  const restaurant = await requireOwnership(restaurantId);
  const dish = await verifyDishOwnership(restaurantId, dishId);

  await prisma.dish.update({
    where: { id: dishId },
    data: { [field]: !dish[field] },
  });

  await revalidateRestaurant(restaurantId, restaurant.slug);
  return { success: true };
}
