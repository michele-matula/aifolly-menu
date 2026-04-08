'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireOwnership } from '@/lib/auth-helpers';
import { UpdateRestaurantInfoSchema } from '@/lib/validators/restaurant';

export type InfoActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function updateRestaurantInfo(
  restaurantId: string,
  _prevState: InfoActionState,
  formData: FormData,
): Promise<InfoActionState> {
  const restaurant = await requireOwnership(restaurantId);

  const raw = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    tagline: formData.get('tagline') as string,
    description: formData.get('description') as string,
    city: formData.get('city') as string,
    province: formData.get('province') as string,
    address: formData.get('address') as string,
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
    website: formData.get('website') as string,
  };

  const result = UpdateRestaurantInfoSchema.safeParse(raw);
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

  // Se lo slug è cambiato, verifica unicità
  if (data.slug !== restaurant.slug) {
    const existing = await prisma.restaurant.findUnique({ where: { slug: data.slug } });
    if (existing && existing.id !== restaurant.id) {
      return {
        success: false,
        error: 'Questo slug è già in uso.',
        fieldErrors: { slug: ['Slug già utilizzato da un altro ristorante.'] },
      };
    }
  }

  const oldSlug = restaurant.slug;

  await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: {
      name: data.name,
      slug: data.slug,
      tagline: data.tagline || null,
      description: data.description || null,
      city: data.city || null,
      province: data.province || null,
      address: data.address || null,
      phone: data.phone || null,
      email: data.email || null,
      website: data.website || null,
    },
  });

  revalidatePath(`/admin/restaurants/${restaurant.id}`);
  revalidatePath(`/${oldSlug}`);
  revalidatePath(`/${oldSlug}/menu`);
  if (data.slug !== oldSlug) {
    revalidatePath(`/${data.slug}`);
    revalidatePath(`/${data.slug}/menu`);
  }

  return { success: true };
}
