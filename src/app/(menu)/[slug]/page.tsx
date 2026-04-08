import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPublicRestaurant } from '@/lib/queries/restaurant';
import { tryGetOwnershipBySlug } from '@/lib/auth-helpers';
import type { FullTheme } from '@/lib/validators/theme';
import ThemeProvider from '@/components/menu/ThemeProvider';
import CoverPage from '@/components/menu/CoverPage';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ previewDraft?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getPublicRestaurant(slug);

  if (!restaurant) {
    return { title: 'Ristorante non trovato' };
  }

  return {
    title: `${restaurant.name} — Menu Digitale`,
    description: restaurant.tagline || restaurant.description || undefined,
  };
}

export default async function CoverPageRoute({ params, searchParams }: Props) {
  const { slug } = await params;
  const { previewDraft } = await searchParams;
  const restaurant = await getPublicRestaurant(slug);

  if (!restaurant) {
    notFound();
  }

  const useDraft =
    previewDraft === '1' && (await tryGetOwnershipBySlug(slug)) !== null;

  const theme: FullTheme = {
    cover: useDraft ? (restaurant.themeCoverDraft ?? restaurant.themeCover) : restaurant.themeCover,
    menu: useDraft ? (restaurant.themeMenuDraft ?? restaurant.themeMenu) : restaurant.themeMenu,
    dish: useDraft ? (restaurant.themeDishDraft ?? restaurant.themeDish) : restaurant.themeDish,
  } as FullTheme;

  return (
    <ThemeProvider theme={theme}>
      <CoverPage
        restaurant={{
          name: restaurant.name,
          slug: restaurant.slug,
          tagline: restaurant.tagline,
          description: restaurant.description,
          logoUrl: restaurant.logoUrl,
          coverUrl: restaurant.coverUrl,
          phone: restaurant.phone,
          city: restaurant.city,
        }}
        theme={theme.cover}
      />
    </ThemeProvider>
  );
}
