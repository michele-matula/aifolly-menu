import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPublicRestaurant, getCachedPublicRestaurant } from '@/lib/queries/restaurant';
import { tryGetOwnershipBySlug } from '@/lib/auth-helpers';
import type { FullTheme } from '@/lib/validators/theme';
import ThemeProvider from '@/components/menu/ThemeProvider';
import MenuFonts from '@/components/menu/MenuFonts';
import MenuHeader from '@/components/menu/MenuHeader';
import MenuContent from '@/components/menu/MenuContent';
import MenuFooter from '@/components/menu/MenuFooter';
import MenuViewTracker from '@/components/menu/MenuViewTracker';
import RestaurantStructuredData from '@/components/menu/RestaurantStructuredData';

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

  const title = `Menu — ${restaurant.name}`;
  const description =
    restaurant.tagline ||
    restaurant.description ||
    `Menu di ${restaurant.name}.`;
  const ogImage = restaurant.coverUrl || restaurant.logoUrl || undefined;

  return {
    title,
    description,
    alternates: {
      canonical: `/${slug}/menu`,
    },
    robots: previewDraft === '1' ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url: `/${slug}/menu`,
      siteName: restaurant.name,
      locale: 'it_IT',
      type: 'website',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function MenuPageRoute({ params, searchParams }: Props) {
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

  const useDraft =
    isPreviewRequest && (await tryGetOwnershipBySlug(slug)) !== null;

  const theme: FullTheme = {
    cover: useDraft ? (restaurant.themeCoverDraft ?? restaurant.themeCover) : restaurant.themeCover,
    menu: useDraft ? (restaurant.themeMenuDraft ?? restaurant.themeMenu) : restaurant.themeMenu,
    dish: useDraft ? (restaurant.themeDishDraft ?? restaurant.themeDish) : restaurant.themeDish,
  } as FullTheme;

  const categories = restaurant.categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    dishes: cat.dishes.map(dish => ({
      id: dish.id,
      name: dish.name,
      description: dish.description,
      imageUrl: dish.imageUrl,
      price: dish.price ? Number(dish.price) : null,
      priceLabel: dish.priceLabel,
      variants: dish.variants.map(v => ({
        id: v.id,
        label: v.label,
        price: Number(v.price),
      })),
      tags: dish.tags as string[],
      allergens: dish.allergens as string[],
      isChefChoice: dish.isChefChoice,
      isAvailable: dish.isAvailable,
    })),
  }));

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://aifolly-menu.vercel.app';

  return (
    <ThemeProvider theme={theme}>
      <MenuFonts theme={theme} />
      <MenuViewTracker slug={slug} />
      {/* JSON-LD solo sul menu pubblico (non in modalità preview admin) */}
      {!useDraft && (
        <RestaurantStructuredData
          restaurant={{
            name: restaurant.name,
            slug: restaurant.slug,
            tagline: restaurant.tagline,
            description: restaurant.description,
            address: restaurant.address,
            city: restaurant.city,
            province: restaurant.province,
            country: restaurant.country,
            phone: restaurant.phone,
            email: restaurant.email,
            website: restaurant.website,
            logoUrl: restaurant.logoUrl,
            coverUrl: restaurant.coverUrl,
          }}
          categories={categories.map(cat => ({
            name: cat.name,
            dishes: cat.dishes.map(d => ({
              name: d.name,
              description: d.description,
              price: d.price,
              priceLabel: d.priceLabel,
              imageUrl: d.imageUrl,
            })),
          }))}
          baseUrl={baseUrl}
        />
      )}
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--menu-bg)',
          maxWidth: 480,
          margin: '0 auto',
          position: 'relative',
        }}
      >
        <style>{`
          * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
          ::-webkit-scrollbar { display: none; }

          .menu-dish-card {
            animation: menuFadeUp 0.5s cubic-bezier(.16,1,.3,1) both;
          }
          .menu-dish-card:hover .menu-dish-img { transform: scale(1.06); }

          .menu-allergen-reveal {
            animation: menuRevealDown 0.3s cubic-bezier(.16,1,.3,1) both;
          }

          .menu-cat-btn {
            transition: all 0.3s ease;
            position: relative;
          }
          .menu-cat-btn::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 50%;
            width: 0;
            height: 1.5px;
            background: var(--menu-nav-active);
            transition: all 0.3s ease;
            transform: translateX(-50%);
          }
          .menu-cat-btn.active::after {
            width: 100%;
          }

          .menu-filter-btn {
            transition: all 0.25s ease;
          }
          .menu-filter-btn:hover {
            border-color: var(--filter-pill-color) !important;
            color: var(--filter-pill-active-text) !important;
          }

          .menu-hero-enter {
            opacity: 1;
            transform: translateY(0);
            transition: all 0.9s cubic-bezier(.16,1,.3,1);
          }

          @keyframes menuFadeUp {
            from { opacity: 0; transform: translateY(14px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes menuRevealDown {
            from { opacity: 0; max-height: 0; }
            to { opacity: 1; max-height: 300px; }
          }
        `}</style>

        {/* Grain texture */}
        {(theme.menu as any).showGrainTexture && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              opacity: 'var(--grain-opacity)',
              pointerEvents: 'none',
              zIndex: 999,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />
        )}

        <MenuHeader
          name={restaurant.name}
          tagline={restaurant.tagline}
          city={restaurant.city}
        />

        <MenuContent categories={categories} />

        <MenuFooter
          coverCharge={restaurant.coverCharge ? Number(restaurant.coverCharge) : null}
          allergenNote={restaurant.allergenNote}
          restaurantName={restaurant.name}
          city={restaurant.city}
        />
      </div>
    </ThemeProvider>
  );
}
