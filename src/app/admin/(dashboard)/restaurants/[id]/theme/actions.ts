'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireOwnership } from '@/lib/auth-helpers';
import {
  CoverThemeSchema,
  MenuThemeSchema,
  DishThemeSchema,
  type CoverTheme,
  type MenuTheme,
  type DishTheme,
} from '@/lib/validators/theme';

export type ThemeActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export type ThemeActionWithData = ThemeActionState & {
  data?: { cover: CoverTheme; menu: MenuTheme; dish: DishTheme };
};

const SCOPE_MAP = {
  cover: { field: 'themeCoverDraft', schema: CoverThemeSchema },
  menu: { field: 'themeMenuDraft', schema: MenuThemeSchema },
  dish: { field: 'themeDishDraft', schema: DishThemeSchema },
} as const;

export async function updateThemeDraft(
  restaurantId: string,
  scope: 'cover' | 'menu' | 'dish',
  data: unknown,
): Promise<ThemeActionState> {
  try {
    await requireOwnership(restaurantId);

    const { field, schema } = SCOPE_MAP[scope];
    const result = schema.safeParse(data);

    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join('.');
        fieldErrors[key] = fieldErrors[key] || [];
        fieldErrors[key].push(issue.message);
      }
      return { success: false, error: 'Dati tema non validi', fieldErrors };
    }

    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { [field]: result.data },
    });

    return { success: true };
  } catch {
    return { success: false, error: 'Errore durante il salvataggio della bozza' };
  }
}

export async function applyPreset(
  restaurantId: string,
  presetId: string,
): Promise<ThemeActionWithData> {
  try {
    await requireOwnership(restaurantId);

    const preset = await prisma.themePreset.findUnique({
      where: { id: presetId },
    });

    if (!preset || !preset.isActive) {
      return { success: false, error: 'Preset non trovato o non attivo' };
    }

    const cover = preset.coverConfig as CoverTheme;
    const menu = preset.menuConfig as MenuTheme;
    const dish = preset.dishConfig as DishTheme;

    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        themeCoverDraft: cover as any,
        themeMenuDraft: menu as any,
        themeDishDraft: dish as any,
      },
    });

    revalidatePath(`/admin/restaurants/${restaurantId}/theme`);

    return { success: true, data: { cover, menu, dish } };
  } catch {
    return { success: false, error: 'Errore durante l\'applicazione del preset' };
  }
}

export async function publishTheme(
  restaurantId: string,
): Promise<ThemeActionState> {
  try {
    const restaurant = await requireOwnership(restaurantId);

    type ThemeUpdate = Record<string, unknown>;
    const updateData: ThemeUpdate = {};

    if (restaurant.themeCoverDraft) {
      updateData.themeCover = restaurant.themeCoverDraft;
    }
    if (restaurant.themeMenuDraft) {
      updateData.themeMenu = restaurant.themeMenuDraft;
    }
    if (restaurant.themeDishDraft) {
      updateData.themeDish = restaurant.themeDishDraft;
    }

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: 'Nessuna bozza da pubblicare' };
    }

    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: updateData,
    });

    revalidatePath(`/${restaurant.slug}`);
    revalidatePath(`/${restaurant.slug}/menu`);
    revalidatePath(`/admin/restaurants/${restaurantId}/theme`);

    return { success: true };
  } catch {
    return { success: false, error: 'Errore durante la pubblicazione del tema' };
  }
}

export async function discardDraft(
  restaurantId: string,
): Promise<ThemeActionWithData> {
  try {
    const restaurant = await requireOwnership(restaurantId);

    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        themeCoverDraft: Prisma.DbNull,
        themeMenuDraft: Prisma.DbNull,
        themeDishDraft: Prisma.DbNull,
      },
    });

    revalidatePath(`/admin/restaurants/${restaurantId}/theme`);

    return {
      success: true,
      data: {
        cover: restaurant.themeCover as CoverTheme,
        menu: restaurant.themeMenu as MenuTheme,
        dish: restaurant.themeDish as DishTheme,
      },
    };
  } catch {
    return { success: false, error: 'Errore durante l\'annullamento della bozza' };
  }
}

export async function resetToPreset(
  restaurantId: string,
  presetId: string,
): Promise<ThemeActionWithData> {
  return applyPreset(restaurantId, presetId);
}
