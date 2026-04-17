import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPublicRestaurant, getCachedPublicRestaurant } from '@/lib/queries/restaurant';
import { tryGetOwnershipBySlug } from '@/lib/auth-helpers';
import { deriveAccessStatus } from '@/lib/access-status';
import type { FullTheme } from '@/lib/validators/theme';
import ThemeProvider from '@/components/menu/ThemeProvider';
import MenuFonts from '@/components/menu/MenuFonts';
import CoverPage from '@/components/menu/CoverPage';
import UnavailableRestaurant from '@/components/menu/UnavailableRestaurant';
import PreviewBanner from '@/components/menu/PreviewBanner';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ previewDraft?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { previewDraft } = await searchParams;
  const restaurant = await getCachedPublicRestaurant(slug);

  if (!restaurant) {
    return { title: 'Ristorante non trovato', robots: { index: false } };
  }

  const title = `${restaurant.name} — Menu Digitale`;
  const description =
    restaurant.tagline ||
    restaurant.description ||
    `Scopri il menu di ${restaurant.name}.`;
  // coverUrl è l'immagine hero della copertina, più rappresentativa del
  // logo per l'anteprima social; fallback al logo se manca.
  const ogImage = restaurant.coverUrl || restaurant.logoUrl || undefined;

  return {
    title,
    description,
    alternates: {
      canonical: `/${slug}`,
    },
    // Preview admin (?previewDraft=1) non deve essere indicizzata.
    robots: previewDraft === '1' ? { index: false, follow: false } : undefined,
    openGraph: {
      title: restaurant.name,
      description,
      url: `/${slug}`,
      siteName: restaurant.name,
      locale: 'it_IT',
      type: 'website',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: restaurant.name,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function CoverPageRoute({ params, searchParams }: Props) {
  const { slug } = await params;
  const { previewDraft } = await searchParams;

  // Preview mode (owner autenticato) deve essere sempre fresco; il pubblico
  // passa per la cache taggata invalidata dalle mutation admin.
  const isPreviewRequest = previewDraft === '1';
  const restaurant = isPreviewRequest
    ? await getPublicRestaurant(slug)
    : await getCachedPublicRestaurant(slug);

  if (!restaurant) {
    notFound();
  }

  // Accesso negato (trial scaduto o ristorante sospeso) → pagina "non disponibile"
  // invece di 404: il ristorante esiste, il pubblico va avvisato in modo esplicito.
  const access = deriveAccessStatus({
    isSuspended: restaurant.isSuspended,
    suspendedReason: restaurant.suspendedReason,
    trialEndsAt: restaurant.trialEndsAt,
    stripeSubscriptionStatus: restaurant.stripeSubscriptionStatus,
    plan: restaurant.plan,
  });
  if (access.status === 'trial_expired' || access.status === 'suspended') {
    return <UnavailableRestaurant name={restaurant.name} />;
  }

  const useDraft =
    isPreviewRequest && (await tryGetOwnershipBySlug(slug)) !== null;

  const theme: FullTheme = {
    cover: useDraft ? (restaurant.themeCoverDraft ?? restaurant.themeCover) : restaurant.themeCover,
    menu: useDraft ? (restaurant.themeMenuDraft ?? restaurant.themeMenu) : restaurant.themeMenu,
    dish: useDraft ? (restaurant.themeDishDraft ?? restaurant.themeDish) : restaurant.themeDish,
  } as FullTheme;

  return (
    <ThemeProvider theme={theme}>
      <MenuFonts theme={theme} />
      {useDraft && <PreviewBanner />}
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
