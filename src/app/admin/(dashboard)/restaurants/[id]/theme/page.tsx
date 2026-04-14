import { requireOwnership } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import type { CoverTheme, MenuTheme, DishTheme } from '@/lib/validators/theme';
import ThemeBuilder from '@/components/admin/theme/ThemeBuilder';
import EmptyThemeState from '@/components/admin/theme/EmptyThemeState';
import PresetOnlyThemeState from '@/components/admin/theme/PresetOnlyThemeState';

type Props = { params: Promise<{ id: string }> };

// A restaurant created without a preset has themeCover/themeMenu/themeDish
// equal to {} (Prisma JSON default). The ThemeBuilder assumes those JSON
// blobs are populated FontConfig structures and crashes on empty objects.
// Detect that case here and gate to an empty state instead.
function isJsonObjectEmpty(value: unknown): boolean {
  return (
    value == null ||
    (typeof value === 'object' && !Array.isArray(value) && Object.keys(value as object).length === 0)
  );
}

export default async function ThemePage({ params }: Props) {
  const { id } = await params;
  const restaurant = await requireOwnership(id);

  // Plan.customTheme decide se mostrare il theme builder completo (true) o
  // solo il preset picker (false, piani Basic/Free/Trial).
  const plan = restaurant.planId
    ? await prisma.plan.findUnique({
        where: { id: restaurant.planId },
        select: { customTheme: true },
      })
    : null;
  const canCustomize = plan?.customTheme ?? false;

  const presets = await prisma.themePreset.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      category: true,
      coverConfig: true,
      menuConfig: true,
      dishConfig: true,
    },
  });

  const mappedPresets = presets.map(p => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    category: p.category,
    coverConfig: p.coverConfig as CoverTheme,
    menuConfig: p.menuConfig as MenuTheme,
    dishConfig: p.dishConfig as DishTheme,
  }));

  const isThemeEmpty =
    isJsonObjectEmpty(restaurant.themeCover) &&
    isJsonObjectEmpty(restaurant.themeMenu) &&
    isJsonObjectEmpty(restaurant.themeDish) &&
    isJsonObjectEmpty(restaurant.themeCoverDraft) &&
    isJsonObjectEmpty(restaurant.themeMenuDraft) &&
    isJsonObjectEmpty(restaurant.themeDishDraft);

  if (isThemeEmpty) {
    return <EmptyThemeState restaurantId={restaurant.id} presets={mappedPresets} />;
  }

  if (!canCustomize) {
    return <PresetOnlyThemeState restaurantId={restaurant.id} presets={mappedPresets} />;
  }

  const workingTheme = {
    cover: (restaurant.themeCoverDraft ?? restaurant.themeCover) as CoverTheme,
    menu: (restaurant.themeMenuDraft ?? restaurant.themeMenu) as MenuTheme,
    dish: (restaurant.themeDishDraft ?? restaurant.themeDish) as DishTheme,
  };

  const hasDraft = !!(
    restaurant.themeCoverDraft ||
    restaurant.themeMenuDraft ||
    restaurant.themeDishDraft
  );

  return (
    <ThemeBuilder
      restaurantId={restaurant.id}
      slug={restaurant.slug}
      initialTheme={workingTheme}
      hasDraft={hasDraft}
      presets={mappedPresets}
    />
  );
}
