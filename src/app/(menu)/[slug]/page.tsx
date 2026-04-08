import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPublicRestaurant } from '@/lib/queries/restaurant';
import type { FullTheme } from '@/lib/validators/theme';
import ThemeProvider from '@/components/menu/ThemeProvider';
import CoverPage from '@/components/menu/CoverPage';

type Props = { params: Promise<{ slug: string }> };

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

export default async function CoverPageRoute({ params }: Props) {
  const { slug } = await params;
  const restaurant = await getPublicRestaurant(slug);

  if (!restaurant) {
    notFound();
  }

  const theme: FullTheme = {
    cover: restaurant.themeCoverDraft ?? restaurant.themeCover,
    menu: restaurant.themeMenuDraft ?? restaurant.themeMenu,
    dish: restaurant.themeDishDraft ?? restaurant.themeDish,
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
