import { NextResponse } from 'next/server';
import { getPublicRestaurant } from '@/lib/queries/restaurant';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const restaurant = await getPublicRestaurant(slug);

  if (!restaurant) {
    return NextResponse.json(
      { error: 'Ristorante non trovato' },
      { status: 404 }
    );
  }

  const themeCover = restaurant.themeCoverDraft ?? restaurant.themeCover;
  const themeMenu = restaurant.themeMenuDraft ?? restaurant.themeMenu;
  const themeDish = restaurant.themeDishDraft ?? restaurant.themeDish;

  return NextResponse.json({
    restaurant: {
      name: restaurant.name,
      slug: restaurant.slug,
      tagline: restaurant.tagline,
      description: restaurant.description,
      logoUrl: restaurant.logoUrl,
      coverUrl: restaurant.coverUrl,
      coverCharge: restaurant.coverCharge ? Number(restaurant.coverCharge) : null,
      allergenNote: restaurant.allergenNote,
      phone: restaurant.phone,
      city: restaurant.city,
    },
    theme: {
      cover: themeCover,
      menu: themeMenu,
      dish: themeDish,
    },
    categories: restaurant.categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      sortOrder: cat.sortOrder,
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
        tags: dish.tags,
        allergens: dish.allergens,
        isChefChoice: dish.isChefChoice,
        isAvailable: dish.isAvailable,
      })),
    })),
  });
}
