import { requireOwnership } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import type { CoverTheme, MenuTheme, DishTheme } from '@/lib/validators/theme';
import ThemeBuilder from '@/components/admin/theme/ThemeBuilder';

type Props = { params: Promise<{ id: string }> };

export default async function ThemePage({ params }: Props) {
  const { id } = await params;
  const restaurant = await requireOwnership(id);

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

  const workingTheme = {
    cover: (restaurant.themeCoverDraft ?? restaurant.themeCover) as CoverTheme,
    menu: (restaurant.themeMenuDraft ?? restaurant.themeMenu) as MenuTheme,
    dish: (restaurant.themeDishDraft ?? restaurant.themeDish) as DishTheme,
  };

  const liveTheme = {
    cover: restaurant.themeCover as CoverTheme,
    menu: restaurant.themeMenu as MenuTheme,
    dish: restaurant.themeDish as DishTheme,
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
      liveTheme={liveTheme}
      hasDraft={hasDraft}
      presets={presets.map(p => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        category: p.category,
        coverConfig: p.coverConfig as CoverTheme,
        menuConfig: p.menuConfig as MenuTheme,
        dishConfig: p.dishConfig as DishTheme,
      }))}
    />
  );
}
